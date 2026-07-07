import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { capitalize } from '../../utils/string.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { ModInfo } from '../../database/publicDBConfig.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('listmods')
		.setDescription('List all mods equippable on a given slot for a given hero from a given difficulty')
		.addStringOption(option => option.setName('difficulty')
			.setDescription('The difficulty to filter the list by')
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
		const difficulty = interaction.options.getString('difficulty')
		const hero = interaction.options.getString('hero')
		const slot = interaction.options.getString('slot')
		const customFilter = interaction.options.getString('custom-filter')

		if (!difficulty && !hero && !slot && !customFilter) {
			await interaction.reply('You must supply at least one parameter!')
			return
		}

		function inDifficultyRange(difficulty: string, mod: GoogleSpreadsheetRow<ModInfo>) {
			if (mod.get('drop').includes(difficulty)) return true

			const [ low, high ] = mod.get('drop')
				.replace(/Campaign/i, 'Chaos 0')
				.split('-')
				.map((v: string) => parseInt(String(v.match(/(?<=Chaos )\d+/))))
			const difficultyNum = parseInt(String(difficulty.match(/\d+/)))
			return difficultyNum >= low && difficultyNum <= high
		}

		const modlist = database.mods.filter(mod => {
			const diffMatch = difficulty ? inDifficultyRange(difficulty, mod) : true
			const heroMatch = hero ? mod.get('hero').includes(hero) : true
			const slotMatch = slot ? mod.get('type').includes(slot) : true
			const customMatch = customFilter ? mod.get('description').toLowerCase().includes(customFilter.toLowerCase()) : true

			return diffMatch && heroMatch && slotMatch && customMatch
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
				{ name: 'Difficulty', 	value: difficulty ?? 'Any', inline: true },
				{ name: 'Slot', 		value: slot ?? 'Any', 		inline: true },
				{ name: 'Mods', 		value: '```' + modlist.join(', ') + '```' }
			)
		
		interaction.reply({ embeds: [modListEmbed] })
	}
}