import { Message, OmitPartialGroupDMChannel } from 'discord.js'
import { LFTAutomodConfig, processLFTMessage } from './eventHelpers/LFTAutomod.js'
import { CHANNEL_IDS, DD_SERVER_ID } from '../data/discord.js'
import { checkForSpam } from './eventHelpers/spamAutomod.js'

export async function onMessageCreate(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.bot) return

    if (message.guildId === DD_SERVER_ID) {
        if (message.channelId === CHANNEL_IDS.DD_ANNOUNCEMENTS) {
            message.forward(CHANNEL_IDS.JN_DD_NEWS)
        } else if (message.channelId in LFTAutomodConfig.channels) {
            processLFTMessage(message)
        } else {
            checkForSpam(message)
        }
    }
}