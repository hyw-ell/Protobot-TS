import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { showShard } from '../../commandHelpers/showShardOrMod.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('shard')
		.setDescription('Fetch information about a shard in DD2')
        .addStringOption(option => option
			.setName('name')
			.setDescription('The name of the shard')
			.setAutocomplete(true)
			.setRequired(true)
		)
    ,
	async execute(interaction: ChatInputCommandInteraction) {
        showShard(interaction)
	}
}