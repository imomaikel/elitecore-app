import { CustomResponse } from '../constans/responses';
import logger from '../scripts/logger';
import { client } from '../client';
import type { ActionRowBuilder, ButtonBuilder, Channel, EmbedBuilder } from 'discord.js';

// Send message props
type TSendMessage = {
  channelOrId: Channel | string;
  editMessageId?: string | null;
  messageContent?: string;
  messageEmbeds?: EmbedBuilder[];
  messageButtons?: ActionRowBuilder<ButtonBuilder>[];
};

/**
 * Check if a channel exists, check permissions, and make sure that the message is sent or edited
 */
export const sendMessage = async ({
  channelOrId,
  messageContent,
  messageEmbeds,
  editMessageId,
  messageButtons,
}: TSendMessage): Promise<CustomResponse<'sendMessage'>> => {
  const channel = typeof channelOrId === 'string' ? client.channels.cache.get(channelOrId) : channelOrId;

  // Check if the channel exists
  if (!channel || !channel.id || !channel.isTextBased()) {
    return {
      status: 'error',
      details: {
        message: 'Could not find the channel',
      },
    };
  }

  try {
    let findMessage = null;
    // Check if the message should be edited only
    if (editMessageId) {
      try {
        const message = await channel.messages.fetch(editMessageId);
        if (message && message.id === message.author.id) findMessage = message;
      } catch {
        // Message not found
        findMessage = null;
      }
    }
    let newMessageId = null;
    if (findMessage?.id) {
      // Edit message
      await findMessage.edit({
        content: messageContent,
        embeds: messageEmbeds,
        components: messageButtons,
      });
    } else {
      // Send a new message
      const newMessage = await channel.send({
        content: messageContent,
        embeds: messageEmbeds,
        components: messageButtons,
      });
      newMessageId = newMessage.id;
    }
    // Return the message id if it was edited
    return {
      status: 'success',
      details: {
        message: newMessageId ? 'Message sent' : 'Message edited',
        data: {
          messageId: newMessageId || '',
        },
      },
    };
  } catch (error: any) {
    // Reject: No permission
    if (error.message && error.message === 'Missing Permissions') {
      return {
        status: 'error',
        details: {
          message: 'The bot has no permission',
        },
      };
    } else {
      logger({
        message: 'Unknown error (1)',
        type: 'error',
        file: 'sendMessage',
        data: JSON.stringify(error),
      });
    }
  }

  logger({
    message: 'Unknown error (2)',
    type: 'error',
    file: 'sendMessage',
  });
  return {
    status: 'error',
    details: {
      message: 'Unknown error',
    },
  };
};
