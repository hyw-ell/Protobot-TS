import { MessageContextMenuCommandInteraction, EmbedBuilder, ContextMenuCommandBuilder, MessageFlags } from 'discord.js'
import { Translate } from '@google-cloud/translate/build/src/v2/index.js'
import { languageCodes } from '../../data/languageCodes.js'

export const command = {
	data: new ContextMenuCommandBuilder()
		.setName('translate text')
		.setType(3)
	,
	async execute(interaction: MessageContextMenuCommandInteraction) {
		const gTranslate = new Translate({
			credentials: {
				client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
				private_key: process.env.GOOGLE_PRIVATE_KEY!
			}
		})

		const textInput = interaction.targetMessage.content
        if (!textInput) {
			interaction.reply({ content: 'I could not find any text to translate.', flags: MessageFlags.Ephemeral })
			return
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral })
		
		const userLangCode = interaction.locale.match(/[a-z]+/i)![0]
		const outputLang = languageCodes.find(lang => lang.code === userLangCode)!
		const [_, translationObj] = await gTranslate.translate(textInput, outputLang.code)
		const translation = translationObj.data.translations[0]
		const detectedSourceLang = languageCodes.find(({code}) => code === translation.detectedSourceLanguage)?.name
								?? translation.detectedSourceLanguage
		
		const translateEmbed = new EmbedBuilder()
			.setColor('Blue')
			.addFields([
				{ name: `Input (${detectedSourceLang})`, value: textInput },
				{ name: `Output (${outputLang.name})`, value: translation.translatedText }
			])
			.setFooter({ text: 'Google Translate', iconURL: 'https://i.imgur.com/vcZDlz7.png' })
		
		interaction.editReply({ embeds: [translateEmbed] })
	}
}