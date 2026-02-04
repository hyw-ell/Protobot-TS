import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { showMod } from '../../commandHelpers/showShardOrMod.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Fetch information about a mod in DD2')
		.addStringOption(option => option
			.setName('name')
			.setDescription('The name of the mod')
			.setAutocomplete(true)
			.setRequired(true)
		)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		showMod(interaction)
	}
}