import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { webServer, branding} from '../../../config.json'
import {baseURL} from '../../express'
import { encrypt } from '../../utils/Crypto';
import querystring from 'querystring';
const SignoutReqCmd = new SlashCommandBuilder()
    .setName('signout')
    .setDescription(`Logout of ${branding.name}'s server and IdP page`)

/* Function Builder */
const SignoutReqFunc = async (interaction : CommandInteraction) => {
    //const signoutQuery = querystring.stringify({Name: encrypt((interaction.member as GuildMember).nickname!).toString("base64") }); // I'll figure out this deprecated work later
    const signoutQuery = querystring.stringify({UID: encrypt(interaction.user.id).toString("base64") });
    const embed = new MessageEmbed();
    embed.setTitle('Signout Request');
    embed.setDescription(`Please click the link to be redirected to ${branding.name}'s signout page: ${baseURL}sp/signout?${signoutQuery}} (please note that both of your roles and server name will be reset be default value)`);
    embed.setURL(`${baseURL}sp/signout?${signoutQuery}`);
    embed.setColor('#FFFF00');
    return await interaction.reply({embeds:[embed], ephemeral: true});
}

export default {
    command: SignoutReqCmd,
    function: SignoutReqFunc,
    disabled: false,
}