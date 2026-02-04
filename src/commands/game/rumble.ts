import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { dateDiff } from '../../utils/time.js'
import { MILLISECONDS } from '../../data/time.js'
import { attachments } from '../../data/assets.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('rumble')
		.setDescription('Show what items are available from Elemental Rumble this week')
	,
	async execute(interaction: ChatInputCommandInteraction) {
		// Rumble rotation changes on Wednesday at 0:00 (UTC)
		const TIMESTAMP = 1756857600000 // September 3rd, 2025, 0:00 UTC, used as a reference to calculate week number
		const now = new Date()
		now.setMinutes(now.getMinutes() + now.getTimezoneOffset()) // Ensure that UTC is being used
		
		const nextDate = new Date( // Gets the next Wednesday at 0:00 (UTC)
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + (10 - now.getUTCDay()) % 7,
			0, 0, 0, 0
		)
		if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 7)
		
		const { days, hours, minutes, seconds } = dateDiff(nextDate, now)
		
		nextDate.setMinutes(nextDate.getMinutes() - nextDate.getTimezoneOffset()) // Convert back to local time

		const weekNum = Math.floor((now.getTime() - TIMESTAMP) / MILLISECONDS.WEEK % 4)
		const weekNames = ['Fire', 'Water', 'Storm', 'Earth'].map((w, i) => i === weekNum ? `**${w}**` : w)
		const rumbleIcon = attachments['Elemental_Rumble_Icon.png']
		const infographics = [
			attachments['Fire_Week_Items.png'],
			attachments['Water_Week_Items.png'],
			attachments['Storm_Week_Items.png'],
			attachments['Earth_Week_Items.png'],
		]
	
		const rumbleEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('__**Time until next rotation:**__')
			.setThumbnail(`attachment://${rumbleIcon.name}`)
			.addFields([
				{
					name: `\u200B    ${days}           ${hours}            ${minutes}             ${seconds}`,
					value: 'Days \u2009 Hours \u2009 Minutes \u2009 Seconds\n\u200b'
				},
				{ name: 'Weekly Rotation', value: weekNames.join(' -> ') + '\n\u200b' },
				{ name: '**Next Rotation At**:', value: `<t:${nextDate.getTime()/1000}:F>`}
			])
			.setImage(`attachment://${infographics[weekNum].name}`)

		interaction.reply({
			embeds: [rumbleEmbed],
			files: [rumbleIcon, infographics[weekNum]]
		})
	}
}