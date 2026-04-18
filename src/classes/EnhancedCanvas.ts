import { Canvas, CanvasRenderingContext2D } from 'canvas'

/**
 * Customized version of Canvas with custom helper methods for drawing
 */
export class EnhancedCanvas extends Canvas {
    public ctx: CanvasRenderingContext2D

    constructor(width: number, height: number, type?: 'pdf'|'svg') {
        super(width, height, type)
        this.ctx = this.getContext('2d')
    }

    /**
     * Writes text that wraps around when it reaches a horizontal limit
     * 
     * This is a customized version of the wrapText method from https://stackoverflow.com/questions/23201411/canvas-wraptext-function-with-filltext
     * @param text - The text to be written
     * @param x - The X coordinate of the text
     * @param y - The Y coordinate of the text
     * @param maxWidth - The width of the line of text. After reaching this width limit the text will wrap around
     * @param lineHeight - The spacing between lines of text (generally, this should be the same number as the font size)
     * @param centerVertical - Whether or not to center the text vertically at the specified y-position
     */
    wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number, centerVertical = false) {
        const ctx = this.ctx
        const words = text.split(' ')
        const linesToDraw: string[] = []
        let testWords: string[] = []
        
        ctx.save()
        ctx.textBaseline = 'middle'
        
        for (const word of words) {
            const testLine = [...testWords, word].join(' ')
            if (ctx.measureText(testLine).width > maxWidth && testWords.length > 0) {
                linesToDraw.push(testWords.join(' '))
                testWords = [word]
            } else {
                testWords.push(word)
            }
        }
        linesToDraw.push(testWords.join(' '))

        if (centerVertical) {
            const totalHeight = linesToDraw.length * lineHeight
            y -= (totalHeight - lineHeight) / 2
        }

        for (const line of linesToDraw) {
            ctx.fillText(line, x, y)
            y += lineHeight
        }

        ctx.restore()
    }
}