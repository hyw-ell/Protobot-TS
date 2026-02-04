import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { findBestCIMatch } from '../../utils/string.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Fetch a link for a commonly referenced resource')
		.addStringOption(option => option
			.setName('link')
			.setDescription('The name of the link of the commonly referenced resource')
			.addChoices(database.links.map(link => ({ name: link.get('name'), value: link.get('name') })))
			.setRequired(true)
		)
		.addUserOption(option => option.setName('target').setDescription('The user to mention with this command'))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('link')!
		const targettedUser = interaction.options.getUser('target') ?? undefined
		const linkName = findBestCIMatch(userInput, database.links.map(link => link.get('name'))).bestMatch.target
		const linkInfo = database.links.find(link => link.get('name') === linkName)!

		const linkEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({ name: linkInfo.get('author') })
			.setTitle(linkInfo.get('name'))
			.setURL(linkInfo.get('link'))
			.setDescription(linkInfo.get('description') ?? null)

		interaction.reply({ content: targettedUser && `*Link for ${targettedUser}:*`, embeds: [linkEmbed] })
	}
}