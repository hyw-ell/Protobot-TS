import { AttachmentBuilder } from 'discord.js'
import { database } from '../database/database.js'
import { defenseObject } from '../database/defenseBuilds.js'
import { images } from '../data/assets.js'
import { EnhancedCanvas } from '../classes/EnhancedCanvas.js'
import path from 'path'

export async function generateBuildImage(defense: defenseObject) {
    const canvas = new EnhancedCanvas(326, 378)
    const ctx = canvas.ctx
    
    /* Draw the black background */
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 326, 378)

    /* Draw the Defense Image */
    const defenseInfo = database.defenses.find(d => d.get('name') === defense.name)
    const defenseImage = images[defenseInfo ? path.basename(defenseInfo.get('image_url')) : 'Unknown_Icon.png']
    ctx.drawImage(defenseImage, 0, 0, 126, 126)

    /* Write the Defense name, role, and tertiary stat */
    ctx.textAlign = 'center'
    ctx.font = '27px Arial Bold'
    ctx.fillStyle = 'white'
    canvas.wrapText(defense.name, 229, 52, 200, 27)

    ctx.font = '16px Arial Bold'
    ctx.fillStyle = '#E06666'
    ctx.fillText(defense.role, 229, 98)

    if (defense.tertiary) {
        ctx.font = '16px Arial Bold'
        ctx.fillStyle = '#00FFFF'
        ctx.fillText(defense.tertiary, 229, 118)
    }

    /* Draw the horizontal grey line */
    ctx.lineWidth = 4
    ctx.strokeStyle = '#434343'
    ctx.beginPath()
    ctx.moveTo(0, 124)
    ctx.lineTo(326, 125)
    ctx.stroke()

    /* Draw the Shard and Relic Icons */
    const shardIcon = images['Green_Shard_Icon.png']
    const relicIcon = images[defense.relic === 'medallion' ? 'Medallion_Icon.png' : 'Totem_Icon.png']
    ctx.drawImage(shardIcon, 13, 170)
    ctx.drawImage(relicIcon, 9, 293, 45, 45)

    /* Prepare styles for shards and mods */
    ctx.textAlign = 'left'
    ctx.font = '22px Arial Bold'
    ctx.strokeStyle = 'black'
    ctx.fillStyle = 'white'

    /* Draw the Shards and Shard Difficulty Icons */
    defense.shards.forEach((shardName, index) => {
        const shard = database.shards.find(s => s.get('name') === shardName)
        if (!shardName || !shard) return

        const yPos = 132 + index * 42
        const shardDifficultyIcon = images[path.basename(shard.get('dropURL'))]
        ctx.drawImage(shardDifficultyIcon, 80, yPos, 31, 31)
        canvas.wrapText(shardName, 126, yPos + 15, 200, 20)
    })

    /* Draw the Mods and Qualibean Icons */
    defense.mods.forEach((mod, index) => {
        if (!mod.name) { return }

        const qualibeanIcon = images[mod.qualibean ? `Qualibean_${mod.qualibean}.png` : 'Unknown_Icon.png']
        const yPos = 254 + index * 42
        ctx.drawImage(qualibeanIcon, 82, yPos, 25, 37)
        canvas.wrapText(mod.name, 126, yPos + 19, 200, 20)
    })

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: `${defense.name.replace(/ /g, '_')}.png` })
}