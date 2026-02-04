export const BOT_OWNER_ID = '251458435554607114'
const DEV_ID = '631961435051917362'
const PROD_ID = '521180443958181889'

const devMode = process.env.DEV_MODE === 'true'
export const BOT_ID = devMode ? DEV_ID : PROD_ID
export const BOT_TOKEN = devMode ? process.env.DEV_TOKEN! : process.env.PROD_TOKEN!

export const HOME_SERVER_ID = '379501550097399810'
export const DD_SERVER_ID = '98499414632448000'
export const CHANNEL_IDS = {
    AUTOMOD: '791527921142988832',
    ERROR: '936833258149281862',
    LFT_LOG: '916495567037816853',
    COMMAND_LOG: '577636091834662915',
    SERVER_COUNT: '762948660983496715',
    WIKI_CHANGES: '1072236073515745451',
}

export const heroEmotes: {[char: string]: string} = {
    'All': '**All**',
    'Monk': '<:monk:250374207194529812>',
    'Apprentice': '<:apprentice:250374207651708928>',
    'Huntress': '<:huntress:250374208800948225>',
    'Squire': '<:squire:250374210352840704>',
    'Ev2': '<:seriesEV:250374210113765376>',
    'Lavamancer': '<:lavamancer:250374207517491200>',
    'Abyss Lord': '<:AbyssLord:250374207156912128>',
    'Adept': '<:adept:350402392178556948>',
    'Dryad': '<:dryad:345156191967641600>',
    'Initiate': '<:initiate:327210374581714964>',
    'Gunwitch': '<:gunwitch:250374210382200832>',
    'Barbarian': '<:barbarian:421073360584310785>',
    'Mystic': '<:mystic:250374210562555904>',
    'Mercenary': '<:Mercenary:908430318845956136>',
    'Countess': '<:Countess:981719805784629308>',
    'Engineer': '<:Engineer:1090841647383859230>',
    'Hunter': '<:Hunter:1167149310119510046>',
    'Aquarion': '<:Aquarion:1223299224268181555>',
    'Frostweaver': '<:Frostweaver:1317314894454063176>'
}