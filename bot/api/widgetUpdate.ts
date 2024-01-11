import { createTicketCategoryWidget } from '../plugins/tickets';
import { verifyApiRequest } from '../helpers/verifyApi';
import { TAPI_WIDGETS } from '../constans/types';
import prisma from '../lib/prisma';

type TApiUpdateWidget = {
  guildId: string;
  userDiscordId: string;
  channelId: string;
  widgetName: TAPI_WIDGETS;
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
