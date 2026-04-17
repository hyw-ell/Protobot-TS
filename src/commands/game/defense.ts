import { ChatInputCommandInteraction, ActionRowBuilder, SlashCommandBuilder, ComponentType, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js'
import { defenseBuildData } from '../../database/defenseBuilds.js'
import { findBestCIMatch } from '../../utils/string.js'
import { generateBuildImage } from '../../commandHelpers/generateBuildImage.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('defense')
		.setDescription('Fetch a defense build from Sheet of Sheets')
		.addStringOption(option => option
			.setName('name')
			.setDescription('The name of the defense')
			.setAutocomplete(true)
			.setRequired(true)
		)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const nameInput = interaction.options.getString('name')!
		const defenseName = findBestCIMatch(nameInput, defenseBuildData.map(({name}) => name)).bestMatch.target
		const roleOptions = [...new Set(
			defenseBuildData
				.filter(({name}) => name === defenseName)
				.map(defense => defense.role)
		)]

		const defenseEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({
				name: 'Build from Sheet of Sheets',
				url: 'https://docs.google.com/spreadsheets/d/1Grd0H2iaNy1I-CPDKjE1uo5_qHNCf9WyQlnEB4u-yOg/htmlview?gid=632362064'
			})
		
		if (roleOptions.length === 1) {
			const defense = defenseBuildData.find(({name, role}) => name === defenseName && role === roleOptions[0])!
			const defenseImage = await generateBuildImage(defense)
			defenseEmbed.setImage(`attachment://${defenseImage.name}`)

			interaction.reply({ embeds: [defenseEmbed], files: [defenseImage] })
			return
		}
		
		const menu = new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('Defense Build Selector')
					.setPlaceholder('Select a build')
					.addOptions(roleOptions.map(option => ({ label: option, value: option })))
			)
		
		const response = await interaction.reply({
			content: `Please select a **${defenseName}** build:`,
			components: [menu]
		})

		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			filter: msg => msg.user.id === interaction.user.id,
			time: 30000,
			max: 1
		})

		collector.on('collect', async i => {
			const defense = defenseBuildData.find(({name, role}) => name === defenseName && role === i.values[0])!

			const [loadingIndicator, defenseImage] = await Promise.all([
				i.update({
					content: `Loading your **${defense.name}** (${defense.role}) build <a:loading:763160594974244874>`,
					components: []
				}),
				generateBuildImage(defense)
			])

			loadingIndicator.edit({
				content: null,
				embeds: [defenseEmbed.setImage(`attachment://${defenseImage.name}`)],
				files: [defenseImage]
			})
		})
	}
}