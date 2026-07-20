import { Message, EmbedBuilder, AttachmentBuilder, channelMention } from 'discord.js'
import { CHANNEL_IDS } from '../../data/discord.js'
import { MILLISECONDS } from '../../data/time.js'
import { sendToChannel } from '../../utils/discord.js'
import { truncateString } from '../../utils/string.js'

const recentMessages: Message[] = []

/**
 * Detects and handles duplicate messages posted across one or more channels.
 */
export async function checkForSpam(message: Message) {
    const { repeatMessages, remainingMessages } = Object.groupBy(recentMessages, m => {
        const authorMatch = m.author === message.author
        const textMatch = m.content === message.content
        const channelMatch = m.channelId === message.channelId
        const imgMatch = 
            m.attachments.size === message.attachments.size &&
            m.attachments.first()?.size === message.attachments.first()?.size &&
            m.attachments.first()?.width === message.attachments.first()?.width &&
            m.attachments.first()?.height === message.attachments.first()?.height
    
        return (authorMatch && textMatch && imgMatch && !channelMatch && (m.content || m.attachments.size))
            ? "repeatMessages"
            : "remainingMessages"
    })
    
    if (repeatMessages && repeatMessages.length >= 1) {
        const { author, member, content, attachments } = message
        if (!member || !member.manageable || !member.moderatable) return
        
        const logEmbed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: author.username,
                iconURL: author.displayAvatarURL({ extension: 'png' })
            })
            .setDescription(`${author} was timed out for 1 minute.`)
            .addFields([
                { name: 'Reason', value: 'Posting identical messages in multiple channels.' },
                { name: 'Channels', value: repeatMessages.map(m => channelMention(m.channelId)).join(' ') },
                {
                    name: 'Content',
                    value: truncateString(content, 1024) || 'No content'
                },
            ])
            .setFooter({ text: `User ID: ${author.id}` })
            .setTimestamp(new Date())

        let logAttachment
        const attachment = attachments.first()
        if (attachment && attachment.contentType?.includes('image')) {
            const response = await fetch(attachment.proxyURL)
            if (response.ok) {
                const buffer = Buffer.from(await response.arrayBuffer())
                logAttachment = new AttachmentBuilder(buffer, { name: attachment.name })
                logEmbed.setImage(`attachment://${attachment.name}`)
            }
        }

        member.timeout(MILLISECONDS.MINUTE, 'Posting identical messages in multiple channels.')
        sendToChannel(CHANNEL_IDS.AUTOMOD, { embeds: [logEmbed], files: logAttachment ? [logAttachment] : [] })
        const userWarning = await message.reply(`${author} Do not post identical messages across multiple channels.`)
        setTimeout(() => { userWarning.delete() }, MILLISECONDS.SECOND * 15)
    
        message.delete()
        for (const msg of repeatMessages) { msg.delete() }
        if (remainingMessages) { recentMessages.splice(0, recentMessages.length, ...remainingMessages) }
    } else {
        recentMessages.push(message)
        if (recentMessages.length > 10) { recentMessages.splice(0, 1) }
    }
}
