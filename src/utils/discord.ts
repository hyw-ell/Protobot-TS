import { GuildMember, MessageCreateOptions, MessagePayload, PermissionFlagsBits, REST, Routes, TextChannel } from 'discord.js'
import { readdirSync } from 'fs'
import { client } from '../index.js'
import { BOT_ID, BOT_TOKEN, CHANNEL_IDS, DD_SERVER_ID, DOE_BACKER_ROLE_ID, HOME_SERVER_ID } from '../data/discord.js'
import { Command } from '../classes/BotClient.js'
import { inspect } from 'util'
import { database } from '../database/database.js'

export async function registerCommands() {
    const commands = []
    const privateCommands = []  // Commands only available on the home server
    const DDServerCommands = [] // Commands only available on the Official Dungeon Defenders server
    const commandCategories = readdirSync('./prod/commands')
    
    for (const category of commandCategories) {
        const commandFiles = readdirSync(`./prod/commands/${category}`)

        for (const file of commandFiles) {
            const { command } : { command: Command } = await import(`../../prod/commands/${category}/${file}`)

            if (category === 'admin') {
                command.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            }

            switch (category) {
                case 'private':  privateCommands.push(command.data.toJSON()); break;
                case 'ddserver': DDServerCommands.push(command.data.toJSON()); break;
                default:         commands.push(command.data.toJSON()); break;
            }

            client.commands.set(command.data.name, command)
        }
    }

    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)
    rest.put(Routes.applicationCommands(BOT_ID), { body: commands })
    rest.put(Routes.applicationGuildCommands(BOT_ID, HOME_SERVER_ID), { body: privateCommands })
    rest.put(Routes.applicationGuildCommands(BOT_ID, DD_SERVER_ID), { body: DDServerCommands })
}

export async function sendToChannel(channelID: string, message: string | MessagePayload | MessageCreateOptions) {
    const channel = await client.channels.fetch(channelID).catch(() => {
        throw new Error(`Could not fetch channel for ID: ${channelID}`)
    }) as TextChannel | null
    if (channel) channel.send(message)
}

export async function sendToErrorChannel(error: Error, textContent?: string) {
    sendToChannel(CHANNEL_IDS.ERROR, {
        content: textContent,
        files: [{ attachment: Buffer.from(inspect(error, { depth: null })), name: 'error.ts' }]
    })
}

/**
 * Valid Discord usernames have 2 ~ 32 characters. Only lowercase letters, numbers, underscores, and periods are allowed.
 */
function isValidUsername(username: string) {
	const isValidLength = username.length >= 2 && username.length <= 32
	const hasInvalidChars = /[^\w.]/.test(username)
	return isValidLength && !hasInvalidChars
}

export async function distributeDOEBackerRole() {
	const guild = await client.guilds.fetch(DD_SERVER_ID)
	const members = await guild.members.fetch({ limit: 0 })

	for (const backer of database.DOEBackers) {
		const username = backer.get('discord_username')
		let backerInServer: GuildMember | undefined

		try {
			// Discord user IDs are 17~19 numbers long
			if (/\d{17, 19}/.test(username)) { // User likely entered in a user ID rather than a username
				const userID = username.match(/\d+/)!.toString()
				backerInServer = await guild.members.fetch(userID)
			} else if (isValidUsername(username)) {
				backerInServer = members.find(m => m.user.username === username)
			} else {
				console.log(`Could not fetch user due to malformed username or ID: ${username}`)
				continue
			}
		} catch (e) {
			console.log(`Error occurred when trying to fetch user: ${username}`)
			console.error(e)
		}

		if (backerInServer) {
			const res = await backerInServer.roles.add(DOE_BACKER_ROLE_ID).catch(e => {
				console.log(`Error trying to add role to user with username: ${username}`)
				console.error(e)
				return undefined
			})

			if (res) {
				const timestamp = new Date().toUTCString()
				backer.set('discord_ID', backerInServer.id)
				backer.set('claim_timestamp', timestamp)
				await backer.save()
			}
		} else {
			console.log(`Could not find user for username: ${username}`)
		}
	}
}