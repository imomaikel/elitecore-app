import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { LeaderboardData } from '@prisma/client';
import prisma from '../../lib/prisma';
import { client } from '../../client';
import { channelsSchema } from '.';

type TLeaderboardDataField = Exclude<keyof LeaderboardData, 'id' | 'guildId'>;

export const _setupLeaderboard = async (guildId: string): Promise<boolean> => {
  if (!client.user) return false;
  const guild = client.guilds.cache.get(guildId);
  if (!guild?.id) return false;

  const guildData = await prisma.guild.findUnique({
    where: { guildId },
    include: {
      LeaderboardData: true,
    },
  });

  if (!guildData) return false;
  if (!guildData.LeaderboardData?.id) {
    await prisma.guild.update({
      where: { guildId },
      data: {
        LeaderboardData: {
          create: {},
        },
      },
    });
    return _setupLeaderboard(guildId);
  }

  const dbLeaderboard = guildData.LeaderboardData;

  // Delete old channels
  for await (const schema of channelsSchema) {
    const channelId = dbLeaderboard[schema.channelId];
    if (!channelId) continue;
    await client.channels.cache
      .get(channelId)
      ?.delete()
      .catch(() => {});
  }

  // Create new
  const channelsToUpdate: Array<Partial<Record<TLeaderboardDataField, string>>> = [];
  let categoryId: string | undefined = undefined;
  let error = false;
  for await (const schema of channelsSchema) {
    if (error) break;
    await guild.channels
      .create({
        type: schema.type === 'CATEGORY' ? ChannelType.GuildCategory : ChannelType.GuildText,
        parent: categoryId ?? undefined,
        name: dbLeaderboard[schema.label]!,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.SendMessages],
          },
          {
            id: client.user.id,
            allow: [PermissionFlagsBits.SendMessages],
          },
        ],
      })
      .then(async (channel) => {
        dbLeaderboard[schema.channelId] = channel.id;
        channelsToUpdate.push({
          [schema.channelId]: channel.id,
        });
        if (schema.type === 'CATEGORY') {
          categoryId = channel.id;
        }
      })
      .catch((e) => {
        console.log(e);
        error = true;
      });
  }
  if (error) return false;

  // Update ids
  if (channelsToUpdate.length >= 1) {
    const toUpdate = channelsToUpdate.reduce((a, b) => Object.assign(a, b), {});
    await prisma.leaderboardData.update({
      where: { guildId },
      data: toUpdate,
    });
  }

  return true;
};
