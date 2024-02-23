import { calculateTribePoints, generateScoreMessage } from '.';
import { sendMessage } from '../../helpers/sendMessage';
import { client } from '../../client';
import prisma from '../../lib/prisma';

export const _updateDamageWidget = async () => {
  await calculateTribePoints();
  const guilds = await prisma.guild.findMany({
    where: {
      LeaderboardData: {
        damageChannelId: {
          not: null,
        },
      },
    },
    include: {
      LeaderboardData: true,
    },
  });

  const scoreMessage = await generateScoreMessage();
  if (!scoreMessage) return;

  for await (const _guild of guilds) {
    const guild = client.guilds.cache.get(_guild.guildId);
    const channelId = _guild.LeaderboardData?.damageChannelId;
    const messageId = _guild.LeaderboardData?.damageMsgId;
    if (!channelId) continue;

    const channel = client.channels.cache.get(channelId);
    if (!channel || !guild) continue;

    const message =
      (
        await sendMessage({
          channelOrId: channel,
          messageEmbeds: [scoreMessage.embed],
          messageContent: scoreMessage.content,
          editMessageId: messageId,
        })
      ).details?.data?.messageId ?? '';

    if (message.length >= 5) {
      await prisma.leaderboardData.update({
        where: {
          guildId: guild.id,
        },
        data: {
          damageMsgId: message,
        },
      });
    }
  }
};
