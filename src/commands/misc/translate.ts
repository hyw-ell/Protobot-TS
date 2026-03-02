import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { languageCodes } from '../../data/languageCodes.js'
import { findBestCIMatch } from '../../utils/string.js'
import { Translate } from '@google-cloud/translate/build/src/v2/index.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('translate')
		.setDescription('Translates text to another language. (Translates to your set language by default)')
		.addStringOption(option => option
			.setName('text')
			.setDescription('The text to be translated')
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName('from')
			.setDescription('The language of the text. (Language will be auto-detected otherwise)')
		)
		.addStringOption(option => option
			.setName('to')
			.setDescription('The language to translate the text to')
		)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()

		const gTranslate = new Translate({
			credentials: {
				client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
				private_key: process.env.GOOGLE_PRIVATE_KEY!
			}
		})

		const textInput = interaction.options.getString('text')!
		const sourceLangInput = interaction.options.getString('from')
		const outputLangInput = interaction.options.getString('to')
		
		const userLangCode = interaction.locale.match(/[a-z]+/i)![0]
		const sourceLangBestMatch = sourceLangInput && findBestCIMatch(sourceLangInput, languageCodes.map(c => c.name)).bestMatch.target
		const outputLangBestMatch = outputLangInput && findBestCIMatch(outputLangInput, languageCodes.map(c => c.name)).bestMatch.target
		const sourceLang = languageCodes.find(lang => lang.name === sourceLangBestMatch)
		const outputLang = languageCodes.find(lang => lang.name === outputLangBestMatch)
						?? languageCodes.find(lang => lang.code === userLangCode)!

		const translationOptions = { from: sourceLang?.code, to: outputLang.code }
		const [_, translationObj] = await gTranslate.translate(textInput, translationOptions)
		const translation = translationObj.data.translations[0]
		const detectedSourceLang = languageCodes.find(({code}) => code === translation.detectedSourceLanguage)?.name
								?? translation.detectedSourceLanguage
		
		const translateEmbed = new EmbedBuilder()
			.setColor('Blue')
			.addFields([
				{ name: `Input (${sourceLang?.name ?? detectedSourceLang})`, value: textInput },
				{ name: `Output (${outputLang.name})`, value: translation.translatedText }
			])
			.setFooter({ text: 'Google Translate', iconURL: 'https://i.imgur.com/vcZDlz7.png' })
		
		interaction.editReply({ embeds: [translateEmbed] })
	}
}