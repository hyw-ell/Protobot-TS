import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { capitalize } from '../../utils/string.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('listshards')
		.setDescription('Generate a filtered list of shards based on acquisition, hero, and slot')
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
			.addChoices({ name: 'Armor', value: 'Helmet, Chestplate, Gloves, Boots' })
			.addChoices(...Array.from(
				new Set(database.shards.map(d => d.get('type'))),
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

		const shardlist = database.shards.filter(shard => {
			const obtainMatch = obtain ? shard.get('obtain').includes(obtain) : true
			const heroMatch = hero ? shard.get('hero').includes(hero) : true
			const slotMatch = slot ? shard.get('type').includes(slot) : true
			const customMatch = customFilter ? shard.get('description').toLowerCase().includes(customFilter.toLowerCase()) : true
			const removedShard = shard.get('name').includes('(removed)')

			return obtainMatch && heroMatch && slotMatch && customMatch && !removedShard
		}).map(shard => shard.get('name'))
		
		if (shardlist.length > 50) {
			shardlist.push(`and ${shardlist.splice(50).length} more...`)
		}
		
		const shardListEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle(`List of shards with filters:`)
			.setDescription(`**Custom Filters**: ${customFilter ? capitalize(customFilter) : 'N/A'}`)
			.addFields(
				{ name: 'Heroes', 		value: hero ?? 'Any', 		inline: true },
				{ name: 'Obtain',	 	value: obtain ?? 'Any', 	inline: true },
				{ name: 'Slot', 		value: slot ?? 'Any', 		inline: true },
				{ name: 'Shards', 		value: '```' + shardlist.join(', ') + '```' }
			)
		
		interaction.reply({ embeds: [shardListEmbed] })
	}
}