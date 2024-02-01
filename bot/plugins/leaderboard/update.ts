import { leaderboardUpdateEmbed } from '../../constans/embeds';
import { sendMessage } from '../../helpers/sendMessage';
import { channelsSchema, createLeaderboard } from '.';
import { AttachmentBuilder, time } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const IMAGES_PATH = resolve(process.cwd(), 'bot', 'plugins', 'leaderboard', 'images', 'generated');

export const _updateLeaderboard = async (onlyOneGuildId?: string): Promise<boolean> => {
  if (!client) return false;

  const files = readdirSync(IMAGES_PATH).length;
  if (files <= 0) {
    const createdLeaderboard = await createLeaderboard();
    if (!createdLeaderboard) return false;
  }

  const guilds = await prisma.guild.findMany({
    where: {
      LeaderboardData: {
        categoryChannelId: {
          not: null,
        },
      },
    },
    include: {
      LeaderboardData: true,
    },
  });

  for await (const guild of guilds) {
    if (onlyOneGuildId && onlyOneGuildId !== guild.guildId) continue;
    const leaderboardData = guild.LeaderboardData;
    if (!leaderboardData) continue;

    for await (const schema of channelsSchema) {
      if (schema.type === 'CATEGORY') continue;

      const channelId = leaderboardData[schema.channelId];
      if (!channelId) continue;

      const channel = client.channels.cache.get(channelId);
      if (!channel) continue;

      const playersMessageId = leaderboardData[schema.playerMessageId];
      const updateMessageId = leaderboardData[schema.updateMessageId];
      const tribesMessageId = leaderboardData[schema.tribeMessageId];

      const playersImage = new AttachmentBuilder(resolve(IMAGES_PATH, schema.playersImage));
      const tribesImage = new AttachmentBuilder(resolve(IMAGES_PATH, schema.tribesImage));

      const updateEmbed = leaderboardUpdateEmbed().setDescription(`**Last update: ** ${time(new Date(), 'R')}`);

      // 1. Players image
      const playersMessage =
        (
          await sendMessage({
            channelOrId: channel,
            attachments: [playersImage],
            editMessageId: playersMessageId,
          })
        ).details?.data?.messageId ?? '';

      // 2. Update message
      const updateMessage =
        (
          await sendMessage({
            channelOrId: channel,
            editMessageId: updateMessageId,
            messageEmbeds: [updateEmbed],
          })
        ).details?.data?.messageId ?? '';

      // 3. Tribes image
      const tribesMessage =
        (
          await sendMessage({
            channelOrId: channel,
            attachments: [tribesImage],
            editMessageId: tribesMessageId,
          })
        ).details?.data?.messageId ?? '';

      if (playersMessage || updateMessage || tribesMessage) {
        await prisma.leaderboardData.update({
          where: {
            guildId: guild.guildId,
          },
          data: {
            ...(playersMessage?.length >= 5 && {
              [schema.playerMessageId]: playersMessage,
            }),
            ...(updateMessage.length >= 5 && {
              [schema.updateMessageId]: updateMessage,
            }),
            ...(tribesMessage.length >= 5 && {
              [schema.tribeMessageId]: tribesMessage,
            }),
          },
        });
      }
    }
  }

  return true;
};
