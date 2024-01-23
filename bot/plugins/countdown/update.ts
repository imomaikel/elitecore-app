import prisma from '../../lib/prisma';
import { countdownWidget } from '.';

export const _updateCountdown = async () => {
  const guildsToUpdate = await prisma.guild.findMany({
    where: {
      NOT: {
        AND: [{ countdownChannelId: null }, { countdownNextDate: null }],
      },
    },
    select: {
      guildId: true,
    },
  });

  for await (const guild of guildsToUpdate) {
    await countdownWidget(guild.guildId);
  }
};
