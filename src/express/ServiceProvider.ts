import { restServer } from ".";
import { SP, IdP } from '../utils/samlProvider';
import fs from 'fs';
import { encrypt,decrypt } from "../utils/Crypto";
import { isHttpsMode, baseURL } from '../express';
import { urlencoded, raw } from "express";
import { setSchemaValidator } from 'samlify';
import { sendLog, LogType } from '../utils/eventLogger'
import { client } from '../discord';
import { saml, guildID, branding } from '../../config.json'
import { DiscordAPIError, Constants } from "discord.js";
import { configureMemberStatus, resetMemberStatus } from '../discord/SPRoleHandler';
import { v4 as uuid } from 'uuid';

// If the platform supports it, use a validator for better security (services like replit won't support it)
try {
    const xsdValidator = require('@authenio/samlify-xsd-schema-validator')
    if(xsdValidator) setSchemaValidator(xsdValidator);
} catch(ex) {
    setSchemaValidator({
        validate: (response: string) => {
          return Promise.resolve('skipped');
        }
    });
}

// Default Page Display
restServer.get('/',(req,res)=>{
    let templatePage = fs.readFileSync(__dirname+"/htmlFiles/index.html").toString("utf8");
    templatePage = templatePage.replace(/{orgName}/gi,branding.name); // Replace all placeholder text for {orgName} to the branding name
    res.contentType("text/html").send(templatePage);
})

restServer.get('/sp/auth',(req,res)=>{
    if(!req.query.UID) return res.status(400).send("Invalid Authentication Request");
    res.cookie('auth-DiscordUID', encrypt(req.query.UID as string).toString("base64"),{maxAge: 900000, httpOnly: !isHttpsMode }) // Shouldn't take you more than 15 minutes to complete the authentication smh
    const {context} = SP.createLoginRequest(IdP, 'redirect');
    return res.redirect(context);
})
restServer.get('/sp/signout', async (req,res)=>{
    if(!req.query.UID) return res.status(400).send("Invalid Signout Request");
    // Get and check guild
    const guild = client.guilds.cache.find(obj=> obj.id === guildID);
    if(!guild) return res.status(501).send("Configuration Error: Guild ID is empty/invalid");
    // Get the user from the server and log them out
    const member = guild.members.cache.find(member=>member.user.id === decrypt(req.query.UID as string).toString("utf8"));
    if(!member) return res.status(400).send("You're not in the organization's discord server during the signout process");
    await resetMemberStatus(member);
    return res.send("Server signout was successful, IdP however cannot be signed out at this time.");
    /* NOTE: Samlify doesn't support SP Signout Request
    res.cookie('signout-DiscordName', req.query.Name,{maxAge: 900, httpOnly: !isHttpsMode }) // Shouldn't take you more than 15 minutes to complete the authentication smh
    const {context} = SP.createLogoutRequest(IdP, 'redirect',{
        logoutNameID: req.query.Name,
        sessionIndex: uuid(),
    });
    return res.redirect(context);
    */
})

restServer.get('/sp/metadata',(req,res)=>{
    res.contentType('application/xml');
    res.send(SP.getMetadata());
})

