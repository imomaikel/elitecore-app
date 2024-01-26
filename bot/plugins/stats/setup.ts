import { StatsData } from '@prisma/client';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import prisma from '../../lib/prisma';
import { client } from '../../client';
import { channelsSchema } from '.';

type TStatsDataField = Exclude<keyof StatsData, 'id' | 'guildId'>;

export const _setupStats = async (guildId: string): Promise<boolean> => {
  if (!client.user) return false;
  const guild = client.guilds.cache.get(guildId);
  if (!guild?.id) return false;

  const guildData = await prisma.guild.findUnique({
    where: { guildId },
    include: {
      StatsData: true,
    },
  });

  if (!guildData) return false;
  if (!guildData.StatsData?.id) {
    await prisma.guild.update({
      where: { guildId },
      data: {
        StatsData: {
          create: {},
        },
      },
    });
    return _setupStats(guildId);
  }

  const dbStats = guildData.StatsData;

  // Delete old channels
  for await (const schema of channelsSchema) {
    const channelId = dbStats[schema.channelId];
    if (!channelId) continue;
    await client.channels.cache
      .get(channelId)
      ?.delete()
      .catch(() => {});
  }

  // Create new
  const channelsToUpdate: Array<Partial<Record<TStatsDataField, string>>> = [];
  let categoryId: string | undefined = undefined;
  let error = false;
  for await (const schema of channelsSchema) {
    if (error) break;
    await guild.channels
      .create({
        type: schema.type === 'CATEGORY' ? ChannelType.GuildCategory : ChannelType.GuildText,
        parent: categoryId ?? undefined,
        name: dbStats[schema.label]!,
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
        dbStats[schema.channelId] = channel.id;
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
    await prisma.statsData.update({
      where: { guildId },
      data: toUpdate,
    });
  }

  return false;
};
