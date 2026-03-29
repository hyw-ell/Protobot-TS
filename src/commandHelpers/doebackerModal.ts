import { TextInputBuilder } from '@discordjs/builders'
import { LabelBuilder, ModalBuilder, TextInputStyle } from 'discord.js'

const emailInput = new LabelBuilder()
    .setLabel('Your backer status could not be verified')
    .setDescription('Please enter the email address associated with the account you used to back Defenders of Etheria for manual verification.')
    .setTextInputComponent(
        new TextInputBuilder()
            .setCustomId('emailAddress')
            .setPlaceholder('defender@etheria.com')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
    )

export const DOEBackerModal = new ModalBuilder()
    .setCustomId('DOEBackerModal')
    .setTitle('DOE Backer Email Verification')
    .addLabelComponents(emailInput)
    