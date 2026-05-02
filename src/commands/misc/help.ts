import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { client } from '../../index.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription("Shows a link to Protobot's website and Support Discord Server")
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const helpEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('Protobot Command List')
			.setDescription('The complete list of commands for Protobot can be found [here](https://hyw-ell.github.io/Protobot/commands.html)')
			.setThumbnail(client.user?.displayAvatarURL({ extension: 'png' }) ?? null)
			.addFields({
				name: '\u200b',
				value: 'If you\'d like to talk to my creator about anything, please join the [support server](https://discord.gg/YtwzVSp).'
			})
    	return interaction.reply({embeds: [helpEmbed]})
	}
}