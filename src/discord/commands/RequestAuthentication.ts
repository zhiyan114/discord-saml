import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { webServer, branding} from '../../../config.json'
import {baseURL} from '../../express'
const AuthReqCmd = new SlashCommandBuilder()
    .setName('authenticate')
    .setDescription(`Login to ${branding.name}'s server`)

/* Function Builder */
const AuthReqFunc = async (interaction : CommandInteraction) => {
    const embed = new MessageEmbed();
    embed.setTitle('Authentication Request');
    embed.setDescription(`Please click the link to be redirected to ${branding.name}'s authentication page: ${baseURL}/sp/auth?UID=${interaction.user.id}`);
    embed.setURL(`${baseURL}/sp/auth?UID=${interaction.user.id}`);
    embed.setColor('#00FFFF');
    return await interaction.reply({embeds:[embed], ephemeral: true});
}

export default {
    command: AuthReqCmd,
    function: AuthReqFunc,
    disabled: false,
}