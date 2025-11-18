import { EmbedBuilder, Message, OmitPartialGroupDMChannel } from 'discord.js'
import { database } from '../database/database.js'
import { UserLogInfo } from '../database/privateTypes.js'
import { createAMLogEntry, DMRules } from './eventHelpers/tradeAutomod.js'
import { sendToChannel } from '../utils/discord.js'
import { CHANNEL_IDS, DD_SERVER_ID } from '../data/discord.js'
import { MILLISECONDS } from '../data/time.js'

const LFTAutomodChannels = [
    '460339922231099402',   // #looking-for-trade-pc
    '460340670960500737',   // #looking-for-trade-ps
    '460340942990475264',   // #looking-for-trade-xbox
]

let recentMessages: OmitPartialGroupDMChannel<Message<boolean>>[] = []
const spamMessages: OmitPartialGroupDMChannel<Message<boolean>>[] = []

export async function onMessageCreate(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.bot) return

    if (LFTAutomodChannels.includes(message.channelId) && database.userLogs) {
        let user = database.userLogs.find(user => user.get('userID') === message.author.id)
        if (!user) {
            user = await database.userLogsTable.addRow({
                lastMsgID: '',
                lastMsgTimestamp: '',
                username: message.author.username,
                userID: message.author.id,
            } as UserLogInfo)

            database.userLogs.push(user)
        }

        const timePassed = new Date(message.createdTimestamp).getTime() - Date.parse(user.get('lastMsgTimestamp'))
        const cooldownViolated = timePassed < 16 * MILLISECONDS.HOUR
        const badFormatting = !/\[W\]|\[H\]|WTB|WTS/i.test(message.content)

        if (cooldownViolated || badFormatting){
            const violation = cooldownViolated ? 'Cooldown' : 'Formatting'
            try {
                await message.delete()
                await sendToChannel(
                    CHANNEL_IDS.LFT_LOG,
                    { embeds: [createAMLogEntry(message, violation)] }
                )
                DMRules(violation, message, user)
            } catch (e){}
        } else {
            user.set('lastMsgID', message.id)
            user.set('lastMsgTimestamp', new Date(message.createdTimestamp).toString())
            user.save()
        }
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