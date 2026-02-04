import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('rate')
		.setDescription('Calculate the rating of an item')
		.addStringOption(option => option.setName('your-stat').setDescription('The current stat of your item').setRequired(true))
		.addStringOption(option => option.setName('max-stat').setDescription('The maximum stat of your item').setRequired(true))
		.addStringOption(option => option.setName('min-stat').setDescription('The minimum stat of your item').setRequired(false))
	,
	async execute(interaction: ChatInputCommandInteraction) {
        const stat = parseFloat(interaction.options.getString('your-stat')!)
        const maxStat = parseFloat(interaction.options.getString('max-stat')!)
        const minStat = parseFloat(interaction.options.getString('min-stat')!)

        let rating = 0
        let ratingEmbed = new EmbedBuilder()
            .setTitle('Item Rating Calculator')
            .setColor('Blue')
            .addFields({name: 'Your Stat:', value: String(stat), inline: true})

        if (!minStat){
            ratingEmbed.setDescription('You are currently using the **shorthand** item rating.\nFormula: `Your Stat/Max Stat`')
            rating = stat/maxStat
            ratingEmbed.addFields({name: 'Max Stat:', value: String(maxStat), inline: true})
        } else {
            ratingEmbed.setDescription('You are currently using the **in game** item rating.\nFormula: `(Your Stat - Min Stat)/(Max Stat - Min Stat)`')
            rating = (stat - minStat)/(maxStat - minStat)
            ratingEmbed.addFields({name: 'Stat Range:', value: `${minStat}~${maxStat}`, inline: true})
        }

        ratingEmbed.addFields({name: 'Item Rating:', value: `${(rating*100).toFixed(2)}%`})

        return await interaction.reply({embeds: [ratingEmbed]})
	}
}