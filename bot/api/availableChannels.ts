import { ChannelType } from 'discord.js';
import { client } from '../client';

/**
 * Returns all of the possible channels that the bot can see
 * @param guildId Discord Server ID
 */
const apiAvailableChannels = async (guildId: string, type: 'TEXT' | 'CATEGORY' = 'TEXT') => {
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild || !client.user?.id) return null;

    const response = guild.channels.cache
      .filter((channel) => channel.type === (type === 'TEXT' ? ChannelType.GuildText : ChannelType.GuildCategory))
      .map((channel) => ({
        channelName: channel.name,
        channelId: channel.id,
      }));

    return response.length > 0 ? response : null;
  } catch (error) {
    return null;
  }
};

export default apiAvailableChannels;
