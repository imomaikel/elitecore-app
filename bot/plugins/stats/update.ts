import { statsUpdateEmbed } from '../../constans/embeds';
import { sendMessage } from '../../helpers/sendMessage';
import { AttachmentBuilder, time } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';
import { channelsSchema } from '.';
import { resolve } from 'path';

const IMAGES_PATH = resolve(process.cwd(), 'bot', 'plugins', 'stats', 'images', 'generated');

export const _updateStats = async (): Promise<boolean> => {
  if (!client) return false;

  const guilds = await prisma.guild.findMany({
    where: {
      StatsData: {
        categoryChannelId: {
          not: null,
        },
      },
    },
    include: {
      StatsData: true,
    },
  });

  for await (const guild of guilds) {
    const statsData = guild.StatsData;
    if (!statsData) continue;

    for await (const schema of channelsSchema) {
      if (schema.type === 'CATEGORY') continue;

      const channelId = statsData[schema.channelId];
      if (!channelId) continue;

      const channel = client.channels.cache.get(channelId);
      if (!channel) continue;

      const playersMessageId = statsData[schema.playerMessageId];
      const updateMessageId = statsData[schema.updateMessageId];
      const tribesMessageId = statsData[schema.tribeMessageId];

      const playersImage = new AttachmentBuilder(resolve(IMAGES_PATH, schema.playersImage));
      const tribesImage = new AttachmentBuilder(resolve(IMAGES_PATH, schema.tribesImage));

      const updateEmbed = statsUpdateEmbed().setDescription(`**Last update: ** ${time(new Date(), 'R')}`);

      // 1. Players image
      const playersMessage = await sendMessage({
        channelOrId: channel,
        attachments: [playersImage],
        editMessageId: playersMessageId,
      });
      // 2. Update message
      const updateMessage = await sendMessage({
        channelOrId: channel,
        editMessageId: updateMessageId,
        messageEmbeds: [updateEmbed],
      });
      // 3. Tribes image
      const tribesMessage = await sendMessage({
        channelOrId: channel,
        attachments: [tribesImage],
        editMessageId: tribesMessageId,
      });

      const updatePlayersMessage =
        playersMessage.status === 'success' && playersMessage.details?.data.messageId !== playersMessageId;
      const updateUpdateMessage =
        updateMessage.status === 'success' && updateMessage.details?.data.messageId !== updateMessageId;
      const updateTribesMessage =
        tribesMessage.status === 'success' && tribesMessage.details?.data.messageId !== tribesMessageId;

      if (updatePlayersMessage || updateUpdateMessage || updateTribesMessage) {
        await prisma.statsData.update({
          where: {
            guildId: guild.guildId,
          },
          data: {
            ...(updatePlayersMessage && {
              [schema.playerMessageId]: playersMessage.details?.data.messageId,
            }),
            ...(updateUpdateMessage && {
              [schema.updateMessageId]: updateMessage.details?.data.messageId,
            }),
            ...(updateTribesMessage && {
              [schema.tribeMessageId]: tribesMessage.details?.data.messageId,
            }),
          },
        });
      }
    }
  }

  return true;
};
