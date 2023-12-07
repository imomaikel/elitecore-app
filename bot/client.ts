import { Client, GatewayIntentBits } from 'discord.js';
import { registerEvents } from './utils/events';
import { getEnv } from './utils/env';
import { Bot } from '@prisma/client';
import events from './events';

// Create bot instance
export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
// Create state container
export const clientStates = {
  usingServerControl: false,
  lastSelectionPicked: false,
};
// Create a container for bot clients
export const clientBots: {
  isLoggedIn: boolean;
  account: Client;
  data: Bot;
  hasPair?: boolean;
  lastPlayers?: number;
  lastStatus?: string;
  newNickname?: string;
  gameType?: string;
}[] = [];

// Listen for events
registerEvents(client, events);

// Start the bot
client.login(
  getEnv('NODE_ENV') === 'production'
    ? getEnv('DISCORD_PRODUCTION_BOT_TOKEN')
    : getEnv('DISCORD_DEVELOPMENT_BOT_TOKEN'),
);
