import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import { resetMemberStatus } from '../SPRoleHandler';
import { sendLog } from '../../utils/eventLogger';
const UnauthCmd = new SlashCommandBuilder()
    .setName('unauth')
    .setDescription(`IT Admins: Request a specific/all user(s) to be unauthenticated from the server`)
    .addUserOption(opt => 
        opt.setName('user')
        .setDescription('The user to reauthenticate, otherwise all users')
        .setRequired(false)
    )

/* Function Builder */
const UnauthFunc = async (interaction : CommandInteraction) => {
    const reauthUser = interaction.options.getMember('user',false) as GuildMember;
    if(!interaction.guild) return interaction.reply({content: 'Invalid Command Usage', ephemeral: true});
    if(!(interaction.member as GuildMember).permissions.has("ADMINISTRATOR")) return interaction.reply({content: "Permission Insufficient, administrator is required to access this command.", ephemeral: true});
    await interaction.deferReply({ephemeral: true});
    if(reauthUser) {
        if(reauthUser.permissions.has("ADMINISTRATOR")) return await interaction.followUp({content: "Cannot reauthenticate administrators", ephemeral: true})
        await resetMemberStatus(reauthUser);
        return await interaction.followUp({content: `${reauthUser.user.tag} has been unauthenticated`, ephemeral: true});;
    }
    for(const [_,member] of interaction.guild.members.cache) {
        if(member.permissions.has("ADMINISTRATOR")) continue;
        await resetMemberStatus(member);
    }
    return await interaction.followUp({content: 'All members has been unauthenticated', ephemeral: true});
    
}

export default {
    command: UnauthCmd,
    function: UnauthFunc,
    disabled: false,
}