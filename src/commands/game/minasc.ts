import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('minasc')
		.setDescription('Calculate your minimum ascension and talent caps')
		.addNumberOption(option => option.setName('ascension')
			.setDescription('Your Ascension')
			.setMinValue(1)
			.setMaxValue(50000)
			.setRequired(true)
		)
		.addNumberOption(option => option.setName('floor')
			.setDescription('Your highest Onslaught Floor')
			.setMinValue(1)
			.setMaxValue(999)
			.setRequired(true)
		)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const ascInput = interaction.options.getNumber('ascension')!
		const floorInput = interaction.options.getNumber('floor')!
		const ascension = Math.round(ascInput)
		const floor = Math.round(floorInput)

		const talentCaps = floor >= 30
			? (floor - 30) * 4.16 + ascension / 50
			: ascension / 50
		const minAsc  = Math.round(talentCaps * 3)
		const offense = Math.floor(talentCaps) + Number(minAsc % 3 > 0)
		const defense = Math.floor(talentCaps) + Number(minAsc % 3 > 1)
		const utility = Math.floor(talentCaps)

		const suggestion = minAsc < 500
		? 'Your Minimum Ascension is far too low. If you reset right now, you will most likely not be able to get back to where you were or do many resets very easily.'
		: 500 <= minAsc && minAsc < 1000
		? "You're making progress towards resetting, but you should still continue to push higher in Onslaught before doing so."
		: 1000 <= minAsc && minAsc < 1500
		? 'You might have enough Minimum Ascension for your next reset now, but you should probably go even further still.'
		: 1500 <= minAsc && minAsc < 3000
		? "You have a good amount of Minimum Ascension now! If you want to reset now, I won't stop you, but you may want to consider pushing for 3000 Minimum Ascension."
		: minAsc > 3000
		? 'What are you waiting for? You have more than enough Minimum Ascension for your next reset!'
		: 'Hmm, it seems that your input is invalid, so I cannot provide a proper suggestion...'
		
		const { avatar, id, username } = interaction.user
		const ascEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({ name: username })
			.setThumbnail(`https://cdn.discordapp.com/avatars/${id}/${avatar}.png`)
			.addFields([
				{ name: '**Ascension:**',   value: `${ascension}`, 				  inline: true },
				{ name: '**Floor:**', 	    value: `${floor}`,	 				  inline: true },
				{ name: '**Talent Caps:**', value: `${(Math.round(talentCaps))}`, inline: true },
				{
					name: '**Minimum Ascension:**',
					value: `\`\`\`${minAsc} (${offense} Offense | ${defense} Defense | ${utility} Utility)\`\`\``
				},
				{ name: '<:protobot:563244237433602048> My suggestion:', value: suggestion},
				{
					name: '\u200b',
					value: '[Click Here](https://wiki.dungeondefenders2.com/wiki/Ancient_Power_Calculations) to learn more about how this was calculated'
				}
			])
		
		interaction.reply({ embeds: [ascEmbed] })
	}
}