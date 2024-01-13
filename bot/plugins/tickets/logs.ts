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
  const content = message.content;

  const createAttachments: { name: string; path: string }[] = [];

  if (message.attachments.size >= 1) {
    const ticketLogPath = path.resolve(LOG_PATH, ticketAuthorId, ticketId);
    const attachments = message.attachments.map(({ id, name, url }) => ({ id, name, url }));
    for await (const { id, name, url } of attachments) {
      const result = await downloadAttachment({ id, ticketLogPath, url, name });
      if (result === false) continue;
      createAttachments.push({
        name,
        path: result,
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
};
