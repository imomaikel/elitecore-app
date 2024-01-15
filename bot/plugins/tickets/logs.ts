import logger from '../../scripts/logger';
import { downloadAttachment } from '.';
import prisma from '../../lib/prisma';
import { Message } from 'discord.js';
import path from 'path';

const LOG_PATH = path.resolve(process.cwd(), 'public', 'attachments');

type TTicketLog = {
  message: Message;
  ticketAuthorId: string;
  ticketId: string;
};
export const _ticketLog = async ({ message, ticketAuthorId, ticketId }: TTicketLog) => {
  try {
    const content = message.content;

    const createAttachments: { name: string; path: string; contentType: string | null }[] = [];

    if (message.attachments.size >= 1) {
      const ticketLogPath = path.resolve(LOG_PATH, ticketAuthorId, ticketId);
      const attachments = message.attachments.map(({ id, name, url, contentType }) => ({ id, name, url, contentType }));
      for await (const { id, name, url, contentType } of attachments) {
        const result = await downloadAttachment({ id, ticketLogPath, url, name });
        if (result === false) continue;
        createAttachments.push({
          name,
          path: result,
          contentType,
        });
      }
    }

    if (content.length < 1 && createAttachments.length < 1) return;

    await prisma.ticket.update({
      where: { channelId: message.channel.id },
      data: {
        messages: {
          create: {
            id: message.id,
            authorAvatar: message.author.displayAvatarURL(),
            authorDiscordId: message.author.id,
            authorName: message.author.username,
            content: content.length >= 1 ? content : undefined,
            ...(createAttachments.length >= 1 && {
              attachments: {
                createMany: {
                  data: [...createAttachments],
                },
              },
            }),
          },
        },
      },
    });
  } catch (error) {
    logger({
      message: 'Ticket Log',
      type: 'error',
      data: JSON.stringify(error),
    });
  }
};
