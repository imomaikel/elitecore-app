import { TicketCategoryCreateSchema, TicketCategoryEditSchema } from '../../admin/tickets/_assets/validators';
import { apiAvailableChannels, apiAvailableRoles, apiMutualGuilds } from '../../../../bot/api';
import { API_BROADCAST_WIDGETS, API_WIDGETS } from '../../../../bot/constans/types';
import { createTicketCategoryWidget } from '../../../../bot/plugins/tickets';
import apiUpdateBroadcastChannel from '../../../../bot/api/broadcastUpdate';
import { apiUpdateWidget } from '../../../../bot/api/widgetUpdate';
import { apiUpdateRole } from '../../../../bot/api/apiUpdateRole';
import { adminProcedure, managerProcedure, router } from './trpc';
import { createAdminLog } from '../../admin/_actions';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const adminRouter = router({
  getDiscordGuilds: managerProcedure.query(async ({ ctx }) => {
    const { userDiscordId } = ctx;

    const guilds = await apiMutualGuilds(userDiscordId);

    return guilds;
  }),
  selectDiscordServer: managerProcedure.input(z.object({ guildId: z.string() })).mutation(async ({ ctx, input }) => {
    const { prisma, userDiscordId } = ctx;
    const { guildId } = input;

    const guilds = await apiMutualGuilds(userDiscordId);
    const guildName = guilds?.find((guild) => guild.guildId === guildId)?.guildName;
    if (!guilds?.some((guild) => guild.guildId === guildId) || !guildName) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    try {
      await prisma.user.update({
        where: { discordId: userDiscordId },
        data: { selectedDiscordId: guildId },
      });

      ctx.user.selectedGuildId = guildId;

      return { success: true, guildName: guildName };
    } catch {
      return { error: true };
    }
  }),
  getAllChannels: adminProcedure
    .input(z.object({ guildId: z.string(), type: z.enum(['TEXT', 'CATEGORY']) }))
    .query(async ({ input }) => {
      const { guildId, type } = input;

      const channels = await apiAvailableChannels(guildId, type);
      return channels;
    }),
  getAllRoles: adminProcedure.input(z.object({ guildId: z.string() })).query(async ({ input }) => {
    const { guildId } = input;

    const roles = await apiAvailableRoles(guildId);
    return roles;
  }),
  getGuildDbSettings: adminProcedure.query(async ({ ctx }) => {
    const { prisma, userDiscordId, selectedGuildId } = ctx;

    const guilds = await apiMutualGuilds(userDiscordId);
    if (!guilds?.some((guild) => guild.guildId === selectedGuildId)) return false;

    const data = await prisma.guild.findUnique({
      where: { guildId: selectedGuildId },
      select: {
        playersCmdChannelId: true,

        serverStatusChannelId: true,
        serverControlChannelId: true,
        serverControlRoleId: true,

        serverControlLogChannelId: true,
        serverStatusNotifyChannelId: true,

        ticketCategoryChannelId: true,
      },
    });
    return data;
  }),
  updateBroadcastWidget: adminProcedure
    .input(z.object({ widgetName: API_BROADCAST_WIDGETS, channelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { selectedGuildId, userDiscordId } = ctx;
      const { channelId, widgetName } = input;

      const action = await apiUpdateBroadcastChannel({
        channelId,
        guildId: selectedGuildId,
        userDiscordId: userDiscordId,
        widgetName,
      });

      return action;
    }),
  updateRoleWidget: adminProcedure
    .input(z.object({ roleId: z.string().min(4), widgetName: z.enum(['serverControlRole']) }))
    .mutation(async ({ ctx, input }) => {
      const { selectedGuildId, userDiscordId } = ctx;
      const { roleId, widgetName } = input;

      const success = await apiUpdateRole({
        guildId: selectedGuildId,
        roleId,
        userDiscordId,
        widget: widgetName,
      });

      if (success) {
        return { success: true };
      }
      return { error: true };
    }),
  updateWidget: adminProcedure
    .input(z.object({ widgetName: API_WIDGETS, channelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { selectedGuildId, userDiscordId } = ctx;
      const { channelId, widgetName } = input;

      const action = await apiUpdateWidget({
        channelId,
        guildId: selectedGuildId,
        userDiscordId: userDiscordId,
        widgetName,
      });

      if (widgetName === 'ticketWidget') {
        await createAdminLog({
          content: 'Updated ticket widget',
          guildId: selectedGuildId,
          userDiscordId,
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
        order: z.enum(['asc', 'desc']),
        currentPage: z.number().min(1, { message: 'Page could not be lower than one' }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { logsPerPage, authorFilter, contentFilter, currentPage, order } = input;
      const { prisma, selectedGuildId } = ctx;

      const data = await prisma.guild.findUnique({
        where: { guildId: selectedGuildId },
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
          _count: true,
        },
      });

      if (!data) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      return {
        guild: data,
        totalLogsSize: data._count.logs,
      };
    }),
  createTicketCategory: adminProcedure.input(TicketCategoryCreateSchema).mutation(async ({ ctx, input }) => {
    const { prisma, selectedGuildId, userDiscordId } = ctx;
    const values = input;

    const supportList = values.supportRoles;

    try {
      await prisma.guild.update({
        where: { guildId: selectedGuildId },
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
      return { error: true };
    } finally {
      await createTicketCategoryWidget(selectedGuildId);
      await createAdminLog({
        content: `Created ticket category "${input.name}"`,
        guildId: selectedGuildId,
        userDiscordId,
      });
    }
  }),
  getTicketCategories: adminProcedure.query(async ({ ctx }) => {
    const { prisma, selectedGuildId } = ctx;

    const getCategories = await prisma.guild.findUnique({
      where: { guildId: selectedGuildId },
      select: {
        ticketCategories: {
          orderBy: {
            position: 'asc',
          },
        },
        ticketCategoryChannelId: true,
      },
    });

    const categories = getCategories?.ticketCategories;

    return {
      categories,
      channelId: getCategories?.ticketCategoryChannelId,
    };
  }),
  fetchTicketCategory: adminProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const { prisma, selectedGuildId } = ctx;
    const { id } = input;

    try {
      const category = await prisma.ticketCategory.findFirst({
        where: {
          id,
          Guild: {
            guildId: selectedGuildId,
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
      return { success: true, data: category };
    } catch {
      return { error: true };
    }
  }),
  deleteTicketCategory: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { prisma, selectedGuildId, userDiscordId } = ctx;
    const { id } = input;

    let categoryName;

    try {
      const category = await prisma.ticketCategory.delete({
        where: {
          id,
          Guild: {
            guildId: selectedGuildId,
          },
        },
      });
      categoryName = category.name;
      return { success: true, data: categoryName };
    } catch {
      return { error: true };
    } finally {
      await createTicketCategoryWidget(selectedGuildId);
      await createAdminLog({
        content: `Deleted ticket "${categoryName}" category`,
        guildId: selectedGuildId,
        userDiscordId,
      });
    }
  }),
  editTicketCategory: adminProcedure
    .input(z.object({ values: TicketCategoryEditSchema, id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, userDiscordId, selectedGuildId } = ctx;
      const { values } = input;

      const currentSupporters = (
        await prisma.ticketCategory.findUnique({
          where: {
            id: input.id,
            Guild: {
              guildId: selectedGuildId,
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
        await createTicketCategoryWidget(selectedGuildId);
        await createAdminLog({
          content: `Updated ticket "${categoryName}" category`,
          guildId: selectedGuildId,
          userDiscordId,
        });
      }
    }),
  updatePosition: adminProcedure
    .input(z.object({ categoryId: z.string().min(1), method: z.enum(['INCREMENT', 'DECREMENT']) }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, selectedGuildId, userDiscordId } = ctx;
      const { categoryId, method } = input;

      try {
        const category = await prisma.ticketCategory.update({
          where: {
            Guild: {
              guildId: selectedGuildId,
            },
            id: categoryId,
            position: {
              ...(method === 'DECREMENT'
                ? {
                    gt: 1,
                  }
                : {
                    lt: 15,
                  }),
            },
          },
          data: {
            position: {
              ...(method === 'DECREMENT'
                ? {
                    decrement: 1,
                  }
                : {
                    increment: 1,
                  }),
            },
          },
        });
        await createAdminLog({
          content: `Updated ticket "${category.name}" category position`,
          guildId: selectedGuildId,
          userDiscordId,
        });
        await createTicketCategoryWidget(selectedGuildId);
        return { success: true };
      } catch {
        return { error: true };
      }
    }),
  getAllTickets: adminProcedure.query(async ({ ctx }) => {
    const { prisma, selectedGuildId } = ctx;

    const tickets = await prisma.ticket.findMany({
      where: {
        guildId: selectedGuildId,
      },
      select: {
        createdAt: true,
        closedAt: true,
        id: true,
        categoryName: true,
        authorUsername: true,
      },
    });

    return tickets;
  }),
});
