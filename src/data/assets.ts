import { loadImage } from 'canvas'
import { getAllFilePaths } from '../utils/filesystem.js'
import path from 'path'

const imageFilePaths = getAllFilePaths('./assets', 'png')
const imagePromises = imageFilePaths.map(f => loadImage(f))
const resolvedImages = await Promise.all(imagePromises)

export const images = Object.fromEntries(
    imageFilePaths
        .filter(f => /Misc_Icons|Defense_Icons|Difficulty_Icons/.test(f))
        .map((filePath, index) => [path.basename(filePath), resolvedImages[index]])
)

const BASE_URL = 'https://raw.githubusercontent.com/hyw-ell/Protobot-TS/refs/heads/main/'
export const IMAGE_URLS = Object.fromEntries(
    imageFilePaths.map(filePath => [path.basename(filePath), BASE_URL + filePath.match(/assets.+/)])
)