restServer.post('/sp/acs', urlencoded({ extended: false }), async (req,res) => {
    //return res.status(501).send("INCOMPLTE");
    if(!req.cookies['auth-DiscordUID']) return res.status(400).send("Invalid Authentication Response");
    try {
        const result = await SP.parseLoginResponse(IdP,'post',req);

        // Get and check guild
        const guild = client.guilds.cache.find(obj=> obj.id === guildID);
        if(!guild) return res.status(501).send("Configuration Error: Guild ID is empty/invalid");
        // Get and check user
        const member = await guild.members.fetch(decrypt(req.cookies['auth-DiscordUID']).toString("utf-8"))
        res.cookie('auth-DiscordUID','',{maxAge: 1})
        // Let the role handler do the work
        await configureMemberStatus(member, result.extract.attributes && result.extract.attributes[saml.attributeMapping.name], result.extract.attributes && result.extract.attributes[saml.attributeMapping.group]);
        // Prepare success page and send it
        let templatePage = fs.readFileSync(__dirname+"/htmlFiles/acs.html").toString("utf8");
        templatePage = templatePage.replace(/{orgName}/gi, branding.name); // Replace all placeholder text for {orgName} to the branding name
        res.contentType("text/html").send(templatePage);
        sendLog(LogType.Info,"SAML Authentication has been successful",{
            "Discord ID": member.user.tag,
            "IdP Name": result.extract.attributes && result.extract.attributes[saml.attributeMapping.name],
        })
    } catch(ex : any) {
        // Handle some of the possible user generated errors
        if(ex instanceof DiscordAPIError && ex.code == Constants.APIErrors.UNKNOWN_MEMBER) return res.status(400).send(`You are no longer in ${branding.name}'s discord server`);
        if(ex instanceof Error && ex.name == "ERR_CRYPTO_INVALID_AUTH_TAG") return res.status(400).send("Invalid Authentication Response");
        // Other errors that aren't handled or non-user errors
        sendLog(LogType.Error,ex,{
            "From": `${baseURL}sp/acs`,
            "isDiscordError": (ex instanceof DiscordAPIError).toString()
        })
        console.log("ACS Error: "+ex)
        return res.status(500).send("SAML Authentication Error, IT Department has been notified")
    }
})
restServer.post('/sp/slo', urlencoded({ extended: false }), async (req,res)=>{
    console.log("SLO REQUEST DETECTED")
    //return res.status(501).send("Samlify has no SLO documentation so I'll try and figure that one out later")
    // IdP initialized signout request because there literally isn't a way for user's to signout
    // TODO: Complete Single Logout Service
    try {
        // Get and check guild
        const guild = client.guilds.cache.find(obj=> obj.id === guildID);
        if(!guild) return res.status(501).send("Configuration Error: Guild ID is empty/invalid");
        
        // IdP Signout Request
        if(req.body.SAMLRequest) {
            // Signout Request from IdP
            const reqResult = await SP.parseLogoutRequest(IdP,"post",req)
            // Get the user from the server and log them out
            const member = guild.members.cache.find(member=>member.nickname === reqResult.extract.nameID);
            if(!member) return res.status(400).send("You're not in the organization's discord server during the signout process");
            await resetMemberStatus(member);
            const {context} = SP.createLogoutResponse(IdP,reqResult,"redirect")
            return res.redirect(context);
        }
        return res.status(501).send("ONLY IdP initialized signout request are supported at this time")
        if(!req.cookies['logout-DiscordName']) return res.status(400).send("Invalid Logout Response");
        const result = await SP.parseLogoutResponse(IdP,'post',req)
        console.log(result.extract)
        //const member = await guild.members.fetch(decrypt(req.cookies['logout-DiscordUID']).toString("utf-8"))
        //await resetMemberStatus(member);
        const templatePage = fs.readFileSync(__dirname+"/htmlFiles/slo.html").toString("utf8");
        templatePage.replace(/{orgName}/gi, branding.name); // Replace all placeholder text for {orgName} to the branding name
        res.contentType("text/html").send(templatePage);
    } catch(ex : any) {
        if(ex instanceof DiscordAPIError && ex.code == Constants.APIErrors.UNKNOWN_MEMBER) return res.status(400).send(`You are no longer in ${branding.name}'s discord server`);
        if(ex instanceof Error && ex.name == "ERR_CRYPTO_INVALID_AUTH_TAG") return res.status(400).send("Invalid Authentication Response");
        // Other errors that aren't handled or non-user errors
        sendLog(LogType.Error,ex,{
            "From": `${baseURL}sp/slo`,
            "isDiscordError": (ex instanceof DiscordAPIError).toString()
        })
        console.log("SLO Error: "+ex)
        return res.status(500).send("SAML Authentication Error, IT Department has been notified")
    }
})
