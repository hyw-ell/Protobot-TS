import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('faq')
		.setDescription('Fetch an answer to a frequently asked question')
		.addStringOption(option =>
			option
				.setName('faq')
				.setDescription('The alias for the frequently asked question')
				.setRequired(true)
				.addChoices(...database.faq.map(faq => ({name: faq.get('name'), value: faq.get('name')})))
		)
		.addUserOption(option => option.setName('target').setDescription('The user to mention with this command'))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('faq')!
		const targettedUser = interaction.options.getUser('target') ?? ''
		const faqText = database.faq.find(f => f.get('name') === userInput)!.get('value')
		const userText = targettedUser && `### Answer for ${targettedUser}:\n`
		await interaction.reply(userText + faqText)
	}
}