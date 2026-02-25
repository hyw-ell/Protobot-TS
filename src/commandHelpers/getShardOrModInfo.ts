import { EmbedBuilder } from 'discord.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { ModInfo, ShardInfo } from '../database/publicTypes.js'
import { heroEmotes } from '../data/discord.js'
import { attachments } from '../data/assets.js'
import { database } from '../database/database.js'
import path from 'path'

export function getShardInfo(shard: GoogleSpreadsheetRow<ShardInfo>) {
    const difficultyIcon = attachments[path.basename(shard.get('dropURL'))]
    const shardIcon = attachments[path.basename(shard.get('image'))]

    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({name: shard.get('name'), iconURL: `attachment://${difficultyIcon.name}`})
        .setThumbnail(`attachment://${shardIcon.name}`)
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

    return { embeds: [embed], files: [difficultyIcon, shardIcon] }
}

export function getModInfo(mod: GoogleSpreadsheetRow<ModInfo>) {
    const modTypeIcon = attachments[path.basename(mod.get('image'))]
    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: mod.get('name') })
        .setThumbnail(`attachment://${modTypeIcon.name}`)
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
    
    return { embeds: [embed], files: [modTypeIcon] }
}

export function getServoVariantName(modName: string) {
    const servoName = modName.replace('Chip', 'Servo')
    const servoVariant = database.mods.find(mod => mod.get('name') === servoName)
    return servoVariant ? servoName : modName
}