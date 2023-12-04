import { REST, Routes } from 'discord.js';
import { getEnv } from '../utils/env';
import { client } from '../client';
import commands from '.';

const registerCommands = async () => {
    const rest = new REST().setToken(
        getEnv('NODE_ENV') === 'production'
            ? getEnv('DISCORD_PRODUCTION_BOT_TOKEN')
            : getEnv('DISCORD_DEVELOPMENT_BOT_TOKEN'),
    );
    if (!client.user?.id) return;
    const commandsBody = commands.map((cmd) => cmd.body.toJSON());
    await rest.put(Routes.applicationCommands(client.user.id), {
        body: commandsBody,
    });
};

export default registerCommands;
