import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
const ReauthCmd = new SlashCommandBuilder()
    .setName('reauth')
    .setDescription(`Reauthenticate all the users (should run once a while after removing users from your IdP)`)

/* Function Builder */
const ReauthFunc = async (interaction : CommandInteraction) => {
    // TODO: Work on reauthentication functionality
    return await interaction.reply({content: '501 NOT IMPLEMENTED', ephemeral: true});
}

export default {
    command: ReauthCmd,
    function: ReauthFunc,
    disabled: true,
}