import { changeMapEmbed, selectedMapEmbed } from '../../constans/embeds';
import { EmbedBuilder, StringSelectMenuInteraction } from 'discord.js';
import { colors, extraSigns } from '../../constans';
import prisma from '../../lib/prisma';
import { client } from '../../client';
import { z } from 'zod';

export const _ticketSelectMap = async (interaction: StringSelectMenuInteraction) => {
  await interaction.deferReply();
  if (!interaction.channel?.id || !interaction.channel.isTextBased() || interaction.applicationId !== client.user?.id) {
    return;
  }

  const channelId = interaction.channel.id;
  const verifyId = z.coerce.number().min(1).safeParse(interaction.values[0]);
  if (!verifyId.success) return;

  const serverId = parseInt(interaction.values[0]);
  const [server, ticket] = await Promise.all([
    prisma.server.findFirst({
      where: { id: serverId, serverName: { equals: 'EliteCore' } },
    }),
    prisma.ticket.findUnique({
      where: { channelId, closedAt: null },
      include: {
        TicketCategory: true,
      },
    }),
  ]);

  if (!ticket || ticket.authorDiscordId !== interaction.user.id || !server?.id) return;

  const embedId = ticket.mapNameMessageId;
  const selectedMessage = ticket.mapNameSelectedMessageId;

  const mapEmbed = selectedMapEmbed({
    customName: server.customName,
    gameType: server.gameType,
    mapName: server.mapName,
  });

  let editedId: string | null = null;

  if (selectedMessage) {
    await interaction.channel.messages
      .fetch(selectedMessage)
      .then(async (msg) => {
        await msg
          .edit({ embeds: [mapEmbed] })
          .then((fetchedMessage) => (editedId = fetchedMessage.id))
          .catch(() => {});
      })
      .catch(() => {});
  }
  if (!editedId) {
    const message = await interaction.channel.send({ embeds: [mapEmbed] });
    editedId = message.id;
  }

  try {
    const selectMessage = await interaction.channel.messages.fetch(embedId!);
    if (selectMessage.id) {
      await selectMessage.edit({
        embeds: [changeMapEmbed()],
      });
    }
  } catch {}

  await prisma.ticket.update({
    where: { channelId },
    data: {
      mapName: server.mapName,
      mapNameSelectedMessageId: editedId,
    },
  });

  const allRequirements = !!ticket.TicketCategory?.coordinateInput && !!ticket.coordinates;
  if (allRequirements) {
    await interaction.channel
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

  await interaction.deleteReply();
};
