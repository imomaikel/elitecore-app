import registerCommands from '../commands/deploy';
import scheduler from '../scripts/scheduler';
import { event } from '../utils/events';
import logger from '../scripts/logger';
import prisma from '../lib/prisma';

// Wait for client to start
export default event('ready', async (client) => {
    // Add new guilds to the database
    const storedGuilds = (
        await prisma.guilds.findMany({
            select: {
                guildId: true,
            },
        })
    ).map((entry) => entry.guildId);
    for await (const guildEntries of client.guilds.cache) {
        const guild = guildEntries['1'];
        if (storedGuilds.includes(guild.id)) continue;
        try {
            await prisma.guilds.create({
                data: {
                    guildId: guild.id,
                    guildName: guild.name,
                },
            });
            logger({
                message: `Added a new guild: ${guild.name}`,
                type: 'info',
            });
        } catch (error) {
            logger({
                message: 'Failed to add guild to the database',
                type: 'error',
                data: JSON.stringify(error),
                file: 'ready',
            });
        }
    }

    // Send ready status message
    logger({
        type: 'info',
        message: `Discord Client started as '${client.user?.username}' (${process.env.NODE_ENV})`,
    });

    // Schedule tasks
    if (process.env.NODE_ENV === 'production') {
        scheduler();
    }

    // Register client commands
    registerCommands();
});
