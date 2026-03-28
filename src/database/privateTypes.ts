type UserLogKeys = 'lastMsgID' | 'lastMsgTimestamp' | 'username' | 'userID'
export type UserLogInfo = { [K in UserLogKeys]: string }

// YouTube Post Notifications
type YTPNKeys = 'channelID' | 'recentVideos' | 'discordChannelID'
type YTPNInfo = { [K in YTPNKeys]: string }

// Twitch Live Notifications
type TLNKeys = 'username' | 'recentStreamIDs' | 'configs'
type TLNInfo = { [K in TLNKeys]: string }

type VariableKeys = 'name' | 'value' | 'notes'
type VariableInfo = { [K in VariableKeys]: string }

type BlacklistKeys = 'name' | 'id' | 'notes'
type BlacklistInfo = { [K in BlacklistKeys]: string }

// Name must match the table name from the Google Sheet
export const privateDatabaseConfig = {
    userLogs: { name: 'User Logs', type: {} as UserLogInfo },
    youtubeChannels: { name: 'Youtube Post Notifications', type: {} as YTPNInfo },
    twitchChannels: { name: 'Twitch Live Notifications', type: {} as TLNInfo },
    variables: { name: 'Variables', type: {} as VariableInfo },
    blacklist: { name: 'Blacklist', type: {} as BlacklistInfo },
} as const

// ============================ DOE Backer Database ============================
type BackerKeys = 'email' | 'discord_username' | 'discord_ID' | 'claim_timestamp'
type BackerInfo = { [K in BackerKeys]: string }

export const DOEBackerDatabaseConfig = {
    DOEBackers: { name: 'Backer Info', type: {} as BackerInfo},
}