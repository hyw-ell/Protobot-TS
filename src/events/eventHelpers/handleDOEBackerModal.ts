import { ModalSubmitInteraction, CacheType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'
import { CHANNEL_IDS } from '../../data/discord.js'
import { database } from '../../database/database.js'
import { sendToChannel } from '../../utils/discord.js'

export async function handleDOEBackerModal(interaction: ModalSubmitInteraction<CacheType>) {
    const email = interaction.fields.getTextInputValue('emailAddress')
    const backer = database.DOEBackers.find(backer => backer.get('email') === email)

    if (!backer) {
        interaction.reply({
            content: 'The email address you entered is not associated with a DOE backer account.',
            flags: 'Ephemeral'
        })
        return
    }

    if (backer.get('role_claimed_at')) {
        interaction.reply({
            content: 'The email address you entered has already been used to claim a backer role.',
            flags: 'Ephemeral'
        })
    } else if (backer.get('email_claim_by')) {
        interaction.reply({
            content: 'The email address you entered has already been submitted for verification.',
            flags: 'Ephemeral'
        })
    } else {
        backer.set('email_claim_by', `${interaction.user.username} (${interaction.user.id})`)
        await backer.save()

        const backerEmbed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: `${interaction.user.username} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL({ extension: 'png'})
            })
            .setTitle('DOE Backer Role Request')
            .setDescription(`Role request by ${interaction.user.username} for the following backer entry:`)
            .addFields([
                { name: 'Email', value: backer.get('email'), inline: true },
                { name: 'Username', value: backer.get('discord_username'), inline: true },
                { name: 'Status', value: 'Pending', inline: true },
            ])
        
        const approveButton = new ButtonBuilder()
            .setCustomId(`approveDOEBacker: ${interaction.user.username} (${interaction.user.id})`)
            .setLabel('Approve')
            .setStyle(ButtonStyle.Success)

        const denyButton = new ButtonBuilder()
            .setCustomId(`denyDOEBacker: ${interaction.user.username} (${interaction.user.id})`)
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger)

        await sendToChannel(CHANNEL_IDS.BACKER_VERIFICATION, {
            embeds: [backerEmbed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, denyButton)]
        })

        interaction.reply('Your email has been submitted. Please wait for staff to manually verify your backer status. Status updates will be sent to you via DM.')
    }
}