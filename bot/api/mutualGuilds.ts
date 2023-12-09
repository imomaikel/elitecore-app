import { client } from '../client';

/**
 * Returns array of mutual guilds with user or null
 * @param userDiscordId Discord ID of a user logged in at the web panel
 */
const apiMutualGuilds = async (userDiscordId: string) => {
  try {
    const response = [];
    for await (const guildEntries of client.guilds.cache) {
      const guild = guildEntries['1'];
      const isUserInGuild = await guild.members
        .fetch(userDiscordId)
        .then(() => true)
        .catch(() => false);
      if (!isUserInGuild) continue;
      response.push({
        guildName: guild.name,
        guildId: guild.id,
      });
    }
    return response.length > 0 ? response : null;
  } catch (error) {
    return null;
  }
};

export default apiMutualGuilds;
