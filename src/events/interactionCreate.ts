import { CacheType, EmbedBuilder, Interaction, MessageFlags } from 'discord.js'
import { client } from '../index.js'
import { sendToChannel } from '../utils/discord.js'
import { CHANNEL_IDS, DOE_BACKER_ROLE_ID } from '../data/discord.js'
import { isBlacklisted } from '../database/helpers.js'
import { handlePostModalSubmit } from './eventHelpers/handlePostModalSubmit.js'
import { findBestCIMatch } from '../utils/string.js'
import { database } from '../database/database.js'
import { handleDOEBackerModal } from './eventHelpers/handleDOEBackerModal.js'
import { inspect } from 'util'

export async function onInteractionCreate(interaction: Interaction<CacheType>) {
    if (interaction.isCommand() || interaction.isMessageContextMenuCommand()) {
        if (isBlacklisted(interaction.user.id)) {
            interaction.reply(`${interaction.user} you are currently banned from running commands.`)
            return
        }
    
        const command = client.commands.get(interaction.commandName)
        if (command) {
            sendToChannel(CHANNEL_IDS.COMMAND_LOG, {
                content: `:scroll:  **${interaction.user.tag}** ran the command \`${interaction.commandName}\` in **${interaction.guild?.name ?? 'Direct Messages'}** (${interaction.guildId ?? interaction.channelId})`,
                files: interaction.isChatInputCommand() ? [{ attachment: Buffer.from(JSON.stringify(interaction.options, null, "\t")), name: 'options.json' }] : undefined
            })
            command.execute(interaction)
        } else {
            interaction.reply({
                content: 'Failed to load command. Please try again later.',
                flags: MessageFlags.Ephemeral
            })
        }
    }

    if (interaction.isModalSubmit()) {
        switch (interaction.customId) {
            case 'postModal': handlePostModalSubmit(interaction); break;
            case 'DOEBackerModal': handleDOEBackerModal(interaction); break;
        }
    }

    if (interaction.isButton()) {
        if (/(approve|deny)DOEBacker/.test(interaction.customId)) {
            await interaction.deferReply()

            const username = interaction.customId.match(/(?<=DOEBacker: ).+?(?= )/)!.toString()
            const userID = interaction.customId.match(/(?<=\()\d+/)!.toString()
            const user = await client.users.fetch(userID)
            const updatedStatusEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            let statusMessage = ''
            
            if (interaction.customId.includes('approve')) {
                const member = await interaction.guild!.members.fetch(userID)
                const result = await member.roles.add(DOE_BACKER_ROLE_ID).catch((e) => {
                    sendToChannel(CHANNEL_IDS.BACKER_VERIFICATION, {
                        content: `Failed to add DOE Backer role for user: ${member.user.username}`,
                        files: [{ attachment: Buffer.from(inspect(e, { depth: null })), name: 'error.ts' }]
                    })
                    return undefined
                })

                if (!result) {
                    interaction.reply(`Failed to add DOE Backer role for user: ${username}`)
                    return
                }

                statusMessage = 'You have been granted the DOE Backer role. Thank you for being a backer of Defenders of Etheria!'
                updatedStatusEmbed
                    .setColor('Green')
                    .spliceFields(2, 1, { name: 'Status', value: `Approved by ${interaction.user}`, inline: true })

                const timestamp = new Date().toUTCString()
                const backer = database.DOEBackers.find(backer => backer.get('email_claim_by') === `${username} (${userID})`)!
                backer.set('discord_ID', userID)
                backer.set('role_claimed_at', timestamp)
                await backer.save()
            } else {
                statusMessage = 'Your manual email verification request for the DOE Backer role has been denied. Please contact [...] if you have any further questions.'
                updatedStatusEmbed
                    .setColor('Red')
                    .spliceFields(2, 1, { name: 'Status', value: `Rejected by ${interaction.user}`, inline: true })
            }
            
            interaction.update({ embeds: [updatedStatusEmbed] })
            user.send(statusMessage).catch(e => {
                sendToChannel(CHANNEL_IDS.BACKER_VERIFICATION, {
                    content: `Could not send DOE Backer status message to user: ${interaction.user.username}`,
                    files: [{ attachment: Buffer.from(inspect(e, { depth: null })), name: 'error.ts' }]
                })
            })
        }
    }
    
    if (interaction.isAutocomplete()) {
        const focusedOption = interaction.options.getFocused(true)
        let allChoices: string[] = []

        switch (interaction.commandName) {
            case 'shard': 
                allChoices = database.shards.map(s => s.get('name'))
                break
            case 'mod':
                allChoices = database.mods.map(m => m.get('name'))
                break
            case 'defense':
                allChoices = database.defenses.map(d => d.get('name'))
                break
            case 'price':
                if (focusedOption.name !== 'item') return
                allChoices = database.prices.map(i => i.get('name'))
                break
        }
        
        if (!focusedOption.value) { allChoices = allChoices.slice(0, 10) }
        const ratedChoices = findBestCIMatch(focusedOption.value, allChoices).ratings
        const bestChoices = ratedChoices.sort((a, b) => b.rating - a.rating)
        const results = bestChoices.slice(0, 10).map(({target}) => ({ name: target, value: target}))

        interaction.respond(results).catch(() => {})
    }
}
