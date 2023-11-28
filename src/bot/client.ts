import { Client, GatewayIntentBits } from 'discord.js';
import { registerEvents } from './utils/events';
import { getEnv } from './utils/env';
import events from './events';

// Create bot instance
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
// Listen for events
registerEvents(client, events);

// Start the bot
client.login(
    getEnv('NODE_ENV') === 'production'
        ? getEnv('DISCORD_PRODUCTION_BOT_TOKEN')
        : getEnv('DISCORD_DEVELOPMENT_BOT_TOKEN'),
);
