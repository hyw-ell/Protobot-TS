import { GuildMember } from 'discord.js'
import { database } from '../database/database.js'
import { CHANNEL_IDS, DD_SERVER_ID, DOE_BACKER_ROLE_ID } from '../data/discord.js'
import { sendToChannel } from '../utils/discord.js'
import { inspect } from 'util'

export async function onGuildMemberAdd(member: GuildMember) {
    if (member.guild.id === DD_SERVER_ID) {
        const backer = database.DOEBackers.find(b => {
            const username = b.get('discord_username')
            return (username === member.user.username) || (username === member.id)
        })
    
        if (backer) {
            const result = await member.roles.add(DOE_BACKER_ROLE_ID).catch((e) => {
                sendToChannel(CHANNEL_IDS.BACKER_VERIFICATION, {
                    content: `Failed to add DOE Backer role for user: ${member.user.username}`,
                    files: [{ attachment: Buffer.from(inspect(e, { depth: null })), name: 'error.ts' }]
                })
                return undefined
            })
            
            if (result) {
                const timestamp = new Date().toUTCString()
                backer.set('discord_ID', member.id)
                backer.set('role_claimed_at', timestamp)
                await backer.save()
            }
        }
    }
}