import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { database} from '../database/database.js'
import { PriceInfo } from '../database/publicDBConfig.js'

function parsePrice(price: string) {
    price = price.replace(/💡|💬/, '').trim()
    const suffix = price.match(/\+/)?.[0] ?? ''
    
    if (!/\d/.test(price)) return [price, suffix]
    return [
        ...price.split('-').map(_price => {
            const priceNum = parseFloat(_price.match(/[\d\.]+/)![0])
            const abbreviation = _price.match(/k|m|b/i)?.[0] ?? price.match(/k|m|b/i)![0]
            const multiplier = { k: 1000, m: 1000000, b: 1000000000 }[abbreviation]!
            return priceNum * multiplier
        }),
        suffix
    ]
}

function stringPrice(priceArr: (string | number)[]) {
    const processedArr = priceArr.map(price => {
        if (typeof price !== 'number') return price
        if (price >= 1000000000) { return parseFloat((price /= 1000000000).toFixed(1)) + 'b' }
        if (price >= 1000000) { return parseFloat((price /= 1000000).toFixed(1)) + 'm' }
        if (price >= 1000) { return parseFloat((price /= 1000).toFixed(1)) + 'k' }
        return price
    })

    return processedArr.length === 3 ? processedArr.slice(0, 2).join('-') + processedArr[2] : processedArr.join('')
}

export function processItem(item: GoogleSpreadsheetRow<PriceInfo>, amount: number, qualibean: number, rarity: PriceInfo['rarity']) : PriceInfo {
    function processPrice(priceString: string) {
        if (/tenacity/i.test(item.get('name')) && qualibean !== 10) return '0'

        const priceArr = parsePrice(priceString).map(price => {
            if (typeof price !== 'number') return price
    
            let multiplier = 1
            
            // 1 ~ 7 = 0.01, 8 = 0.075, 9 = 0.15, 10 = 1.0
            if (qualibean) {
                multiplier = qualibean > 7 ? {8: 0.075, 9: 0.15, 10: 1}[qualibean]! : 0.01
            } else if (!rarity) {
                price /= itemStack
            } else if (item.get('rarity') === 'Legendary' && rarity !== 'Legendary') {
                if (priceString === item.get('xboxPrice')){
                    multiplier = { Mythical: 0.15, Epic: 0.10, Powerful: 0.05 }[rarity]
                } else if (priceString === item.get('psPrice')) {
                    multiplier = { Mythical: 0.25, Epic: 0.10, Powerful: 0.05 }[rarity]
                } else {
                    multiplier = { Mythical: 0.25, Epic: 0.15, Powerful: 0.10 }[rarity]
                }
            }
            
            return price * multiplier * (amount ?? 1)
        })
    
        return stringPrice(priceArr)
    }
    
    let itemPrefix = '', itemStack = 1
    if (database.mods.find(mod => mod.get('name') === item.get('name')) || /Chip|Servo/i.test(item.get('name'))) { // If the item is a mod
        rarity = null
        if (!qualibean) qualibean = 10
        itemPrefix = qualibean + '/10'
    } else if (item.get('rarity')) { // If the item is a pet
        // Mythical pets listed in the price sheet cannot have any other rarity
        if (item.get('rarity') === 'Mythical' && rarity !== 'Mythical') rarity = 'Mythical'

        qualibean = 0
        if (!rarity) rarity = item.get('rarity')
        itemPrefix = rarity!
    } else { // If the item is a material
        if (!item.get('name').includes('x1')) itemStack = 99
        if (!amount) amount = itemStack

        qualibean = 0
        rarity = null
        itemPrefix = amount + 'x'
    }

    return {
        name: itemPrefix + ' ' + item.get('name').replace(/\(?x\d+\)?/i, '').trim(),
        pcPrice: processPrice(item.get('pcPrice')),
        psPrice: processPrice(item.get('psPrice')),
        xboxPrice: processPrice(item.get('xboxPrice')),
        rarity: rarity
    }
}