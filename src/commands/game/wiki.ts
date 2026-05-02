import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import axios from 'axios'
import { parse } from 'node-html-parser'
import { IMAGE_URLS } from '../../data/assets.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('Search the wiki')
		.addStringOption(option => option.setName('search').setDescription('Your search term').setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('search')!
		let {data} = await axios.get(`https://wiki.dungeondefenders2.com/index.php?search=${userInput}`)
		
		if (!/View the/.test(data) && /data-serp-pos/.test(data)) {
			data = await axios.get('https://wiki.dungeondefenders2.com/index.php?search=' + data.match(/(?<=data-serp-pos="1">).+?(?=<\/a>)/).toString())
		}
		
		const document = parse(data)
		const title = document.getElementById('firstHeading')!.textContent
		const url = document.querySelector('[title="View the content page [c]"]')?.getAttribute('href') ?? `/index.php?search=${userInput.replace(/\s/g, '+')}`
		const imgURL = document.getElementsByTagName('img')[0].getAttribute('src')!
		let description = document.getElementsByTagName('p')[0]?.textContent.trim() || document.getElementsByTagName('li')[0]?.textContent.trim() || 'No description available'
		
		if (/Lore/.test(data)) description = data.match(/(?<=<b>Lore<\/b>: ).+?(?=\n)/s)!.toString()
		else if (/(Ability|Defense) Statistics/.test(data)) description = document.querySelector('#mw-content-text > table.floatright > tr:nth-child(3) > td')!.textContent.trim()

		const wikiEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Dungeon Defenders 2 Wiki', iconURL: IMAGE_URLS['Huntress_Icon.png'] })
			.setTitle(title)
			.setURL(`https://wiki.dungeondefenders2.com${url}`)
			.setDescription(description.length > 350 ? `${description.substring(0, 350)}...` : description)
			.setImage(imgURL.includes('mediawiki') ? null : `https://wiki.dungeondefenders2.com${imgURL}`)
			.setThumbnail(IMAGE_URLS['DD2_Logo.png'])
			.setColor('Blue')

		await interaction.reply({embeds: [wikiEmbed]})
	}
}