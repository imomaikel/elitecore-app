import type { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { sendWebhookMessageOrEdit } from '../scripts/webhook';
import { CustomResponse } from '../constans/responses';
import { specialAvatar } from '../constans';
import type { Guild } from '@prisma/client';
import logger from '../scripts/logger';
import prisma from '../lib/prisma';
import { client } from '../client';

// All widgets that can be sent
type TWidgets = 'serverStatus' | 'serverNotify' | 'serverControl' | 'serverControlLog';
// Database message field related to widget
type TDBMessageFields = 'serverStatusChannelMessageId' | 'serverControlMessageId';
// Webhook fields
type TDBWebhookFields = keyof Guild;
// Database channel field related to widget
type TDBChannelFields =
  | 'serverStatusChannelId'
  | 'serverStatusNotifyChannelId'
  | 'serverControlChannelId'
  | 'serverControlLogChannelId';
// Broadcaster props
type TBroadcaster = {
  updateOnlyOneGuildId?: string;
  messageContent?: string;
  messageEmbeds?: EmbedBuilder[];
  widget: TWidgets;
  messageButtons?: ActionRowBuilder<ButtonBuilder>[];
};
// Broadcaster checker props
type TChecker = {
  allowedGuilds: Guild[];
  channelField: TDBChannelFields;
  messageField?: TDBMessageFields;
  webhookIdField: TDBWebhookFields;
  webhookTokenField: TDBWebhookFields;
};

/**
 * Send a widget to every possible discord server
 */
export const broadcaster = async ({
  widget,
  messageContent,
  messageEmbeds,
  updateOnlyOneGuildId,
  messageButtons,
}: TBroadcaster): Promise<CustomResponse<'broadcaster'>> => {
  // For each widget check for the guild's required settings

  if (widget === 'serverStatus') {
    const allowedGuilds = await prisma.guild.findMany({
      where: {
        serverStatusChannelId: {
          not: null,
        },
        ...(updateOnlyOneGuildId && {
          guildId: updateOnlyOneGuildId,
        }),
      },
    });
    return await broadcasterChecker({
      allowedGuilds,
      widget,
      messageContent,
      messageEmbeds,
      updateOnlyOneGuildId,
      messageField: 'serverStatusChannelMessageId',
      channelField: 'serverStatusChannelId',
      webhookIdField: 'serverStatusChannelWebhookId',
      webhookTokenField: 'serverStatusChannelWebhookToken',
    });
  } else if (widget === 'serverNotify') {
    const allowedGuilds = await prisma.guild.findMany({
      where: {
        serverStatusNotifyChannelId: {
          not: null,
        },
        ...(updateOnlyOneGuildId && {
          guildId: updateOnlyOneGuildId,
        }),
      },
    });
    return await broadcasterChecker({
      allowedGuilds,
      widget,
      messageContent,
      messageEmbeds,
      updateOnlyOneGuildId,
      channelField: 'serverStatusNotifyChannelId',
      webhookIdField: 'serverStatusNotifyChannelWebhookId',
      webhookTokenField: 'serverStatusNotifyChannelWebhookToken',
    });
  } else if (widget === 'serverControl') {
    const allowedGuilds = await prisma.guild.findMany({
      where: {
        serverControlChannelId: {
          not: null,
        },
      },
    });
    return await broadcasterChecker({
      allowedGuilds,
      channelField: 'serverControlChannelId',
      widget: 'serverControl',
      messageEmbeds,
      messageButtons,
      messageField: 'serverControlMessageId',
      webhookIdField: 'serverControlChannelWebhookId',
      webhookTokenField: 'serverControlChannelWebhookToken',
    });
  } else if (widget === 'serverControlLog') {
    const allowedGuilds = await prisma.guild.findMany({
      where: {
        serverControlLogChannelId: {
          not: null,
        },
      },
    });
    return await broadcasterChecker({
      allowedGuilds,
      channelField: 'serverControlLogChannelId',
      widget: 'serverControlLog',
      messageEmbeds,
      webhookIdField: 'serverControlLogChannelWebhookId',
      webhookTokenField: 'serverControlLogChannelWebhookToken',
    });
  } else {
    return { status: 'error' };
  }
};

/**
 * Check for permission, make sure that the channel exists, and send a message
 */
const broadcasterChecker = async ({
  allowedGuilds,
  updateOnlyOneGuildId,
  messageContent,
  messageEmbeds,
  messageField,
  channelField,
  webhookIdField,
  webhookTokenField,
}: TBroadcaster & TChecker): Promise<CustomResponse<'broadcaster'>> => {
  // Reject if there are no servers with configured widget channel
  if (allowedGuilds.length === 0 && updateOnlyOneGuildId) {
    return {
      status: 'error',
      details: {
        message: 'The widget channel is not set',
      },
    };
  }
  if (allowedGuilds.length === 0) return { status: 'error' };

  // Check every guild
  for await (const allowedGuild of allowedGuilds) {
    const channelId = allowedGuild[channelField] as string;
    const messageId = messageField ? allowedGuild[messageField] : undefined;
    const avatar = client.guilds.cache.get(allowedGuild.guildId)?.iconURL() ?? specialAvatar;
    try {
      // Send widget
      const action = await sendWebhookMessageOrEdit({
        channelId: channelId,
        messageId: messageId ?? undefined,
        webhookId: allowedGuild[webhookIdField] as string,
        webhookToken: allowedGuild[webhookTokenField] as string,
        customName: `${allowedGuild.guildName} Servers`,
        customAvatar: avatar,
        embeds: messageEmbeds,
        messageContent,
      });
      // Catch sending message error
      if (action.status === 'error') {
        if (updateOnlyOneGuildId) {
          return {
            status: 'error',
            details: {
              message: 'The bot has no permission',
            },
          };
        }
        continue;
      }

      // Update the message field when a new message is sent
      if (action.messageId.length >= 5) {
        const newMessageId = action.messageId;
        const newWebhookId = action.webhookId;
        const newWebhookToken = action.webhookToken;
        if (allowedGuild[webhookIdField] !== newWebhookId || allowedGuild[webhookTokenField] !== newWebhookToken) {
          await prisma.guild.update({
            where: {
              id: allowedGuild.id,
            },
            data: {
              ...(messageField &&
                messageField !== newMessageId && {
                  [messageField]: newMessageId,
                }),
              [webhookIdField]: newWebhookId,
              [webhookTokenField]: newWebhookToken,
            },
          });
        }
        if (updateOnlyOneGuildId) return { status: 'success' };
      }
    } catch (error) {
      console.log(11);
      console.log(error);
      // Catch unknown error
      logger({
        message: 'Unknown error',
        type: 'error',
        data: error,
        file: 'broadcaster',
      });
      return {
        status: 'error',
        details: {
          message: 'Unknown error',
        },
      };
    }
  }

  return { status: 'success' };
};
