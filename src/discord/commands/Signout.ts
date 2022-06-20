import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { webServer, branding} from '../../../config.json'
import {baseURL} from '../../express'
const SignoutReqCmd = new SlashCommandBuilder()
    .setName('signout')
    .setDescription(`Logout of ${branding.name}'s server and IdP page`)

/* Function Builder */
const SignoutReqFunc = async (interaction : CommandInteraction) => {
    return await interaction.reply({content: "501: NOT IMPLEMENTED", ephemeral: true})
    const embed = new MessageEmbed();
    embed.setTitle('Signout Request');
    embed.setDescription(`Please click the link to be redirected to ${branding.name}'s signout page: ${baseURL}/sp/logout?UID=${interaction.user.id} (please note that both of your roles and server name will be reset be default value)`);
    embed.setURL(`${baseURL}/sp/logout?UID=${interaction.user.id}`);
    embed.setColor('#FFFF00');
    return await interaction.reply({embeds:[embed], ephemeral: true});
}

export default {
    command: SignoutReqCmd,
    function: SignoutReqFunc,
    disabled: false,
}