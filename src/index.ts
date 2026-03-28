import 'dotenv/config'
import './cron/index.js'

import { VoiceChannel } from 'discord.js'
import { schedule } from 'node-cron'
import { registerFont } from 'canvas'
import { BotClient } from './classes/BotClient.js'
import { connectDatabase } from './database/database.js'
import { loadDefenseBuilds } from './database/defenseBuilds.js'
import { CHANNEL_IDS, BOT_TOKEN } from './data/discord.js'
import { onInteractionCreate, onMessageCreate, onThreadCreate, onThreadUpdate } from './events/index.js'
import { registerCommands, sendToChannel, sendToErrorChannel } from './utils/discord.js'
import { onGuildMemberAdd } from './events/guildMember.js'

export const client = new BotClient()

export async function runStartup() {
	await connectDatabase()
	registerCommands()
	loadDefenseBuilds()
}
runStartup()

registerFont('assets/Arial.ttf', { family: 'Arial' })
registerFont('assets/Arial Bold.ttf', { family: 'Arial Bold' })

client.on('clientReady', async () => {
	client.user?.setActivity('Dungeon Defenders 2')

	console.log(`${client.user?.displayName} is now online`)
	sendToChannel(CHANNEL_IDS.COMMAND_LOG, `**:white_check_mark:  ${client.user?.displayName} is now online**`)

	const serverCountChannel = await client.channels.fetch(CHANNEL_IDS.SERVER_COUNT) as VoiceChannel
	schedule('0 * * * *', () => { runStartup() })
	schedule('0 0 * * *', () => {
		serverCountChannel.edit({ name: `Server Count: ${client.guilds.cache.size}` })
	})

	// TODO distributeDOEBackerRole()
})

client.on('interactionCreate', onInteractionCreate)
client.on('messageCreate', onMessageCreate)
client.on('threadCreate', onThreadCreate)
client.on('threadUpdate', onThreadUpdate)
client.on('guildMemberAdd', onGuildMemberAdd)

client.login(BOT_TOKEN)

process.on('uncaughtException', error => sendToErrorChannel(error))