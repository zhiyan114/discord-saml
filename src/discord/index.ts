
import { Client, Intents } from 'discord.js';
import * as config from '../../config.json';
import { initailizeLogger, sendLog, LogType } from '../utils/eventLogger';


/* Client Loader */
export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS], partials: ["CHANNEL"] });
client.on('ready', async () => {
  client.user!.setPresence({
    status: "dnd",
    activities: [{
      name: "all SAML authentication",
      type: "WATCHING",
    }]
  })
  await initailizeLogger(client);
  await sendLog(LogType.Info, "Discord.js client has been initialized!");
  console.log(`Logged in as ${client.user!.tag}!`);
});

// Start the client
client.login(config['botToken']);