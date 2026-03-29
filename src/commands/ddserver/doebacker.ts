import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { CHANNEL_IDS, DOE_BACKER_ROLE_ID } from '../../data/discord.js'
import { sendToChannel } from '../../utils/discord.js'
import { DOEBackerModal } from '../../commandHelpers/doebackerModal.js'
import { inspect } from 'util'

export const command = {
	data: new SlashCommandBuilder()
		.setName('doebacker')
        .setContexts(InteractionContextType.Guild)
		.setDescription('Check if you are eligible to receive the DOE Backer role')
	,
	async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const member = await interaction.guild!.members.fetch(interaction.user)
        if (member.roles.cache.has(DOE_BACKER_ROLE_ID)) {
            interaction.editReply('You already have the DOE Backer role!')
            return
        }

		const backer = database.DOEBackers.find(b => {
            const username = b.get('discord_username')
            return (username === interaction.user.username) || (username === interaction.user.id)
        })
        
        if (backer) {
            const result = await member.roles.add(DOE_BACKER_ROLE_ID).catch((e) => {
                sendToChannel(CHANNEL_IDS.BACKER_VERIFICATION, {
                    content: `Failed to add DOE Backer role for user: ${member.user.username}`,
                    files: [{ attachment: Buffer.from(inspect(e, { depth: null })), name: 'error.ts' }]
                })
                return undefined
            })
            
            if (result) {
                const timestamp = new Date().toUTCString()
                backer.set('discord_ID', member.id)
                backer.set('role_claimed_at', timestamp)
                await backer.save()
            }
            interaction.editReply('You have been granted the DOE Backer role! Thank you for being a backer of Defenders of Etheria!')
        } else {
            interaction.showModal(DOEBackerModal)
        }
	}
}