import { apiAvailableChannels, apiAvailableRoles, apiMutualGuilds, apiUpdateChannel } from '../../../../bot/api';
import { API_CHANNEL_ACTIONS } from '../../../../bot/api/updateChannel';
import { adminProcedure, router } from './trpc';
import { z } from 'zod';

export const adminRouter = router({
  getDiscordGuilds: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.user.discordId) return null;
    const guilds = await apiMutualGuilds(ctx.user.discordId);
    return guilds;
  }),
  selectDiscordServer: adminProcedure.input(z.object({ guildId: z.string() })).mutation(async ({ ctx, input }) => {
    if (!ctx.user.discordId) return false;
    const { prisma, user } = ctx;
    const { guildId } = input;
    const guilds = await apiMutualGuilds(ctx.user.discordId);
    if (!guilds?.some((guild) => guild.guildId === guildId)) return false;

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { selectedDiscordId: guildId },
      });
      ctx.user.selectedGuildId = guildId;
      return guilds.find((guild) => guild.guildId === guildId)?.guildName;
    } catch {
      return false;
    }
  }),
  getAllChannels: adminProcedure.input(z.object({ guildId: z.string() })).query(async ({ ctx, input }) => {
    if (!ctx.user.discordId) return null;

    const channels = await apiAvailableChannels(input.guildId);
    return channels;
  }),
  getAllRoles: adminProcedure.input(z.object({ guildId: z.string() })).query(async ({ ctx, input }) => {
    if (!ctx.user.discordId) return null;

    const roles = await apiAvailableRoles(input.guildId);
    return roles;
  }),
  getGuildDbChannels: adminProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;
    const guildId = ctx.user.selectedGuildId;
    if (!ctx.user.discordId || !guildId) return null;

    const guilds = await apiMutualGuilds(ctx.user.discordId);
    if (!guilds?.some((guild) => guild.guildId === guildId)) return false;

    const data = await prisma.guild.findFirst({
      where: { guildId },
      select: {
        playersCmdChannelId: true,
        serverStatusChannelId: true,
        serverControlChannelId: true,
        serverControlLogChannelId: true,
        serverStatusNotifyChannelId: true,
      },
    });
    return data;
  }),
  updateWidget: adminProcedure
    .input(z.object({ widgetName: z.string(), channelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { channelId, widgetName } = input;
      const guildId = user.selectedGuildId;
      if (!user.discordId || !guildId || !API_CHANNEL_ACTIONS.includes(widgetName)) return null;

      const action = await apiUpdateChannel({
        channelId,
        guildId,
        userDiscordId: user.discordId,
        widgetName: widgetName as API_CHANNEL_ACTIONS,
      });

      return action;
    }),
});
