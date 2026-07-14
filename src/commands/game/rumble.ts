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
		// TODO Unsure of rotation schedule just yet; week number will be hard coded for now and fixed later
		// Rumble rotation changes every 5 days at 0:00 (UTC)
		const TIMESTAMP = 1756857600000 // September 3rd, 2025, 0:00 UTC, used as a reference to calculate week number
		const now = new Date()
		now.setMinutes(now.getMinutes() + now.getTimezoneOffset()) // Ensure that UTC is being used
		
		const nextDate = new Date(TIMESTAMP)
		while (nextDate <= now) { nextDate.setDate(nextDate.getDate() + 5) }
		const { days, hours, minutes, seconds } = dateDiff(nextDate, now)
		
		nextDate.setMinutes(nextDate.getMinutes() - nextDate.getTimezoneOffset()) // Convert back to local time

		// const weekNum = Math.floor((now.getTime() - TIMESTAMP) / (MILLISECONDS.DAY * 5) % 6)
		const weekNum = 5
		const rotation = ['Fire', 'Water', 'Storm', 'Earth', 'Poison', 'Gold'] // TODO this is a guess, correct later if needed
		const weekNames = rotation.map((r, i) => i === weekNum ? `**${r}**` : r)
		const rumbleIcons = rotation.map(r => IMAGE_URLS[`Rumble_Icon_${r}.png`])
		const infographics = rotation.map(r => IMAGE_URLS[`Rumble_Items_${r}.png`])
	
		const rumbleEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('__**Time until next rotation:**__')
			.setThumbnail(rumbleIcons[weekNum])
			.addFields([
				// {
				// 	name: `\u200B    ${days}           ${hours}            ${minutes}             ${seconds}`,
				// 	value: 'Days \u2009 Hours \u2009 Minutes \u2009 Seconds\n\u200b'
				// },
				// { name: 'Weekly Rotation', value: weekNames.join(' -> ') + '\n\u200b' },
				// { name: '**Next Rotation At**:', value: `<t:${nextDate.getTime()/1000}:F>`}
				{
					name: `\u200B    ?           ?             ?              ?`,
					value: 'Days \u2009 Hours \u2009 Minutes \u2009 Seconds\n\u200b'
				},
				{ name: 'Weekly Rotation', value: weekNames.join(' -> ') + '\n\u200b' },
				{ name: '**Next Rotation At**:', value: `?`}
			])
			.setImage(infographics[weekNum])
			.setFooter({ 
				iconURL: IMAGE_URLS['Luffy_Icon.png'],
				text: 'Images designed by @6.9s (𓆩Luffy𓆪⁶⁹)'
			})

		interaction.reply({ embeds: [rumbleEmbed] })
	}
}