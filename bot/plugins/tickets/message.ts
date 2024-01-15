import { enteredCoordsEmbed, errorEmbed } from '../../constans/embeds';
import { colors, extraSigns } from '../../constans';
import { EmbedBuilder, Message } from 'discord.js';
import { closeTicket, ticketLog } from '.';
import prisma from '../../lib/prisma';

export const COORDS_REGEX = /-?[0-9]*\s-?[0-9]*\s-?[0-9]*\s-?[0-9]*\.[0-9]+\s-?[0-9]*\.[0-9]*/g;

export const _ticketMessage = async (message: Message) => {
  const channelId = message.channel.id;
  const ticketData = await prisma.ticket.findUnique({
    where: { channelId: channelId, closedAt: null },
    include: {
      TicketCategory: true,
    },
  });
  if (!ticketData) return;

  const { authorDiscordId, coordinates, coordinatesMessageId, mapName } = ticketData;

  if (ticketData.TicketCategory) {
    const { closeCommand, coordinateInput, mapSelection } = ticketData.TicketCategory;

    if (message.content === closeCommand) {
      const closedBy = message.author.username;
      await closeTicket({ channelId, closedBy });
      return;
    }

    const mapPass = mapSelection ? !!mapName ?? false : true;
    if (!mapPass && message.author.id === authorDiscordId) {
      // TODO
      await message.delete().catch(() => {});
      await message.channel
        .send({
          embeds: [
            errorEmbed(
              'Please select a map above before you can describe your case. :warning:',
              message.author.username,
            ),
          ],
        })
        .then((msg) =>
          setTimeout(() => {
            msg.delete().catch(() => {});
          }, 30_000),
        );
      return;
    }
    const coordsPass = coordinateInput ? !!coordinates ?? false : true;
    if (!coordsPass && message.author.id === authorDiscordId) {
      await message.delete().catch(() => {});
      const getCoords = message.content.match(COORDS_REGEX);
      if (!getCoords || getCoords.length <= 0) {
        await message.channel
          .send({
            embeds: [
              errorEmbed(
                'Please enter valid coordinates before talking about your case :warning:',
                message.author.username,
              ),
            ],
          })
          .then((msg) =>
            setTimeout(() => {
              msg.delete().catch(() => {});
            }, 30_000),
          );
        return;
      }
      const coords = getCoords[0];

      await prisma.ticket.update({
        where: { channelId },
        data: {
          coordinates: coords,
        },
      });

      await message.channel.messages
        .fetch(coordinatesMessageId!)
        .then(async (msg) => {
          await msg.delete().catch(() => {});
        })
        .catch(() => {});

      await message.channel.send({
        embeds: [enteredCoordsEmbed(coords)],
      });

      if (mapPass) {
        await message.channel
          .send({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.green)
                .setDescription(
                  `Thank you, you have fulfilled all of the requirements.\nPlease describe your case now. ${extraSigns.star}`,
                ),
            ],
          })
          .then((msg) =>
            setTimeout(() => {
              msg.delete().catch(() => {});
            }, 30_000),
          );
      }

      return;
    }
  }

  // Save the message
  await ticketLog({ message, ticketAuthorId: ticketData.authorDiscordId, ticketId: ticketData.id });
};
