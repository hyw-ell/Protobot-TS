import { EmbedBuilder } from 'discord.js'
import { schedule } from 'node-cron'
import { database } from '../database/database.js'
import { sendToChannel } from '../utils/discord.js'
import { getTwitchStreamInfo, getTwitchUserInfo } from '../utils/twitch.js'
import { IMAGE_URLS } from '../data/assets.js'

// Twitch Live Notifications
export interface channelConfig {id: string, message: string | undefined, categories: string[]}
schedule('* * * * *', () => {
    if (!database.twitchChannels) return
    database.twitchChannels.forEach(async channel => {
        const configs: channelConfig[] = JSON.parse(channel.get('configs') || '[]')
        if (configs.length === 0) return

        const [streamInfo, userInfo] = await Promise.all([
            getTwitchStreamInfo(channel.get('username')),
            getTwitchUserInfo(channel.get('username')),
        ])
        if (!streamInfo || !userInfo) return

        const recentStreamIDs: string[] = JSON.parse(channel.get('recentStreamIDs') || '[]')
        if (recentStreamIDs.includes(streamInfo.id)) return

        const twitchStreamEmbed = new EmbedBuilder()
            .setAuthor({name: 'Twitch', iconURL: IMAGE_URLS['Twitch_Logo.png']})
            .setTitle(`${streamInfo.user_name} is now playing ${streamInfo.game_name}!`)
            .setURL(`https://www.twitch.tv/${channel.get('username')}`)
            .setDescription(streamInfo.title)
            .setThumbnail(userInfo.profile_image_url)
            .setColor('Purple')

        configs.forEach((config: channelConfig) => {
            sendToChannel(config.id, {content: config.message, embeds: [twitchStreamEmbed] })
        })

        if (recentStreamIDs.length >= 5) recentStreamIDs.shift() // Only store the 5 most recent stream IDs
        recentStreamIDs.push(streamInfo.id)
        channel.set('recentStreamIDs', JSON.stringify(recentStreamIDs)) // Store the stream ID so that it doesn't get posted again
        channel.save()
    })
})