import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { capitalize } from '../../utils/string.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { ModInfo } from '../../database/publicDBConfig.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('listmods')
		.setDescription('Generate a filtered list of mods based on acquisition, hero, and slot')
		.addStringOption(option => option.setName('obtain')
			.setDescription('The method of acquisition to filter the list by')
			.setAutocomplete(true)
		)
		.addStringOption(option => option.setName('hero')
			.setDescription('The hero to filter the list by')
			.addChoices(...Array.from(
				new Set(database.defenses.map(d => d.get('hero'))).add('All'),
				e => ({ name: e, value: e })
			))
		)
		.addStringOption(option => option.setName('slot')
			.setDescription('The slot to filter the list by')
			.addChoices(...Array.from(
				new Set(database.mods.map(m => m.get('type').replace(/Ring.+/i, 'Ring'))),
				e => ({ name: e, value: e })
			))
		)
		.addStringOption(option => option.setName('custom-filter').setDescription('Custom keyword or keyphrase to filter the list by'))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const obtain = interaction.options.getString('obtain')
		const hero = interaction.options.getString('hero')
		const slot = interaction.options.getString('slot')
		const customFilter = interaction.options.getString('custom-filter')

		if (!obtain && !hero && !slot && !customFilter) {
			await interaction.reply('You must supply at least one parameter!')
			return
		}

		function inDifficultyRange(obtain: string, mod: GoogleSpreadsheetRow<ModInfo>) {
			if (mod.get('obtain').includes(obtain)) return true

			const [ low, high ] = mod.get('obtain')
				.replace(/Campaign/i, 'Chaos 0')
				.split('-')
				.map((v: string) => parseInt(String(v.match(/(?<=Chaos )\d+/))))
			const chaosNum = parseInt(String(obtain.match(/\d+/)))
			return chaosNum >= low && chaosNum <= high
		}

		const modlist = database.mods.filter(mod => {
			const obtainMatch = obtain ? inDifficultyRange(obtain, mod) : true
			const heroMatch = hero ? mod.get('hero').includes(hero) : true
			const slotMatch = slot ? mod.get('type').includes(slot) : true
			const customMatch = customFilter ? mod.get('description').toLowerCase().includes(customFilter.toLowerCase()) : true

			return obtainMatch && heroMatch && slotMatch && customMatch
		}).map(shard => shard.get('name'))

		if (modlist.length > 50) {
			modlist.push(`and ${modlist.splice(50).length} more...`)
		}

		const modListEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle(`List of mods with filters:`)
			.setDescription(`**Custom Filters**: ${customFilter ? capitalize(customFilter) : 'N/A'}`)
			.addFields(
				{ name: 'Heroes', 		value: hero ?? 'Any', 		inline: true },
				{ name: 'Obtain', 		value: obtain ?? 'Any',		inline: true },
				{ name: 'Slot', 		value: slot ?? 'Any', 		inline: true },
				{ name: 'Mods', 		value: '```' + modlist.join(', ') + '```' }
			)
		
		interaction.reply({ embeds: [modListEmbed] })
	}
}