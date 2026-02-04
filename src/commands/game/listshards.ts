import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { capitalize } from '../../utils/string.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('listshards')
		.setDescription('List all shards equippable on a given slot for a given hero from a given difficulty')
		.addStringOption(option => option.setName('difficulty')
			.setDescription('The difficulty to filter the list by')
			.addChoices(...['Campaign', 'Chaos 1', 'Chaos 2', 'Chaos 3', 'Chaos 4', 'Chaos 5', 'Chaos 6', 'Chaos 7', 'Chaos 8', 'Chaos 9', 'Chaos 10', 'Survival'].map(e => ({name: e, value: e}))))
		.addStringOption(option => option.setName('hero')
			.setDescription('The hero to filter the list by')
			.addChoices(...[
				'All', 			'Monk', 		'Apprentice', 	'Huntress', 	'Squire', 
				'Ev2', 			'Lavamancer', 	'Abyss Lord', 	'Adept', 		'Gunwitch', 
				'Initiate', 	'Dryad', 		'Barbarian', 	'Mystic', 		'Mercenary', 
				'Countess', 	'Engineer', 	'Hunter',		'Aquarion', 	'Frostweaver'
			].map(e => ({name: e, value: e}))))
		.addStringOption(option => option.setName('slot')
			.setDescription('The slot to filter the list by')
			.addChoices({name: 'Armor', value: 'Helmet, Chestplate, Gloves, Boots'})
			.addChoices(...['Relic', 'Weapon', 'Shield', 'Helmet', 'Chestplate', 'Gloves', 'Boots'].map(e => ({name: e, value: e}))))
		.addStringOption(option => option.setName('custom-filter').setDescription('A custom filter to apply to the list'))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const diff = interaction.options.getString('difficulty')
		const hero = interaction.options.getString('hero')
		const slot = interaction.options.getString('slot')
		const customFilter = interaction.options.getString('custom-filter')
		let dropFilter: RegExpMatchArray = ['']
		let heroFilter: RegExpMatchArray = ['']
		let typeFilter: RegExpMatchArray = ['']
		let output = database.shards

		if (!hero && !slot && !diff && !customFilter) return await interaction.reply('You must supply at least one parameter!')

		// Possible Filters
		if (diff){
			dropFilter = diff.match(/\b(?:Campaign|Survival|Chaos \d+)\b/ig)!
			output = output.filter(shard => dropFilter?.some(drop => capitalize(drop) === shard.get('drop')))
		}
	
		if (hero){
			heroFilter = hero.match(/\b(?:All|Squire|Apprentice|Huntress|Monk|Abyss Lord|EV2|Gunwitch|Lavamancer|Mystic|Dryad|Initiate|Adept|Barbarian|Mercenary|Countess|Engineer|Hunter|Aquarion|Frostweaver)\b/ig)!
			output = output.filter(shard => heroFilter?.some(hero => shard.get('hero')?.includes(capitalize(hero))))
		}
	
		if (slot){
			typeFilter = slot.match(/\b(?:Relic|Weapon|Shield|Armor|Helmet|Chestplate|Gloves|Boots)\b/ig)!
			output = output.filter(shard => typeFilter?.some(type => capitalize(type) === shard.get('type')))
		}
	
		if (customFilter){ //If there are additional parameters remaining, search the description
			output = output.filter(shard => shard.get('description')?.toLowerCase().includes(customFilter!.toLowerCase()))
		}
	
		let shardlist = output.filter(shard => !shard.get('name')?.includes('(removed)')).map(shard => shard.get('name'))
		if (shardlist.length >= 55){
			const length = shardlist.length - 55
			shardlist = shardlist.slice(0, 55)
			shardlist.push(`and ${length} more...`)
		}
		const difficulty = diff ? dropFilter.map(d => capitalize(d)).join(', ') : 'Any'
		const heroes = hero ? heroFilter.map(h => capitalize(h)).join(', ') : 'Any'
		const types = slot ? typeFilter.map(t => capitalize(t)).join(', ') : 'Any'
		const customfilter = customFilter ? capitalize(customFilter) : 'N/A'
		
		const slEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle(`List of shards with filters:`)
			.setDescription(`**Custom Filters**: ${customfilter}`)
			.addFields(
				{name: 'Heroes', value: heroes, inline: true},
				{name: 'Difficulty', value: difficulty, inline: true},
				{name: 'Type(s)', value: types, inline: true},
				{name: 'Shards', value: '```' + shardlist.join(', ') + '```'}
			)
		
		await interaction.reply({embeds: [slEmbed], allowedMentions: {repliedUser: false}})
	}
}