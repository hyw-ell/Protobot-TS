import { findBestMatch } from 'string-similarity'

/**
 * Capitalizes the first letter in a string
 */
export function capFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Capitalizes the first letter of every word in a string
 */
export function capitalize(string: string) {
    const words = string.split(' ')
    const capitalizedWords = words.map(w => capFirstLetter(w))
    return capitalizedWords.join(' ')
}

/**
 * Truncates a string and adds ellipses at the end if the string has more than `maxCharacters` characters.
 */
export function truncateString(string: string, maxCharacters: number) {
    return string.length > 1024 ? `${string.slice(0, maxCharacters - 3)}...` : string
}

/**
 * Formats an array of strings by inserting commas and replacing the last comma with ", and".
 */
export function formatList(array: string[]){
    const formattedList = array.join(', ')
    return formattedList.replace(/(.+)\,(\s*)(.+$)/, '$1$2and $3')
}

/**
 * Case insensitive version of the findBestMatch function from string-similarity
 * @param searchString the string to match each target string against
 * @param targetStrings an array of strings to be matched against the search string
 */
export function findBestCIMatch(searchString: string, targetStrings: string[]){
    // Create separate variables for lower case versions of the search string and target strings
    const LCSearchString = searchString.toLowerCase()
    const LCTargetStrings = targetStrings.map(string => string.toLowerCase())
    const matches = findBestMatch(LCSearchString, LCTargetStrings)
    matches.ratings.forEach(rating => rating.target = targetStrings.find(string => string.toLowerCase() === rating.target)!)
    return matches
}