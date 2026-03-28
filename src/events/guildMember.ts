import { GuildMember } from 'discord.js'
import { database } from '../database/database.js'
import { DD_SERVER_ID, DOE_BACKER_ROLE_ID } from '../data/discord.js'
import { sendToErrorChannel } from '../utils/discord.js'

export async function onGuildMemberAdd(member: GuildMember) {
    if (member.guild.id === DD_SERVER_ID) {
        const backer = database.DOEBackers.find(b => {
            const username = b.get('discord_username')
            return (username === member.user.username) || (username === member.id)
        })
    
        if (backer) {
            const res = await member.roles.add(DOE_BACKER_ROLE_ID).catch((e) => {
                sendToErrorChannel(e, `Failed to add DOE Backer role for user: ${member.user.username}`)
                return undefined
            })
            
            if (res) {
                const timestamp = new Date().toUTCString()
                backer.set('discord_ID', member.id)
                backer.set('claim_timestamp', timestamp)
                await backer.save()
            }
        }
    }
}