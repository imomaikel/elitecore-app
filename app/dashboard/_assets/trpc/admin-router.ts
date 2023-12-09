import { z } from 'zod';
import { apiDiscordSelection } from '../../../../bot/api';
import { adminProcedure, router } from './trpc';

export const adminRouter = router({
  apiDiscordSelection: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.user.discordId) return null;
    const guilds = await apiDiscordSelection(ctx.user.discordId);
    return guilds;
  }),
  selectDiscordServer: adminProcedure.input(z.object({ guildId: z.string() })).mutation(async ({ ctx, input }) => {
    if (!ctx.user.discordId) return false;
    const { prisma, user } = ctx;
    const { guildId } = input;
    const guilds = await apiDiscordSelection(ctx.user.discordId);
    if (!guilds?.some((guild) => guild.guildId === guildId)) return false;

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { selectedDiscordId: guildId },
      });
      ctx.user.selectedGuildId = guildId;
      return guildId;
    } catch {
      return false;
    }
  }),
});
