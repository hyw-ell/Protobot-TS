import { ModalSubmitInteraction, CacheType } from 'discord.js'
import { CHANNEL_IDS, DOE_BACKER_ROLE_ID } from '../../data/discord.js'
import { database } from '../../database/database.js'
import { sendToChannel } from '../../utils/discord.js'
import { inspect } from 'util'

export async function handleDOEBackerModal(interaction: ModalSubmitInteraction<CacheType>) {
    const email = interaction.fields.getTextInputValue('backerEmail').toLowerCase()
    const backerNumber = interaction.fields.getTextInputValue('backerNumber')
    const backer = database.DOEBackers.find(backer => backer.get('email').toLowerCase() === email)

    if (!backer) {
        interaction.reply({
            content: 'The email address you entered is not associated with a DOE backer account. Please contact an admin for further assistance.',
            flags: 'Ephemeral'
        })
        return
    }

    if (backer.get('role_claimed_at')) {
        interaction.reply({
            content: 'The email address you entered has already been used to claim a backer role.',
            flags: 'Ephemeral'
        })
    } else if (backer.get('backer_number') === backerNumber) {
        const member = await interaction.guild!.members.fetch(interaction.user)
        const result = await member.roles.add(DOE_BACKER_ROLE_ID).catch((e) => {
            sendToChannel(CHANNEL_IDS.BACKER_VERIFICATION, {
                content: `Failed to add DOE Backer role for user: ${member.user.username}`,
                files: [{ attachment: Buffer.from(inspect(e, { depth: null })), name: 'error.ts' }]
            })
            return undefined
        })
        
        if (result && !backer.get('role_claimed_at')) {
            const timestamp = new Date().toUTCString()
            backer.set('discord_ID', member.id)
            backer.set('role_claimed_at', timestamp)
            await backer.save()
        }
        interaction.reply('You have been granted the DOE Backer role! Thank you for being a backer of Defenders of Etheria!')
    } else {
        interaction.reply({
            content: 'The backer number you entered is incorrect. Please contact an admin for further assistance.',
            flags: 'Ephemeral'
        })
    }
}