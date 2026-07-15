import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { dateDiff } from '../../utils/time.js'
import { MILLISECONDS } from '../../data/time.js'
import { IMAGE_URLS } from '../../data/assets.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('rumble')
		.setDescription('Show what items are available from Elemental Rumble this week')
	,
	async execute(interaction: ChatInputCommandInteraction) {
		// Rumble rotation changes every "week" (5 days) at 0:00 (UTC)
		const WEEK_0_START = 1781827200000 // June 19th, 2026 at 0:00 UTC, used as a reference to calculate week number
		const now = new Date()
		const weeksPassed = Math.floor((now.getTime() - WEEK_0_START) / (MILLISECONDS.DAY * 5))
		const weekNum = weeksPassed % 6
		const nextDate = new Date(WEEK_0_START + (weeksPassed + 1) * MILLISECONDS.DAY * 5)
		const { days, hours, minutes, seconds } = dateDiff(nextDate, now)
		
		const rotation = ['Fire', 'Water', 'Storm', 'Earth', 'Poison', 'Gold']
		const weekNames = rotation.map((r, i) => i === weekNum ? `**${r}**` : r)
		const rumbleIcons = rotation.map(r => IMAGE_URLS[`Rumble_Icon_${r}.png`])
		const infographics = rotation.map(r => IMAGE_URLS[`Rumble_Items_${r}.png`])
	
		const rumbleEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('__**Time until next rotation:**__')
			.setThumbnail(rumbleIcons[weekNum])
			.addFields([
				{
					name: `\u200B    ${days}           ${hours}            ${minutes}             ${seconds}`,
					value: 'Days \u2009 Hours \u2009 Minutes \u2009 Seconds\n\u200b'
				},
				{ name: 'Weekly Rotation', value: weekNames.join(' -> ') + '\n\u200b' },
				{ name: '**Next Rotation At**:', value: `<t:${nextDate.getTime()/1000}:F>`}
			])
			.setImage(infographics[weekNum])
			.setFooter({ 
				iconURL: IMAGE_URLS['Luffy_Icon.png'],
				text: 'Images designed by @6.9s (𓆩Luffy𓆪⁶⁹)'
			})

		interaction.reply({ embeds: [rumbleEmbed] })
	}
}