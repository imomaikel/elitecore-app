import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, hyperlink } from 'discord.js';
import { CustomResponse } from '../../constans/responses';
import { sendMessage } from '../../helpers/sendMessage';
import { colors, extraSigns } from '../../constans';
import { getEnv } from '../../utils/env';
import prisma from '../../lib/prisma';
import { client } from '../../client';

/**
 * Create a ticket widget message and send or update
 * @param guildId Guild ID where the message should be sent
 */
export const _createCategoryWidget = async (
  guildId: string,
): Promise<CustomResponse<'ticketWidget'> | CustomResponse<'sendMessage'>> => {
  if (!client.user?.id) return { status: 'error', details: { message: 'Internal Server Error' } };

  const guildData = await prisma.guild.findUnique({
    where: { guildId },
    include: {
      ticketCategories: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!guildData) return { status: 'error', details: { message: 'Bad request' } };
  const { ticketCategories, ticketCategoryChannelId } = guildData;
  if (ticketCategories.length <= 0) {
    return { status: 'error', details: { message: 'There are no ticket categories created' } };
  }
  if (!ticketCategoryChannelId) {
    return { status: 'error', details: { message: 'The ticket widget channel is not set' } };
  }

  const serverUrl = getEnv('NEXT_PUBLIC_SERVER_URL');
  const { space, ticket } = extraSigns;

  let embedDescription = `:globe_with_meridians:${space}Use the buttons below or our ${hyperlink(
    'website',
    serverUrl,
  )} to create a ticket.\n\n`;

  const createTicketEmbed = new EmbedBuilder().setColor(colors.purple);
  const buttonRow = new ActionRowBuilder<ButtonBuilder>();
  const buttons: ButtonBuilder[] = [];

  for (const category of ticketCategories) {
    const { steamRequired, mapSelection, coordinateInput, name, description } = category;
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`${client.user.id}|ticket:create-${category.id}`)
        .setLabel(category.name)
        .setStyle(ButtonStyle.Primary),
    );
    embedDescription += `${ticket}${space}Category **${name}**\n${description}`;
    if (steamRequired || mapSelection || coordinateInput) {
      embedDescription += '\n**Requirements for this category:**\n';
      if (steamRequired) embedDescription += '► In-game account connected with Steam.\n';
      if (mapSelection) embedDescription += '► In-game map related to your ticket.\n';
      if (coordinateInput) embedDescription += '► In-game coordinates associated with your ticket.\n';
    }
    embedDescription += '\n\n';
  }
  buttonRow.addComponents(...buttons);

  createTicketEmbed.setDescription(embedDescription);

  const response = await sendMessage({
    channelOrId: ticketCategoryChannelId,
    messageButtons: [buttonRow],
    messageEmbeds: [createTicketEmbed],
  });

  return response;
};

// TODO resend on change
