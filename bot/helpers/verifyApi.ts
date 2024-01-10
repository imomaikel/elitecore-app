import { CustomResponse } from '../constans/responses';
import { apiMutualGuilds } from '../api';
import { client } from '../client';

type TVerifyApiRequest = {
  guildId: string;
  userDiscordId: string;
  channelId: string;
};
export const verifyApiRequest = async ({
  channelId,
  guildId,
  userDiscordId,
}: TVerifyApiRequest): Promise<CustomResponse<'broadcaster'>> => {
  const userGuilds = await apiMutualGuilds(userDiscordId);
  const guild = client.guilds.cache.get(guildId);
  if (!userGuilds || !userGuilds.some((entry) => entry.guildId === guildId) || !guild) {
    return {
      status: 'error',
      details: {
        message: 'User has no permission',
      },
    };
  }

  const channel = guild.channels.cache.get(channelId);
  if (!channel || !channel.isTextBased()) {
    return {
      status: 'error',
      details: {
        message: 'The channel does not exist',
      },
    };
  }
  const botPermissions = guild.members.me?.permissionsIn(channel);
  const hasPermission = botPermissions?.has('SendMessages');
  if (!hasPermission) {
    return {
      status: 'error',
      details: {
        message: 'The bot has no permission',
      },
    };
  }

  return {
    status: 'success',
    details: {
      message: 'Verified',
      data: {
        channel,
      },
    },
  };
};
