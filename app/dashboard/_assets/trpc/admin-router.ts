import { TicketCategoryCreateSchema, TicketCategoryEditSchema } from '../../admin/tickets/_assets/validators';
import { apiAvailableChannels, apiAvailableRoles, apiMutualGuilds } from '../../../../bot/api';
import apiUpdateBroadcastChannel from '../../../../bot/api/broadcastUpdate';
import { API_CHANNEL_ACTIONS_LIST } from '../../../../bot/constans/types';
import { apiUpdateWidget } from '../../../../bot/api/widgetUpdate';
import { createAdminLog } from '../../admin/_actions';
import { adminProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
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
  getAllChannels: adminProcedure
    .input(z.object({ guildId: z.string(), type: z.enum(['TEXT', 'CATEGORY']) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.discordId) return null;
      const { guildId, type } = input;

      const channels = await apiAvailableChannels(guildId, type);
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
    .input(z.object({ widgetName: API_CHANNEL_ACTIONS_LIST, channelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { channelId, widgetName } = input;
      const guildId = user.selectedGuildId;
      if (!user.discordId || !guildId) return null;

      let action;
      if (widgetName === 'ticketWidget') {
        action = await apiUpdateWidget({
          channelId,
          guildId,
          userDiscordId: user.discordId,
          widgetName: 'ticketWidget',
        });
      } else {
        action = await apiUpdateBroadcastChannel({
          channelId,
          guildId,
          userDiscordId: user.discordId,
          widgetName: widgetName,
        });
      }

      return action;
    }),
  getLogs: adminProcedure
    .input(
      z.object({
        logsPerPage: z
          .number()
          .min(2, { message: 'Minimum two logs per page' })
          .max(50, { message: 'Maximum fifty logs per page' }),
        authorFilter: z.string().optional(),
        contentFilter: z.string().optional(),
        order: z.string(),
        currentPage: z.number().min(1, { message: 'Page could not be lower than one' }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      const { logsPerPage, authorFilter, contentFilter, currentPage, order } = input;
      const guildId = user.selectedGuildId;
      if (!user.discordId || !guildId) return null;
      if (!(order === 'asc' || order === 'desc')) return null;

      const data = await prisma.guild.findFirst({
        where: { guildId: guildId },
        include: {
          logs: {
            orderBy: {
              createdAt: order,
            },
            where: {
              content: {
                contains: contentFilter,
              },
              Author: {
                name: {
                  contains: authorFilter,
                },
              },
            },
            include: {
              Author: true,
            },
            take: logsPerPage,
            skip: (currentPage - 1) * logsPerPage,
          },
        },
      });
      const totalLogsSize = await prisma.adminLog.count({
        where: {
          guildId: data?.id,
          content: { contains: contentFilter },
          Author: { name: { contains: authorFilter } },
        },
      });
      return {
        guild: data,
        totalLogsSize,
      };
    }),
  createTicketCategory: adminProcedure.input(TicketCategoryCreateSchema).mutation(async ({ ctx, input }) => {
    const { prisma, user } = ctx;
    const values = input;

    if (!user.selectedGuildId || !user.id) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }
    const supportList = values.supportRoles;

    try {
      await prisma.guild.update({
        where: { guildId: user.selectedGuildId },
        data: {
          ticketCategories: {
            create: {
              ...values,
              supportRoles: supportList
                ? {
                    createMany: {
                      data: [...supportList],
                    },
                  }
                : undefined,
            },
          },
        },
      });

      return { success: true };
    } catch {
      return { success: false };
    } finally {
      await createAdminLog({
        content: `Created ticket category "${input.name}"`,
        guildId: user.selectedGuildId,
        userId: user.id,
      });
    }
  }),
  getTicketCategories: adminProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;
    const { user } = ctx;

    if (!user.selectedGuildId || !user.id) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    const getCategories = await prisma.guild.findUnique({
      where: { guildId: user.selectedGuildId },
      select: {
        ticketCategories: true,
      },
    });

    const categories = getCategories?.ticketCategories;

    return categories;
  }),
  fetchTicketCategory: adminProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const { id } = input;
    const { prisma, user } = ctx;

    if (!user.selectedGuildId || !user.id) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    try {
      const category = await prisma.ticketCategory.findFirst({
        where: {
          id,
          Guild: {
            guildId: user.selectedGuildId,
          },
        },
        include: {
          supportRoles: {
            select: {
              roleId: true,
              roleName: true,
            },
          },
        },
      });
      if (!category) return { success: false };
      return { data: category };
    } catch {
      return { success: false };
    }
  }),
  deleteTicketCategory: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { id } = input;
    const { prisma, user } = ctx;

    if (!user.selectedGuildId || !user.id) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    let categoryName;

    try {
      const category = await prisma.ticketCategory.delete({
        where: {
          id,
          Guild: {
            guildId: user.selectedGuildId,
          },
        },
      });
      categoryName = category.name;
      return { success: category.name };
    } catch {
      return { success: false };
    } finally {
      await createAdminLog({
        content: `Deleted ticket "${categoryName}" category`,
        guildId: user.selectedGuildId,
        userId: user.id,
      });
    }
  }),
  editTicketCategory: adminProcedure
    .input(z.object({ values: TicketCategoryEditSchema, id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      const { values } = input;

      if (!user.selectedGuildId || !user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const currentSupporters = (
        await prisma.ticketCategory.findUnique({
          where: {
            id: input.id,
            Guild: {
              guildId: user.selectedGuildId,
            },
          },
          select: {
            supportRoles: true,
          },
        })
      )?.supportRoles.map(({ roleId }) => roleId);

      const toDelete: string[] = [];
      const toCreate: { roleId: string; roleName: string }[] = [];

      currentSupporters?.forEach((entry) => {
        if (!values.supportRoles?.find(({ roleId }) => roleId === entry)) {
          toDelete.push(entry);
        }
      });
      values.supportRoles?.forEach((entry) => {
        if (!currentSupporters?.includes(entry.roleId)) {
          toCreate.push({ roleId: entry.roleId, roleName: entry.roleName });
        }
      });

      let categoryName;

      try {
        const response = await prisma.ticketCategory.update({
          where: { id: input.id },
          data: {
            ...values,
            parentChannelId: values.parentChannelId === 'cancel' ? '' : values.parentChannelId,
            bannedRoleId: values.bannedRoleId === 'cancel' ? '' : values.bannedRoleId,
            supportRoles: values.supportRoles
              ? {
                  deleteMany: {
                    roleId: {
                      in: [...toDelete],
                    },
                  },
                  createMany: {
                    data: [...toCreate],
                  },
                }
              : undefined,
          },
        });
        categoryName = response.name;

        return { success: true };
      } catch {
        return { success: false };
      } finally {
        await createAdminLog({
          content: `Updated ticket "${categoryName}" category`,
          guildId: user.selectedGuildId,
          userId: user.id,
        });
      }
    }),
});
