import { ATTACHMENTS_PATH } from '../../constans';
import { getEnv } from '../../utils/env';
import prisma from '../../lib/prisma';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const PUBLIC_URL = getEnv('NEXT_PUBLIC_SERVER_URL');
const saveFile = promisify(fs.writeFile);

export const _createTicketTranscript = async (authorDiscordId: string, ticketId: string): Promise<false | string> => {
  const [config, ticketData] = await Promise.all([
    prisma.config.findFirst({ select: { autoCleanTicketFilesDays: true } }),
    prisma.ticket.findUnique({
      where: {
        authorDiscordId,
        id: ticketId,
      },
      select: {
        authorUsername: true,
        createdAt: true,
        closedAt: true,
        categoryName: true,
        coordinates: true,
        mapName: true,
        messages: {
          include: {
            attachments: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),
  ]);

  if (!config || !ticketData) return false;
  const { authorUsername, categoryName, createdAt, _count, coordinates, mapName } = ticketData;

  if (ticketData.closedAt) {
    const daysToMs = config.autoCleanTicketFilesDays * 24 * 60 * 60_000;
    if (ticketData.closedAt.getTime() + daysToMs < new Date().getTime()) return false;
  }

  const messages: string[] = [
    `Author: ${authorUsername}`,
    `Category: ${categoryName}`,
    `Total messages: ${_count.messages}`,
    `Created at: ${createdAt.toISOString()}`,
  ];

  if (coordinates) {
    messages.push(`Coordinates: ${coordinates}`);
  }
  if (mapName) {
    messages.push(`Map selected: ${mapName}`);
  }

  messages.push(
    `The transcript can be downloaded up to ${config.autoCleanTicketFilesDays} days after closing the ticket`,
  );
  messages.push('');

  ticketData.messages.forEach((message) => {
    let content = `[${message.authorName}]:`;
    if (message.content) content += ` ${message.content}`;
    if (message.attachments.length >= 1) {
      message.attachments.forEach((attachment) => {
        content += ` (${PUBLIC_URL}${attachment.path})`;
      });
    }
    messages.push(content);
  });

  messages.push('');
  messages.push(`Transcript created at: ${new Date().toISOString()}`);

  const filePath = path.resolve(ATTACHMENTS_PATH, authorDiscordId, ticketId, 'transcript.txt');

  try {
    await saveFile(filePath, messages.join('\n'), 'utf-8');
    const url = filePath.substring(filePath.indexOf('/attachments'));
    return url;
  } catch {
    return false;
  }
};
