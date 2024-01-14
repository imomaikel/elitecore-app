import { sendMessage } from '../../helpers/sendMessage';
import { EmbedBuilder, hyperlink } from 'discord.js';
import { avatars, colors } from '../../constans';
import { getEnv } from '../../utils/env';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type TCloseTicket = {
  closedBy: string;
  channelId: string;
  autoClose?: boolean;
};
export const _closeTicket = async ({ closedBy, channelId, autoClose }: TCloseTicket) => {
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
      id: true,
      authorDiscordId: true,
      TicketCategory: {
        select: {
          name: true,
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

  const authorDiscordId = closedTicket.authorDiscordId;

  if (autoClose) return;

  try {
    const user = await client.users.fetch(authorDiscordId);
    if (!user.id) return;

    const closeEmbed = new EmbedBuilder()
      .setColor(colors.purple)
      .setAuthor({ name: 'EliteCore Tickets' })
      .setFooter({ text: `Closed by: ${closedBy}` })
      .setThumbnail(avatars.defaultAvatar)
      .setTimestamp();

    const ticketLogsUrl = `${getEnv('NEXT_PUBLIC_SERVER_URL')}/dashboard/tickets/${closedTicket.id}`;
    const allTicketsUrl = `${getEnv('NEXT_PUBLIC_SERVER_URL')}/dashboard/tickets`;

    closeEmbed.setDescription(
      `Hello, _${user.username.replace(/_/gi, ' ')}_ :wave:\nYour \`${
        closedTicket.TicketCategory?.name ?? 'Discord'
      }\` ticket has been resolved and closed.\nYou can view the ticket logs ${hyperlink(
        'here',
        ticketLogsUrl,
      )} or your all tickets ${hyperlink('here', allTicketsUrl)}\n\nThank you for using our services :dizzy:`,
    );

    await user.send({
      embeds: [closeEmbed],
    });
  } catch {}
};
