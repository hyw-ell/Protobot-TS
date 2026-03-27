import { MessageCreateOptions, MessagePayload, PermissionFlagsBits, REST, Routes, TextChannel } from 'discord.js'
import { readdirSync } from 'fs'
import { client } from '../index.js'
import { BOT_ID, BOT_TOKEN, CHANNEL_IDS, HOME_SERVER_ID } from '../data/discord.js'
import { Command } from '../classes/BotClient.js'
import { inspect } from 'util'

export async function registerCommands() {
    const commands = []
    const privateCommands = []  // Commands only available on the home server
    const commandCategories = readdirSync('./prod/commands')
    
    for (const category of commandCategories) {
        const commandFiles = readdirSync(`./prod/commands/${category}`)

        for (const file of commandFiles) {
            const { command } : { command: Command } = await import(`../../prod/commands/${category}/${file}`)

            if (category === 'admin') {
                command.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            }

            category === 'private'
                ? privateCommands.push(command.data.toJSON())
                : commands.push(command.data.toJSON())

            client.commands.set(command.data.name, command)
        }
    }

    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)
    rest.put(Routes.applicationCommands(BOT_ID), { body: commands })
    rest.put(Routes.applicationGuildCommands(BOT_ID, HOME_SERVER_ID), { body: privateCommands })
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