import { EmbedBuilder } from 'discord.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { ModInfo, ShardInfo } from '../database/publicDBConfig.js'
import { heroEmotes } from '../data/discord.js'
import { IMAGE_URLS } from '../data/assets.js'
import { database } from '../database/database.js'
import path from 'path'

export function getShardInfo(shard: GoogleSpreadsheetRow<ShardInfo>) {
    const difficultyIconURL = IMAGE_URLS[path.basename(shard.get('dropURL'))]
    const shardIconURL = IMAGE_URLS[path.basename(shard.get('image'))]

    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: shard.get('name'), iconURL: difficultyIconURL })
        .setThumbnail(shardIconURL)
        .setDescription(shard.get('description'))
        .addFields([
            { name: 'Gilded: ', value: shard.get('gilded'), inline: false },
            {
                name: 'Usable by:',
                value: shard.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(''),
                inline: false
            }
        ])
        .setFooter({
            text: `Upgrade Levels: ${shard.get('upgradeLevels')} | ${shard.get('type')} | ${shard.get('drop')}`
        })

    return { embeds: [embed] }
}

export function getModInfo(mod: GoogleSpreadsheetRow<ModInfo>) {
    const modTypeIconURL = IMAGE_URLS[path.basename(mod.get('image'))]
    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: mod.get('name') })
        .setThumbnail(modTypeIconURL)
        .setDescription(mod.get('description'))
        .addFields([
            { name: 'Acquisition:', value: mod.get('drop') },
            {
                name: 'Usable by:',
                value: mod.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(''),
                inline: false
            }
        ])
        .setFooter({ text: `${mod.get('type')} Mod` })
    
    return { embeds: [embed] }
}

export function getServoVariantName(modName: string) {
    const servoName = modName.replace('Chip', 'Servo')
    const servoVariant = database.mods.find(mod => mod.get('name') === servoName)
    return servoVariant ? servoName : modName
}