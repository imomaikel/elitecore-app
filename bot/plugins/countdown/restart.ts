import prisma from '../../lib/prisma';
import { countdownWidget } from '.';

export const _restartCountdown = async (guildId: string) => {
  const guildData = await prisma.guild.findUnique({
    where: { guildId },
    select: {
      countdownRestartInMinutes: true,
      countdownNextDate: true,
    },
  });

  if (!guildData || !guildData.countdownNextDate) return;
  const { countdownRestartInMinutes, countdownNextDate } = guildData;

  const newNextDate = new Date(countdownNextDate.getTime() + countdownRestartInMinutes * 60_000);

  await prisma.guild.update({
    where: { guildId },
    data: {
      countdownLastDate: countdownNextDate,
      countdownNextDate: newNextDate,
    },
  });

  await countdownWidget(guildId);
};
