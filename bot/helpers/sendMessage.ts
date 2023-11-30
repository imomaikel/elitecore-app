import type { Channel, EmbedBuilder } from 'discord.js';
import { CustomResponse } from '../constans/responses';
import { client } from '../client';
import logger from '../scripts/logger';

// Send message props
type TSendMessage = {
    channelOrId: Channel | string;
    editMessageId?: string | null;
    messageContent?: string;
    messageEmbeds?: EmbedBuilder[];
};

/**
 * Check if a channel exists, check permissions, and make sure that the message is sent or edited
 */
export const sendMessage = async ({
    channelOrId,
    messageContent,
    messageEmbeds,
    editMessageId,
}: TSendMessage): Promise<CustomResponse<'sendMessage'>> => {
    const channel =
        typeof channelOrId === 'string'
            ? client.channels.cache.get(channelOrId)
            : channelOrId;

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
                if (message && message.id) findMessage = message;
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
            });
        } else {
            // Send a new message
            const newMessage = await channel.send({
                content: messageContent,
                embeds: messageEmbeds,
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
                    message: 'Missing Permissions',
                },
            };
        }
    }

    logger({
        message: 'Unknown error',
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
