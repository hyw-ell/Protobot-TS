import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { DOE_BACKER_ROLE_ID } from '../../data/discord.js'
import { sendToErrorChannel } from '../../utils/discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('doebacker')
        .setContexts(InteractionContextType.Guild)
		.setDescription('Check if you are eligible to receive the DOE Backer role')
	,
	async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()
		const backer = database.DOEBackers.find(b => {
            const username = b.get('discord_username')
            return (username === interaction.user.username) || (username === interaction.user.id)
        })
        
        if (backer) {
            const member = await interaction.guild!.members.fetch(interaction.user)
            const res = await member.roles.add(DOE_BACKER_ROLE_ID).catch((e) => {
                sendToErrorChannel(e, `Failed to add DOE Backer role for user: ${member.user.username}`)
                return undefined
            })
            
            if (res) {
                const timestamp = new Date().toUTCString()
                backer.set('discord_ID', member.id)
                backer.set('claim_timestamp', timestamp)
                await backer.save()
            }
            interaction.editReply('You have been granted the DOE Backer role! Thank you for being a backer of Defenders of Etheria!')
        } else {
            // TODO Add email verification
            // IDEA This could be done by showing the user a form where they can submit their email, which can then be sent to a private channel on the DD server.
            // IDEA Then, CG officials or an admin who has access to the tracking sheet can verify the email manually and double check the user's username
        }
	}
}