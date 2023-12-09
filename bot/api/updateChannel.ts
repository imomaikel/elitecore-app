import updateServerStatusWidget from '../plugins/server-status';
import { CustomResponse } from '../constans/responses';
import apiMutualGuilds from './mutualGuilds';
import logger from '../scripts/logger';
import { client } from '../client';
import prisma from '../lib/prisma';

export const API_CHANNEL_ACTIONS = ['serverStatusWidget', 'serverStatusNotify'];
export type API_CHANNEL_ACTIONS = 'serverStatusWidget' | 'serverStatusNotify';
type TUpdateChannel = {
  guildId: string;
  userDiscordId: string;
  channelId: string;
  widgetName: API_CHANNEL_ACTIONS;
};
/**
 * Updates a channel in the database if it exists and the user has access to that guild also sends a widget with a response if needed
 * @param channelId New channel id
 * @param guildId Currently selected guild
 * @param userDiscordId Discord ID of a user logged in at the web panel
 * @param widgetName All possible actions
 */
const apiUpdateChannel = async ({
  channelId,
  guildId,
  userDiscordId,
  widgetName,
}: TUpdateChannel): Promise<CustomResponse<'broadcaster'>> => {
  try {
    if (!API_CHANNEL_ACTIONS.includes(widgetName)) {
      return {
        status: 'error',
        details: {
          message: 'Bad request',
        },
      };
    }
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

    if (widgetName === 'serverStatusWidget') {
      const oldChannel = await prisma.guild.findFirst({
        where: { guildId: guildId },
        select: { serverStatusChannelId: true },
      });
      await prisma.guild.update({
        where: { guildId },
        data: { serverStatusChannelId: channel.id },
      });
      const action = await updateServerStatusWidget(guildId);
      if (action.status === 'error') {
        await prisma.guild.update({
          where: { guildId },
          data: { serverStatusChannelId: oldChannel?.serverStatusChannelId },
        });
      }
      return action;
    } else if (widgetName === 'serverStatusNotify') {
      await prisma.guild.update({
        where: { guildId },
        data: { serverStatusNotifyChannelId: channel.id },
      });
      return {
        status: 'success',
      };
    }
    return {
      status: 'error',
      details: {
        message: 'Unknown error',
      },
    };
  } catch (error) {
    logger({
      message: 'Unknown error',
      type: 'error',
      data: JSON.stringify(error),
      file: 'updateChannel',
    });
    return {
      status: 'error',
      details: {
        message: 'Unknown error',
      },
    };
  }
};

export default apiUpdateChannel;
