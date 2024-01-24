import logger from '../../scripts/logger';
import prisma from '../../lib/prisma';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const ATTACHMENTS_PATH = path.resolve(process.cwd(), 'public', 'attachments');
const unlinkDirectory = promisify(fs.rm);

export const _cleanTicketAttachments = async () => {
  const [closedTickets, config] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        closedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        closedAt: true,
      },
    }),
    prisma.config.findFirst({ select: { autoCleanTicketFilesDays: true } }),
  ]);

  if (!config) return;

  const { autoCleanTicketFilesDays } = config;

  const directories = (await promisify(fs.readdir)(ATTACHMENTS_PATH, { recursive: true, withFileTypes: true })).filter(
    (dirent) => dirent.isDirectory() && !dirent.path.endsWith('/attachments'),
  );

  const now = new Date().getTime();

  for await (const directory of directories) {
    const ticket = closedTickets.find((entry) => entry.id === directory.name);
    if (!ticket || !ticket.closedAt) continue;

    const daysAfterClose = Math.floor((now - ticket.closedAt.getTime()) / 60_000 / 60 / 24);
    const ticketAttachmentsPath = path.resolve(directory.path, directory.name);
    if (daysAfterClose < autoCleanTicketFilesDays) continue;

    await unlinkDirectory(ticketAttachmentsPath, { force: true, recursive: true }).catch((error) => {
      logger({
        message: 'Failed to unlink directory',
        type: 'error',
        data: error,
        file: 'filesystem',
      });
    });
  }
};
