import 'dotenv/config'

import { VoiceChannel } from 'discord.js'
import { inspect } from 'util'
import { schedule } from 'node-cron'
import { registerFont } from 'canvas'
import { BotClient } from './classes/BotClient.js'
import { connectDatabase } from './database/database.js'
import { loadDefenseBuilds } from './database/defenseBuilds.js'
import { CHANNEL_IDS, BOT_TOKEN } from './data/discord.js'
import { onInteractionCreate, onMessageCreate, onThreadCreate, onThreadUpdate } from './events/index.js'
import { registerCommands, sendToChannel } from './utils/discord.js'

import './cron/index.js'
import './events/index.js'

export const client = new BotClient()

export async function runStartup() {
	await connectDatabase()
	registerCommands()
	loadDefenseBuilds()
}
runStartup()

registerFont('assets/Arial.ttf', {family: 'Arial'})
registerFont('assets/Arial Bold.ttf', {family: 'Arial Bold'})

client.on('clientReady', async () => {
	client.user?.setActivity('/help')

	console.log('Protobot is now online')
	sendToChannel(CHANNEL_IDS.COMMAND_LOG, '**:white_check_mark:  Protobot is now online**')

	const serverCountChannel = await client.channels.fetch(CHANNEL_IDS.SERVER_COUNT) as VoiceChannel
	schedule('0 * * * *', () => { runStartup() })
	schedule('0 0 * * *', () => {
		serverCountChannel.edit({ name: `Server Count: ${client.guilds.cache.size}` })
	})
})

client.on('interactionCreate', onInteractionCreate)
client.on('messageCreate', onMessageCreate)
client.on('threadCreate', onThreadCreate)
client.on('threadUpdate', onThreadUpdate)

client.login(BOT_TOKEN)

process.on('uncaughtException', error => {
	sendToChannel(
		CHANNEL_IDS.ERROR,
		{
			files: [{ attachment: Buffer.from(inspect(error, { depth: null })), name: 'error.ts' }]
		}
	)
})