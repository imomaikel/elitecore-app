'use server';
import prisma from '../../../_shared/lib/prisma';

type TCreateAdminLog = {
  userId: string;
  content: string;
  guildId: string;
};
export const createAdminLog = async ({ content, guildId, userId }: TCreateAdminLog) => {
  await prisma.user.update({
    where: { id: userId },
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
