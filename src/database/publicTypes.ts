import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'

type ModKeys = 'name' | 'description' | 'drop' | 'hero' | 'type' | 'image'
export type ModInfo = { [K in ModKeys]: string }

type ShardKeys = ModKeys | 'upgradeLevels' | 'dropURL' | 'gilded'
export type ShardInfo = { [K in ShardKeys]: string }

export type rarityName = 'Legendary' | 'Mythical' | 'Epic' | 'Powerful'
type PriceKeys = 'name' | 'pcPrice' | 'psPrice' | 'xboxPrice'
export type PriceInfo = {
    [K in PriceKeys]: string
} & {
    rarity: rarityName | null
}

type DefenseKeys = 'name' | 'status_effects' | 'damage_type' | 'defense_type' | 'mana_cost' | 'base_def_power' | 'base_def_health' | 't1_atk_scalar' | 't2_atk_scalar' | 't3_atk_scalar' | 't4_atk_scalar' | 't5_atk_scalar' | 't1_hp_scalar' | 't2_hp_scalar' | 't3_hp_scalar' | 't4_hp_scalar' | 't5_hp_scalar' | 'base_atk_rate' | 'max_atk_rate' | 'base_range' | 'max_range' | 'base_atk_range' | 'max_atk_range' | 'range_scalar' | 'asc_def_power' | 'asc_def_health' | 'asc_gambit' | 'hero' | 'image_url'
type DefenseInfo = { [K in DefenseKeys]: string }

type LinkKeys = 'author' | 'name' | 'description' | 'link'
type LinkInfo = { [K in LinkKeys]: string }

type ContributorKeys = 'img' | 'name' | 'username' | 'id' | 'description' | 'roles' | 'imageURL'
type ContributorInfo = { [K in ContributorKeys]: string }

type GenericKeys = 'name' | 'value'
type GenericInfo = { [K in GenericKeys]: string }

// Name must match the table name from the Google Sheet
export const publicDatabaseConfig = {
    shards: { name: 'Shards', type: {} as ShardInfo },
    mods: { name: 'Mods', type: {} as ModInfo },
    prices: { name: 'Prices', type: {} as PriceInfo },
    defenses: { name: 'Defenses', type: {} as DefenseInfo },
    links: { name: 'Links', type: {} as LinkInfo },
    images: { name: 'Images', type: {} as GenericInfo },
    faq: { name: 'FAQ', type: {} as GenericInfo },
    contributors: { name: 'Contributors', type: {} as ContributorInfo },
} as const

type dbConfigKeys = keyof typeof publicDatabaseConfig
export type PublicDatabaseSchema = {
    [K in dbConfigKeys as `${K}Table`]: GoogleSpreadsheetWorksheet
} & {
    [K in dbConfigKeys]: Array<GoogleSpreadsheetRow<typeof publicDatabaseConfig[K]['type']>>
}