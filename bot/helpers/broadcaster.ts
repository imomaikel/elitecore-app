import { CustomResponse } from '../constans/responses';
import type { EmbedBuilder } from 'discord.js';
import type { guilds } from '@prisma/client';
import { sendMessage } from './sendMessage';
import logger from '../scripts/logger';
import prisma from '../lib/prisma';

// All widgets that can be sent
type TWidgets = 'serverStatus' | 'serverNotify';
// Database message field related to widget
type TDBMessageFields = 'serverStatusChannelMessageId';
// Database channel field related to widget
type TDBChannelFields = 'serverStatusChannelId' | 'serverStatusNotifyChannelId';
// Broadcaster props
type TBroadcaster = {
    updateOnlyOneGuildId?: string;
    messageContent?: string;
    messageEmbeds?: EmbedBuilder[];
    widget: TWidgets;
};
// Broadcaster checker props
type TChecker = {
    allowedGuilds: guilds[];
    channelField: TDBChannelFields;
    messageField?: TDBMessageFields;
};

/**
 * Send a widget to every possible discord server
 */
export const broadcaster = async ({
    widget,
    messageContent,
    messageEmbeds,
    updateOnlyOneGuildId,
}: TBroadcaster): Promise<CustomResponse<'broadcaster'>> => {
    // For each widget check for the guild's required settings

    if (widget === 'serverStatus') {
        const allowedGuilds = await prisma.guilds.findMany({
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
        });
    } else if (widget === 'serverNotify') {
        const allowedGuilds = await prisma.guilds.findMany({
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
        try {
            // Send widget
            const action = await sendMessage({
                channelOrId: channelId,
                editMessageId: messageId,
                messageEmbeds,
                messageContent,
            });
            // Catch sending message error
            if (action.status === 'error') {
                if (updateOnlyOneGuildId) {
                    return {
                        status: 'error',
                        ...(action.details?.message && {
                            details: {
                                message: action.details.message,
                            },
                        }),
                    };
                }
                continue;
            }
            // If message the is edited there is no need to update the database field
            if (action?.details?.message === 'Message edited') {
                if (updateOnlyOneGuildId) return { status: 'success' };
                continue;
            }
            // Update the message field when a new message is sent
            if (action.details?.message === 'Message sent') {
                const newMessageId = action.details.data.messageId;
                if (messageField) {
                    await prisma.guilds.update({
                        where: {
                            id: allowedGuild.id,
                        },
                        data: {
                            [messageField]: newMessageId,
                        },
                    });
                }
                if (updateOnlyOneGuildId) return { status: 'success' };
            }
        } catch (error) {
            // Catch unknown error
            logger({
                message: 'Unknown error',
                type: 'error',
                data: JSON.stringify(error),
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
