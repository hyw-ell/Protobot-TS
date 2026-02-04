import { CacheType, ChannelType, Interaction, MessageFlags } from 'discord.js'
import { client } from '../index.js'
import { sendToChannel } from '../utils/discord.js'
import { CHANNEL_IDS } from '../data/discord.js'
import { isBlacklisted } from '../database/helpers.js'
import { handlePostModalSubmit } from './eventHelpers/handlePostModalSubmit.js'
import { findBestCIMatch } from '../utils/string.js'
import { database } from '../database/database.js'

export async function onInteractionCreate(interaction: Interaction<CacheType>) {
    if (interaction.isCommand() || interaction.isMessageContextMenuCommand()) {
        if (isBlacklisted(interaction.user.id)) {
            interaction.reply(`${interaction.user} you are currently banned from running commands.`)
            return
        }
    
        const command = client.commands.get(interaction.commandName)
        if (command) {
            sendToChannel(CHANNEL_IDS.COMMAND_LOG, `:scroll:  **${interaction.user.tag}** ran the command \`${interaction.commandName}\` in **${interaction.guild?.name ?? 'Direct Messages'}** (${interaction.guildId ?? interaction.channelId})`)
            command.execute(interaction)
        } else {
            interaction.reply({
                content: 'Failed to load command. Please try again later.',
                flags: MessageFlags.Ephemeral
            })
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'postModal' && interaction.channel?.type === ChannelType.GuildText) {
            handlePostModalSubmit(interaction)
        }
    }
    
    if (interaction.isAutocomplete()) {
        const focusedOption = interaction.options.getFocused(true)
        let allChoices: string[] = []

        switch (interaction.commandName) {
            case 'shard': 
                allChoices = database.shards.map(s => s.get('name'))
                break
            case 'mod':
                allChoices = database.mods.map(m => m.get('name'))
                break
            case 'defense':
                allChoices = database.defenses.map(d => d.get('name'))
                break
            case 'price':
                if (focusedOption.name !== 'item') return
                allChoices = database.prices.map(i => i.get('name'))
                break
        }
        
        if (!focusedOption.value) { allChoices = allChoices.slice(0, 10) }
        const ratedChoices = findBestCIMatch(focusedOption.value, allChoices).ratings
        const bestChoices = ratedChoices.sort((a, b) => b.rating - a.rating)
        const results = bestChoices.slice(0, 10).map(({target}) => ({ name: target, value: target}))

        interaction.respond(results).catch(() => {})
    }
}
