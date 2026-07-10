import { EmbedBuilder, Message, OmitPartialGroupDMChannel } from 'discord.js'
import { database } from '../database/database.js'
import { createAMLogEntry, warnLFTUser, LFTAutomodConfig } from './eventHelpers/tradeAutomod.js'
import { sendToChannel } from '../utils/discord.js'
import { CHANNEL_IDS, DD_SERVER_ID } from '../data/discord.js'
import { MILLISECONDS } from '../data/time.js'

let recentMessages: OmitPartialGroupDMChannel<Message<boolean>>[] = []
const spamMessages: OmitPartialGroupDMChannel<Message<boolean>>[] = []

export async function onMessageCreate(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.bot) return

    if (message.channelId in LFTAutomodConfig.channels && database.userLogs) {
        let user = database.userLogs.find(user => user.get('user_ID') === message.author.id)
        if (!user) {
            user = await database.userLogsTable.addRow({
                username: message.author.username,
                user_ID: message.author.id,
            })

            database.userLogs.push(user)
        }
        
        const lastMsgAt = LFTAutomodConfig.channels[message.channelId as keyof typeof LFTAutomodConfig.channels]
        const lastMsgTimestamp = Date.parse(user.get(lastMsgAt))
        const timePassed = message.createdAt.getTime() - lastMsgTimestamp
        const cooldownViolated = timePassed < LFTAutomodConfig.cooldown
        const badFormatting = !/\[W\]|\[H\]|WTB|WTS/i.test(message.content)

        if (cooldownViolated || badFormatting){
            const violation = cooldownViolated ? 'Cooldown' : 'Formatting'
            try {
                await message.delete()
                await sendToChannel(
                    CHANNEL_IDS.LFT_LOG,
                    { embeds: [createAMLogEntry(message, violation)] }
                )
                warnLFTUser(violation, message, lastMsgTimestamp)
            } catch (e){}
        } else {
            user.set(lastMsgAt, message.createdAt.toString())
            user.save()
        }
    }

    if (message.channelId === CHANNEL_IDS.DD_ANNOUNCEMENTS) {
        message.forward(CHANNEL_IDS.JN_DD_NEWS)
    }

    // if (message.guildId === DD_SERVER_ID) {
    //     recentMessages.push(message)
    //     if (recentMessages.length > 25) recentMessages = recentMessages.splice(5)
    //     for (const msg of recentMessages) {
    //         const identicalMessages = recentMessages.filter(m => m.content === msg.content)
    //         if (identicalMessages.length > 1) {
    //             spamMessages.push(msg)
    //         }
    //     }

    //     for (const msg of spamMessages) {
    //         msg.delete()
    //         if (msg.member?.moderatable || msg.member?.isCommunicationDisabled()) { continue }

    //         const logEmbed = new EmbedBuilder()
    //             .setColor('Red')
    //             .setAuthor({
    //                 name: msg.author.username,
    //                 iconURL: msg.author.displayAvatarURL({ extension: 'png' })
    //             })
    //             .setDescription(`${msg.author} was timed out for 1 day.`)
    //             .addFields([
    //                 {
    //                     name: 'Content',
    //                     value: truncateString(msg.content, 1024)
    //                 },
    //                 { name: 'Reason', value: 'Posting identical messages in multiple channels.' }
    //             ])
    //             .setFooter({text: `User ID: ${msg.author.id} | Message ID: ${msg.id}`})
    //             .setTimestamp(new Date())

    //         msg.member?.timeout(MILLISECONDS.DAY, 'Posting identical messages in multiple channels.')
    //         sendToChannel(CHANNEL_IDS.AUTOMOD, { embeds: [logEmbed] })
    //     }
    // }
}