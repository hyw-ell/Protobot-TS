import { AnyThreadChannel, ChannelType } from 'discord.js'
import { DD_SERVER_ID } from '../data/discord.js'

const keywords = [
    'bug-report',
    'feedback',
    'suggestions',
    'requests',
]

export async function onThreadCreate(thread: AnyThreadChannel) {
    if (thread.guildId === DD_SERVER_ID && thread.parent?.type === ChannelType.GuildForum) {
        if (keywords.some(w => thread.parent?.name.includes(w))) {
            const threadMessages = await thread.messages.fetch()
            const starterMessage = threadMessages.first()
        
            await starterMessage?.react('thumbs_up:1468453543424950495')
            await starterMessage?.react('thumbs_sideways:1468453542384898079')
            await starterMessage?.react('thumbs_down:1468453540908367994')
        }
    }
}

export function onThreadUpdate(oldThread: AnyThreadChannel, newThread: AnyThreadChannel) {
    const oldTags = oldThread.appliedTags
    const newTags = newThread.appliedTags

    if (oldThread.guildId === DD_SERVER_ID && oldThread.parent?.type === ChannelType.GuildForum) {
        if (keywords.some(w => oldThread.parent?.name.includes(w)) && oldTags.join() !== newTags.join()) {
            const changedTagID = newTags.length > oldTags.length
                ? newTags.find(tag => !oldTags.includes(tag))
                : oldTags.find(tag => !newTags.includes(tag))
            const changedTag = oldThread.parent.availableTags.find(tag => tag.id === changedTagID)!
            const tagEmoji = changedTag.emoji
                ? changedTag.emoji.id 
                    ? `<:${changedTag.emoji.name}:${changedTag.emoji.id}> `
                    : changedTag.emoji.name + ' '
                : ''

            const notificationContent = newTags.length > oldTags.length
                ? `<@${oldThread.ownerId}>, your post has been tagged as **${tagEmoji + changedTag.name}**.`
                : `<@${oldThread.ownerId}>, the **${tagEmoji + changedTag.name}** tag has been removed from your post.`

            newThread.send({ content: notificationContent, flags: [ 'SuppressNotifications' ] })
        }
    }
}