# Discord Saml
A self-host enterprise authentication solution for your discord server. SAML2.0 is one of the great tool for IT admin to manage lots of user credentials from a signle IdP. Unfortunately, many services only provide such services if they pay a "premium" price for it (see https://sso.tax for examples). Since discord does not have such solution and I do not believe in extra cost to use this feature, the sources are open to everyone.

# SP information
Service Provider information are automatically generated when you compile and start the server. The following lists all the SP's URL:
* Metadata: `{baseURL}/sp/metadata`
* Authentication URL: `{baseURL}/sp/auth` (URL where authentication request will be made and redirect user to the IdP's sign-in page)
* Entity ID: `{baseURL}/sp`
* Assertion Consumer Service: `{baseURL}/sp/acs`
* Single Logout Service: `{baseURL}/sp/slo`

Your base URL will be the protcol prefix follow by the FQDN you set in your configuration file `http(s)://example.com/`


# Configuration Guide
File: config.json
* clientID - This should be the Client/Application ID for the discord bot. This will only be used for slash command registration purpose.
* botToken - This should be the authentication token for the discord bot. This token will be used for all API calls.
* guildID - This is the guild ID which the bot will operate in (this bot is intended to operate in one server at a time) 
* webServer - Configuration for WebServer
    * FQDN - Full Qualified Domain Name for the server
    * https - This should be used for secure websocket and REST request (if either option is empty, an insecured HTTP will be launched instead) !! HIGHLY RECOMMEND: IdP such as ADFS has a mandatory requirement for secure protocol !!
        * certificate - Certificate (.crt/.cer) for HTTPS
        * key - Private key associated with the certificate
    * webServerPort - Custom Port for the webserver (regardless if it http or https mode)
* logChannelID - Channel ID to log all information (including user authentications)
* saml - All SAML related configuration
    * idpConfig - Configuration for your IdP (see: https://samlify.js.org/#/idp-configuration for manual configuration)
    * metadata - A xml string containing your IdP information (other field of the configuration are not required if this field is provided)
    * attributeMapping - Standard Attribute Mapping for saml
        * name - Mapping for user's full name (automatically set authenticated user's nickname to their IdP's name)
        * group - Mapping for user's assigned groups/roles (automatically assign discord roles based on the groupMapping's configuration)
    * groupMapping - List of roles to grant based on the user's group from the IdP
        * SamlGroupValue: [DiscordGroupID,...]
        * Example: "Administrator": [123456789, 234567890, ...]

* branding - Custom Branding Configuration
    * name - Your organization's name