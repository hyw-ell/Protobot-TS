import { LabelBuilder, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

const instructions =
`
## We need some more information to verify your backer status
Please submit your backer email address and your backer number for Defenders of Etheria.
### To find your backer number:
1. [Click here](https://www.kickstarter.com/projects/chromaticgames/defenders-of-etheria/backing/details) to view your **backing details** on Kickstarter.
1. Scroll down and find your **backer number**. It should be listed at the bottom of the **backing details**.
`

const emailInput = new LabelBuilder()
    .setLabel('Enter your backer email address')
    .setTextInputComponent(
        new TextInputBuilder()
            .setCustomId('backerEmail')
            .setPlaceholder('defenderof@etheria.com')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
    )

const backerNumber = new LabelBuilder()
    .setLabel('Enter your backer number')
    .setTextInputComponent(
        new TextInputBuilder()
            .setCustomId('backerNumber')
            .setPlaceholder('1234')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
    )

export const DOEBackerModal = new ModalBuilder()
    .setCustomId('DOEBackerModal')
    .setTitle('DOE Backer Manual Verification')
    .addTextDisplayComponents(new TextDisplayBuilder({ content: instructions }))
    .addLabelComponents(emailInput, backerNumber)
    