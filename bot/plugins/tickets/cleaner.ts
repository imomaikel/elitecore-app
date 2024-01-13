import { client } from '../../client';
import prisma from '../../lib/prisma';
import { closeTicket } from '.';

export const _ticketCleaner = async () => {
  const emptyTickets = await prisma.ticket.findMany({
    where: {
      closedAt: null,
      messages: {
        none: {},
      },
    },
    include: {
      TicketCategory: {
        select: {
          autoClose: true,
        },
      },
    },
  });

  for await (const emptyTicket of emptyTickets) {
    const channelId = emptyTicket.channelId;
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      closeTicket({
        channelId,
        closedBy: 'Auto closed - channel not found',
      });
      continue;
    }
    const createdAt = emptyTicket.createdAt;
    const closeDelay = emptyTicket.TicketCategory?.autoClose;
    if (!closeDelay) continue;
    const closeDate = new Date(createdAt).getTime() + 1000 * 60 * closeDelay;
    if (closeDate > new Date().getTime()) continue;

    await closeTicket({
      channelId,
      closedBy: 'Auto closed',
    });
  }
};
