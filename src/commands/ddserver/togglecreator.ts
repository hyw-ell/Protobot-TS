import { ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, roleMention, SlashCommandBuilder } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('togglecreator')
        .setContexts(InteractionContextType.Guild)
		.setDescription('Assign the Content Creator role to someone')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('The user to assign the Content Creator role to')
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Optional reason for assigning the role')
        )
	,
	async execute(interaction: ChatInputCommandInteraction) {
        const roleID = '856542647861903360'
        const targetUser = interaction.options.getUser('user', true)
        const reason = interaction.options.getString('reason')
        const targetMember = await interaction.guild!.members.fetch(targetUser)
        const action = targetMember.roles.cache.has(roleID)
            ? `✅ Removed the ${roleMention(roleID)} role from `
            : `✅ Assigned the ${roleMention(roleID)} role to `

        action.includes('Assigned')
            ? targetMember.roles.add(roleID, reason ?? undefined)
            : targetMember.roles.remove(roleID, reason ?? undefined)

        const resultEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`${action} ${targetUser} ${reason ? ` | ${reason}` : ''}`)
        
        interaction.reply({ embeds: [resultEmbed] })
	}
}