'use server';
import prisma from '../../../_shared/lib/prisma';

type TCreateAdminLog = {
  userDiscordId: string;
  content: string;
  guildId: string;
};
export const createAdminLog = async ({ content, guildId, userDiscordId }: TCreateAdminLog) => {
  await prisma.user.update({
    where: { discordId: userDiscordId },
    data: {
      adminLogs: {
        create: {
          content,
          Guild: {
            connect: {
              guildId,
            },
          },
        },
      },
    },
  });
};
