import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { dateDiff } from '../../utils/time.js'
import { MILLISECONDS } from '../../data/time.js'
import { IMAGE_URLS } from '../../data/assets.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('drakenfrost')
		.setDescription('Show the weapons and mods that are currently in rotation in Drakenfrost Keep')
	,
	async execute(interaction: ChatInputCommandInteraction) {
		// Drakenfrost Keep rotation changes every week on Tuesdays at 5AM (UTC)
		const WEEK_0_START = 1554786000000 // April 9th, 2019, 5am UTC, used as a reference to calculate week number
		const now = new Date()
		const weeksPassed = Math.floor((now.getTime() - WEEK_0_START) / MILLISECONDS.WEEK)
		const weekNum = weeksPassed % 4
		const nextDate = new Date(WEEK_0_START + (weeksPassed + 1) * MILLISECONDS.WEEK)
		const { days, hours, minutes, seconds } = dateDiff(nextDate, now)
		
		const infographics = [
			IMAGE_URLS['Torchbearer_Week.png'],
			IMAGE_URLS['Frozen_Path_Week.png'],
			IMAGE_URLS['Frostfire_Remnants_Week.png'],
			IMAGE_URLS['Drakenlords_Soul_Week.png'],
		]
		const DFKModNames = ['Torchbearer', 'Frozen Path', 'Frostfire Remnants', 'Drakenlord\'s Soul']
			.map((modName, i) => i === weekNum ? `**${modName}**` : modName)

		const DFKEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('__**Time until next rotation:**__')
			.setThumbnail(IMAGE_URLS['Drakenfrost_DD_Logo.png'])
			.addFields([
				{
					name: `\u200B    ${days}           ${hours}            ${minutes}             ${seconds}`,
					value: 'Days \u2009 Hours \u2009 Minutes \u2009 Seconds\n\u200B '
				},
				{ name: 'Week 1', value: DFKModNames[0],   inline: true },
				{ name: 'Week 2', value: DFKModNames[1],   inline: true },
				{ name: '\u200b', value: '\u200b', 		   inline: true },
				{ name: 'Week 3', value: DFKModNames[2],   inline: true },
				{ name: 'Week 4', value: DFKModNames[3],   inline: true },
				{ name: '\u200b', value: `\u200b\n\u200b`, inline: true },
				{ name: '**Next Rotation At**:', value: `<t:${nextDate.getTime()/1000}:F>`}
			])
			.setImage(infographics[weekNum])

		interaction.reply({ embeds: [DFKEmbed] })
	}
}