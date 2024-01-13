import { sendMessage } from '../../helpers/sendMessage';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type TCloseTicket = {
  closedBy: string;
  channelId: string;
};
export const _closeTicket = async ({ closedBy, channelId }: TCloseTicket) => {
  const closedTicket = await prisma.ticket.update({
    where: { channelId, closedAt: null },
    data: {
      closedAt: new Date(),
      closedBy,
    },
    select: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
  if (closedTicket._count.messages <= 1) {
    await prisma.ticket.delete({
      where: { channelId },
    });
  }

  await client.channels.cache
    .get(channelId)
    ?.delete()
    .catch(async () => {
      await sendMessage({
        channelOrId: channelId,
        messageContent: 'I could not close the ticket.',
      }).catch(() => {});
    });
};
