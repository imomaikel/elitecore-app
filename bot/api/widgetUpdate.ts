import { createTicketCategoryWidget } from '../plugins/tickets';
import { API_CHANNEL_ACTIONS_LIST } from '../constans/types';
import { verifyApiRequest } from '../helpers/verifyApi';
import prisma from '../lib/prisma';
import { z } from 'zod';

type TApiUpdateWidget = {
  guildId: string;
  userDiscordId: string;
  channelId: string;
  widgetName: z.infer<typeof API_CHANNEL_ACTIONS_LIST>;
};
export const apiUpdateWidget = async ({ channelId, guildId, userDiscordId, widgetName }: TApiUpdateWidget) => {
  const verifyRequest = await verifyApiRequest({ channelId, guildId, userDiscordId });
  if (verifyRequest.status === 'error') {
    return verifyRequest;
  }

  const channel = verifyRequest?.details?.data.channel;

  if (!channel) {
    return { status: 'error', details: { message: 'Unknown error' } };
  }

  if (widgetName === 'ticketWidget') {
    await prisma.guild.update({
      where: { guildId },
      data: {
        ticketCategoryChannelId: channel.id,
      },
    });
    return await createTicketCategoryWidget(guildId);
  }
};
