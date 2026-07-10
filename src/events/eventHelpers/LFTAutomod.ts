import { codeBlock, EmbedBuilder, Message, time } from 'discord.js'
import { MILLISECONDS } from '../../data/time.js'
import { truncateString } from '../../utils/string.js'

export const LFTAutomodConfig = {
    cooldown: 16 * MILLISECONDS.HOUR,
    channels: {
        '460339922231099402': 'last_pc_msg_at',     // #looking-for-trade-pc
        '460340670960500737': 'last_ps_msg_at',     // #looking-for-trade-ps
        '460340942990475264': 'last_xbox_msg_at',   // #looking-for-trade-xbox
    }
} as const

/**
 * Creates an embed logging the deletion of the offending message
 * @param msg - Message which triggered the automod
 */
export function createAMLogEntry(msg: Message, reason: string) {
    if (!msg.content) msg.content = 'No Content'

    return new EmbedBuilder()
        .setColor('Red')
        .setAuthor({
            name: `${msg.author.username}`,
            iconURL: msg.author.displayAvatarURL({ extension: 'png' })
        })
        .setDescription(`Message sent by ${msg.author} deleted in ${msg.channel}`)
        .addFields([
            { name: 'Content', value: truncateString(msg.content, 1024) },
            { name: 'Reason', value: `Trade Channel Rule Violation: ${reason}` }
        ])
        .setFooter({ text: `Author: ${msg.author.id}` })
        .setTimestamp(new Date())
}

/**
 * Sends a detailed notice to a user regarding the trade chat rule they violated.
 * @param violation - The rule that was violated
 * @param message - The offending message
 * @param lastMsgTimestamp
 */
export function warnLFTUser(violation: 'Cooldown' | 'Formatting', message: Message, lastMsgTimestamp: number) {
    const violationDetails = (violation === 'Cooldown')
        ? 'You cannot post more than once per 16 hours!'
        : 'Your Looking-For-Trade post did not follow the correct format!'
    const description = 'Please review the Looking-For-Trade channel rules (pinned in all Looking-For-Trade channels).'

    const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle(violationDetails)
        .setDescription(description)
        .addFields({ name: 'This is what you posted:', value: codeBlock(truncateString(message.content, 1024)) })

    if (violation === 'Cooldown') {
        const cooldownEnd = time((lastMsgTimestamp + LFTAutomodConfig.cooldown) / 1000)
        embed.addFields({ name: 'You may post again after:', value: cooldownEnd })
    }
    
    message.author.send({ embeds: [ embed ] })
}