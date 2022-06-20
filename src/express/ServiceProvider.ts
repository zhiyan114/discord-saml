import { restServer } from ".";
import { SP, IdP } from '../utils/samlProvider';
import fs from 'fs';
import { branding } from '../../config.json';
import { encrypt } from "../utils/Crypto";
import { isHttpsMode, baseURL } from '../express';
import { urlencoded } from "express";
import { setSchemaValidator } from 'samlify';
import { sendLog, LogType } from '../utils/eventLogger'
import { client } from '../discord';
import {saml} from '../../config.json'

// Ignore validator by default
setSchemaValidator({
    validate: (response: string) => {
      return Promise.resolve('skipped');
    }
});
// If the platform supports it, use a validator for better security (services like replit won't support it)
const xsdValidator = require('@authenio/samlify-xsd-schema-validator')
if(xsdValidator) setSchemaValidator(xsdValidator);

// Default Page Display
restServer.get('/',(req,res)=>{
    const templatePage = fs.readFileSync(__dirname+"/htmlFiles/index.html").toString("utf8");
    templatePage.replace(/{orgName}/gi,branding.name); // Replace all placeholder text for {orgName} to the branding name
    res.contentType("application/html").send(templatePage);
})
restServer.get('/sp/auth',(req,res)=>{
    if(!req.query.UID) return res.sendStatus(400).send("Invalid Authentication Request");
    res.cookie('DiscordUID', encrypt(req.query.UID as string).toString("base64"),{maxAge: 900, httpOnly: !isHttpsMode }) // Shouldn't take you more than 15 minutes to complete the authentication smh
    const {context} = SP.createLoginRequest(IdP, 'redirect');
    return res.redirect(context);
})
restServer.get('/sp/metadata',(req,res)=>{
    res.send(SP.getMetadata());
})
restServer.post('/sp/acs', urlencoded({ extended: false }), async (req,res) => {
    return res.sendStatus(501).send("INCOMPLTE");
    if(!req.cookies['DiscordUID']) return res.sendStatus(400).send("Invalid Authentication Response");
    SP.parseLoginResponse(IdP,'post',req).then(result => {
        // TODO: Use discord client to complete user authentication (or re-sync roles)
        const templatePage = fs.readFileSync(__dirname+"/htmlFiles/acs.html").toString("utf8");
        templatePage.replace(/{orgName}/gi, branding.name); // Replace all placeholder text for {orgName} to the branding name
        res.contentType("application/html").send(templatePage);
    }).catch(ex => {
        sendLog(LogType.Error,ex,{
            "From": `${baseURL}/sp/acs`
        })
        console.log("ACS Error: "+ex)
        return res.sendStatus(500).send("SAML Authentication Error, IT Department has been notified")
    })
})
restServer.post('/sp/slo', urlencoded({ extended: false }), (req,res)=>{
    // TODO: Complete Single Logout Service
    res.sendStatus(501).send("INCOMPLTE");
})
