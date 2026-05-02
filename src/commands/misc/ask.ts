import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { capFirstLetter } from '../../utils/string.js'
import { IMAGE_URLS } from '../../data/assets.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Ask Protobot a yes or no question')
		.addStringOption(option => option.setName('question').setDescription("The question you'd like to know the answer to").setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const question = capFirstLetter(interaction.options.getString('question')!)
		const yesAnswers = ['Yes', 'Without a doubt', 'Yes, definitely', 'Most Likely', 'Signs point to yes', 'Certainly', 'As I see it, yes']
		const noAnswers = ['No', 'Definitely not', 'Probably', 'Signs point to no', 'As I see it, no']
		const answers = yesAnswers.concat(noAnswers)
		const rand = Math.floor(Math.random() * Math.floor(answers.length))

		const answerEmbed = new EmbedBuilder()
			.setAuthor({
				iconURL: IMAGE_URLS['Red_Question_Mark.png'],
				name: 'Question: ' + question + (/\?$/.test(question) ? '' : '?')
			})
			.setDescription(`<@${interaction.user.id}> ${answers[rand]}`)
			.setColor('Blue')
		await interaction.reply({embeds: [answerEmbed]})
	}
}