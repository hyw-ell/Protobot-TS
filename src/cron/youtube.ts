import axios from 'axios'
import Parser from 'rss-parser'
import { schedule } from 'node-cron'
import { database } from '../database/database.js'
import { sendToChannel } from '../utils/discord.js'

// Youtube Post Notifications
schedule('* * * * *', () => {
	if (!database.youtubeChannels) return
	database.youtubeChannels.forEach(async channel => {
		const feed = await new Parser().parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.get('channelID')}`).catch(() => undefined) // Parse the RSS Feed for the channel, ignore any 404 errors if the rss feed is unavailable
		if (!feed) return

		const newVideo = feed.items[0] // The most recently published video
		const recentVideos: string[] = channel.get('recentVideos') ? JSON.parse(channel.get('recentVideos')) : []
		if (recentVideos.includes(newVideo.link!)) return

		const {data} = await axios.get(newVideo.link!)
		if (/Scheduled\sfor/i.test(data)) return // Do not post if this is a scheduled stream (the user has not gone live)

		sendToChannel(
			channel.get('discordChannelID'),
			/watching\snow/i.test(data)
				? `${newVideo.author} is now live!\n${newVideo.link}`
				: `${newVideo.author} has uploaded a new video!\n${newVideo.link}`
		)

		if (recentVideos.length >= 5) recentVideos.shift() // Only store the 5 most recent videos
		recentVideos.push(newVideo.link!)

		channel.set('recentVideos', JSON.stringify(recentVideos)) // Store the video so that it doesn't get posted again
		channel.save()
	})
})