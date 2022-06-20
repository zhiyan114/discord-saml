import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import { resetMemberStatus } from '../SPRoleHandler';
const ReauthCmd = new SlashCommandBuilder()
    .setName('reauth')
    .setDescription(`IT Admins: Reset all the user's authenticated status and request them to reauthenticate`)

/* Function Builder */
const ReauthFunc = async (interaction : CommandInteraction) => {
    if(!interaction.guild) return interaction.reply({content: 'Invalid Command Usage', ephemeral: true});
    if(!(interaction.member as GuildMember).permissions.has("ADMINISTRATOR")) return interaction.reply("Permission Insufficient, administrator is required to access this command.");
    interaction.deferReply({ephemeral: true});
    for(const [_,member] of interaction.guild.members.cache) {
        resetMemberStatus(member);
    }
    return await interaction.followUp({content: '501 NOT IMPLEMENTED', ephemeral: true});
    
}

export default {
    command: ReauthCmd,
    function: ReauthFunc,
    disabled: true,
}