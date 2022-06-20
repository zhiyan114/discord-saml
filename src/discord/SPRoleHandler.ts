import { GuildMember } from "discord.js"
import { saml } from '../../config.json'

interface IgroupMapping {
    [key: string]: string[]
}
export const configureMemberStatus = async (member: GuildMember, nickname?: string, groups?: string | string[]): Promise<void> => {
    if(nickname) member.setNickname(nickname,"SAML2.0 Signon: name attribute");
    if(!groups) return;
    if(typeof groups == "string") {
        if(!(saml.groupMapping as IgroupMapping)[groups]) return;
        for(const discordGroupID of (saml.groupMapping as IgroupMapping)[groups] as string[]) {
            const role = await member.guild.roles.fetch(discordGroupID);
            if(role) member.roles.add(role);
        }
        return;
    };
    for(const key of Object.keys(groups)) {
        if(!(saml.groupMapping as IgroupMapping)[key]) continue;
        for(const discordGroupID of (saml.groupMapping as IgroupMapping)[key] as string[]) {
            const role = await member.guild.roles.fetch(discordGroupID);
            if(role) member.roles.add(role);
        }
    }
}

export const resetMemberStatus = async (member: GuildMember) => {
    member.setNickname(null,"SAML2.0 Signout");
    for(const discordGroupIDList of Object.values(saml.groupMapping)) {
        for(const discordGroupID of discordGroupIDList) {
            const SAMLRole = member.roles.cache.find(role=> role.id === discordGroupID);
            if(SAMLRole) member.roles.remove(SAMLRole);
        }
    }
}