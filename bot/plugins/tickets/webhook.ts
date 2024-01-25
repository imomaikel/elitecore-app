import { sendWebhookMessageOrEdit } from '../../scripts/webhook';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type TSuccess = {
  status: 'success';
  message: 'Message sent!';
};
type TError = {
  status: 'error';
  message: string;
};
type TReturn = TSuccess | TError;
type TApiTicketWebhookMessage = {
  ticketId: string;
  content: string;
  userDiscordId: string;
  authorUsername: string;
  avatar?: string | undefined;
};
export const _apiTicketWebhookMessage = async ({
  content,
  ticketId,
  userDiscordId,
  authorUsername,
  avatar,
}: TApiTicketWebhookMessage): Promise<TReturn> => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) return { status: 'error', message: 'Ticket does not exist!' };
  if (ticket.closedAt) return { status: 'error', message: 'The ticket is closed!' };

  const { channelId, webhookId, webhookToken } = ticket;

  const channel = client.channels.cache.get(channelId);
  if (!channel?.id) return { status: 'error', message: 'Ticket does not exist!' };

  const action = await sendWebhookMessageOrEdit({
    channelId,
    webhookId,
    webhookToken,
    customAvatar: avatar,
    customName: authorUsername,
    messageContent: content,
  });

  if (action.status === 'error') {
    return { status: 'error', message: action.message };
  }

  if (action.webhookId !== ticket.webhookId) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        webhookId: action.webhookId,
        webhookToken: action.webhookToken,
      },
    });
  }

  const newMessage = await prisma.ticketMessage.create({
    data: {
      id: action.messageId,
      authorAvatar: avatar ?? 'https://cdn.discordapp.com/embed/avatars/3.png',
      authorDiscordId: userDiscordId,
      authorName: authorUsername,
      content,
      Ticket: {
        connect: {
          channelId: channelId,
        },
      },
    },
    include: {
      attachments: true,
    },
  });

  if (newMessage.ticketId) {
    if (!process.env.BOT_ONLY) {
      (await import('../../../server/socket')).socketNewMessage(newMessage, newMessage.ticketId);
    }
  }

  return { status: 'success', message: 'Message sent!' };
};
