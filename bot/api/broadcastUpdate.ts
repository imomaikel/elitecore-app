import updateServerStatusWidget from '../plugins/server-status';
import { TAPI_BROADCAST_WIDGETS } from '../constans/types';
import { verifyApiRequest } from '../helpers/verifyApi';
import { CustomResponse } from '../constans/responses';
import logger from '../scripts/logger';
import prisma from '../lib/prisma';

type TUpdateChannel = {
  guildId: string;
  userDiscordId: string;
  channelId: string;
  widgetName: TAPI_BROADCAST_WIDGETS;
};
/**
 * Updates a channel in the database if it exists and the user has access to that guild also sends a widget with a response if needed
 * @param channelId New channel id
 * @param guildId Currently selected guild
 * @param userDiscordId Discord ID of a user logged in at the web panel
 * @param widgetName All possible actions
 */
const apiUpdateBroadcastChannel = async ({
  channelId,
  guildId,
  userDiscordId,
  widgetName,
}: TUpdateChannel): Promise<CustomResponse<'broadcaster'>> => {
  try {
    const verifyRequest = await verifyApiRequest({ channelId, guildId, userDiscordId });
    if (verifyRequest.status === 'error') {
      return verifyRequest;
    }
    const channel = verifyRequest?.details?.data.channel;

    if (!channel) {
      return { status: 'error', details: { message: 'Unknown error' } };
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
      } else {
        await prisma.guild.update({
          where: { guildId },
          data: {
            logs: {
              create: {
                content: `Updated server status widget channel to "${channel.name}"`,
                Author: {
                  connect: {
                    discordId: userDiscordId,
                  },
                },
              },
            },
          },
        });
      }
      return action;
    } else if (widgetName === 'serverStatusNotify') {
      await prisma.guild.update({
        where: { guildId },
        data: { serverStatusNotifyChannelId: channel.id },
      });
      await prisma.guild.update({
        where: { guildId },
        data: {
          logs: {
            create: {
              content: `Updated server status notification channel to "${channel.name}"`,
              Author: {
                connect: {
                  discordId: userDiscordId,
                },
              },
            },
          },
        },
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
      data: error,
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

export default apiUpdateBroadcastChannel;
