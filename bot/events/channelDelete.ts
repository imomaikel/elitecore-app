import { event } from '../utils/events';
import prisma from '../lib/prisma';

export default event('channelDelete', async (_, channel) => {
  if (!channel.isTextBased()) return;

  const channelId = channel.id;

  try {
    const messageCount = (
      await prisma.ticket.findUnique({
        where: { channelId },
        select: {
          _count: {
            select: {
              messages: true,
            },
          },
        },
      })
    )?._count.messages;

    if (!messageCount) return;

    if (messageCount <= 0) {
      await prisma.ticket.delete({
        where: { channelId },
      });
      return;
    }
    await prisma.ticket.update({
      where: { channelId },
      data: {
        closedAt: new Date(),
        closedBy: 'The channel was deleted',
      },
    });
  } catch {}
});
