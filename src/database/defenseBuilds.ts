import { defenseBuildsDB } from './database.js'

export interface defenseObject {
	name: string,
	role: string,
	tertiary: string | null,
	shards: (string | null)[],
	mods: { name: string | null, qualibean: number | null }[],
	relic: 'medallion' | 'totem'
}

export let defenseBuildData: defenseObject[] = []

/** Loads defense builds from Sheet of Sheets */
export async function loadDefenseBuilds() {
    await defenseBuildsDB.loadInfo()

	const buildData: defenseObject[] = []
	const sheet = defenseBuildsDB.sheetsByTitle['[General] Tower Builds']
	await sheet.loadCells()

	for (let col = 2; col < 20; col += 14) {
		for (let row = 6; row < sheet.rowCount; /* Oh hi! */) {
			const defenseName = sheet.getCell(row, col).stringValue
			if (!defenseName) { row++; continue }

			buildData.push({
				name: defenseName,
				role: sheet.getCell(row + 1, col).stringValue!,
				tertiary: sheet.getCell(row, col + 7).formula?.slice(1).replace(/_/g, ' ') ?? null,
				shards: [3, 4, 5].map(rowOffset => sheet.getCell(row + rowOffset, col + 4).stringValue ?? null),
				mods: [3, 4, 5].map(rowOffset => ({
					name: sheet.getCell(row + rowOffset, col + 1).stringValue ?? null,
					qualibean: parseInt(sheet.getCell(row + rowOffset, col).formula!.match(/\d+/)![0])
				})),
				relic: sheet.getCell(row, col + 5).formula!.includes('totem') ? 'totem' : 'medallion'
			})

			row += 13
		}
	}

	defenseBuildData = buildData
	console.log('Defense Build Data compiled')
}

/** Loads Defense builds from DD2 Defense Build Guides */
async function loadDefenseBuildsOld() {
    await defenseBuildsDB.loadInfo()

	const buildData: defenseObject[] = []
	for (let i = 2; i < defenseBuildsDB.sheetCount - 2; i++) { // First and last two tabs do not contain defense build data
		const sheet = defenseBuildsDB.sheetsByIndex[i]
		await sheet.loadCells()

		for (let row = 2; row < sheet.rowCount; row += 20) {
			for (let col = 1; col < sheet.columnCount; col += 5) {
				const defenseName = sheet.getCell(row + 1, col + 2).stringValue
				let   defenseRole = sheet.getCell(row + 4, col + 2).stringValue
				if (!defenseName || !defenseRole) continue

				const duplicateDefense = buildData.findLast(d => d.name === defenseName && String(d.role.match(/[\w\s]+/)).trim() === defenseRole)
				if (duplicateDefense) {
					const variant: RegExpMatchArray | null = duplicateDefense.role.match(/\((\w)\)$/)
					if (variant) {
						const newVariant = String.fromCharCode(variant[1].toLowerCase().charCodeAt(0) + 1)
						defenseRole += ` (${newVariant})`
					} else {
						duplicateDefense.role += ' (a)'
						defenseRole += ' (b)'
					}
				}

				buildData.push({
					name: defenseName,
					role: defenseRole,
					tertiary: sheet.getCell(row + 5, col + 2).stringValue ?? null,
					shards: [6, 8, 10].map(yOffset => sheet.getCell(row + yOffset, col + 2).stringValue ?? null),
					mods: [12, 14, 16].map(yOffset => {
						const qualibeanInfo = sheet.getCell(row + yOffset, col + 1).formula
						return ({
							name: sheet.getCell(row + yOffset, col + 2).stringValue ?? null,
							qualibean: qualibeanInfo ? parseInt(qualibeanInfo.match(/\d+/)![0]) : null
						})
					}),
					relic: sheet.getCell(row + 12, col).formula!.startsWith('totem') ? 'totem' : 'medallion'
				})
			}
		}	
	}

	defenseBuildData = buildData
	console.log('Defense Build Data compiled')
}