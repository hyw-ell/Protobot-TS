import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { processItem } from '../../commandHelpers/processPrice.js'
import { database } from '../../database/database.js'
import { rarityName } from '../../database/publicTypes.js'
import { findBestCIMatch } from '../../utils/string.js'
import { getServoVariantName } from '../../commandHelpers/getShardOrModInfo.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('price')
		.setDescription('Find recommended prices for an item in DD2')
		.addStringOption(option => option
			.setName('item')
			.setDescription('The item you are looking for the price of')
			.setAutocomplete(true)
			.setRequired(true)
		)
		.addNumberOption(option => option
			.setName('quality')
			.setDescription('The quality of the mod, out of 10')
			.setMinValue(1)
			.setMaxValue(10)
		)
		.addNumberOption(option => option
			.setName('amount')
			.setDescription('An amount of items')
			.setMinValue(1)
		)
		.addStringOption(option => option
			.setName('rarity')
			.setDescription('The rarity of the pet')
			.addChoices(['Legendary', 'Mythical', 'Epic', 'Powerful'].map(e => ({ name: e, value: e })))
		)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const amount = interaction.options.getNumber('amount') ?? 1 // Default to 1 if no amount was given
		const qualibean = interaction.options.getNumber('quality') ?? 10 // Default to 10/10 if no quality was given
		const rarity = interaction.options.getString('rarity') as rarityName ?? null
		const searchItem = interaction.options.getString('item')!
		
		const bestMatch = findBestCIMatch(searchItem, database.prices.map(i => i.get('name'))).bestMatch.target
		const target = /Chip|Servo/i.test(searchItem)
			? bestMatch
			: getServoVariantName(bestMatch)

		const itemResult = database.prices.find(i => i.get('name') === target)!
		const { name, pcPrice, psPrice, xboxPrice } = processItem(itemResult, amount, qualibean, rarity)

		const priceEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({ name: 'Price Check' })
			.setTitle(`Showing Prices for ${name}:`)
			.addFields([
				{
					name: '<:Windows:841728740333715497>  PC Price',
					value: `${pcPrice} <:gold:460345588911833088>`
				},
				{
					name: '<:PS:841728740282597426>  PlayStation Price',
					value: `${psPrice} <:gold:460345588911833088>`
				},
				{
					name: '<:Xbox:841728740303437824>  Xbox Price',
					value: `${xboxPrice} <:gold:460345588911833088>`
				},
				{
					name: '\u200b',
					value: 'Prices taken from [DD2 Market Prices](https://docs.google.com/spreadsheets/d/1GXtKq58mLDBWbhTlUhOj4GbMmJ37MZf2D8rnDHHl_R8)'
				}
			])

		interaction.reply({ embeds: [priceEmbed] })
	}
}