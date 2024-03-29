import {
  StaffMemberSchema,
  TicketCategoryCreateSchema,
  TicketCategoryEditSchema,
  UpdateDelaySchema,
} from '../../admin/tickets/_assets/validators';
import { apiAvailableChannels, apiAvailableRoles, apiMutualGuilds } from '../../../../bot/api';
import { setupLeaderboard, updateLeaderboard } from '../../../../bot/plugins/leaderboard';
import { API_BROADCAST_WIDGETS, API_WIDGETS } from '../../../../bot/constans/types';
import { createTicketCategoryWidget } from '../../../../bot/plugins/tickets';
import apiUpdateBroadcastChannel from '../../../../bot/api/broadcastUpdate';
import { countdownWidget } from '../../../../bot/plugins/countdown';
import { apiWipeSchemas } from '../../../../bot/api/apiWipeSchemas';
import { apiUpdateWidget } from '../../../../bot/api/widgetUpdate';
import { apiUpdateRole } from '../../../../bot/api/apiUpdateRole';
import { adminProcedure, managerProcedure, router } from './trpc';
import { apiAvatar } from '../../../../bot/api/apiAvatar';
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
      } else if (widgetName === 'countdownWidget') {
        await createAdminLog({
          content: 'Updated countdown widget',
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
  getAuthorizedUsers: adminProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER'],
        },
      },
      select: {
        avatar: true,
        name: true,
        role: true,
        id: true,
      },
    });

    return users;
  }),
  getConfig: adminProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const config = await prisma.config.findFirst({
      select: {
        serverStatusUpdateDelay: true,
        serverControlUpdateDelay: true,
        monthlyPaymentGoal: true,
        countdownUpdateDelay: true,
        autoCleanTicketFilesDays: true,
        lastWipe: true,
      },
    });

    return config;
  }),
  setMonthlyGoal: adminProcedure
    .input(
      z.object({
        monthlyPaymentGoal: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, userDiscordId, selectedGuildId } = ctx;
      const { monthlyPaymentGoal } = input;

      try {
        await prisma.config.updateMany({
          data: {
            monthlyPaymentGoal,
          },
        });
        return { success: true };
      } catch {
        return { error: true };
      } finally {
        await createAdminLog({
          content: `Set monthly goal to "${monthlyPaymentGoal}"`,
          guildId: selectedGuildId,
          userDiscordId,
        });
      }
    }),
  updateDelays: adminProcedure.input(UpdateDelaySchema).mutation(async ({ ctx, input }) => {
    const { prisma, selectedGuildId, userDiscordId } = ctx;

    try {
      await prisma.config.updateMany({
        data: { ...input },
      });

      return { success: true };
    } catch {
      return { error: true };
    } finally {
      await createAdminLog({
        content: 'Updated widgets delay',
        guildId: selectedGuildId,
        userDiscordId,
      });
    }
  }),
  wipeSchema: adminProcedure.mutation(async ({ ctx }) => {
    const { selectedGuildId, userDiscordId } = ctx;

    const actionStatus = await apiWipeSchemas();

    if (actionStatus) {
      await createAdminLog({
        content: 'Deleted database schemas',
        guildId: selectedGuildId,
        userDiscordId,
      });
      return { success: true };
    } else {
      return { error: true };
    }
  }),
  getCountdownData: adminProcedure.query(async ({ ctx }) => {
    const { prisma, selectedGuildId } = ctx;

    const data = await prisma.guild.findUnique({
      where: { guildId: selectedGuildId },
      select: {
        countdownChannelId: true,
        countdownDescription: true,
        countdownHeader: true,
        countdownLastDate: true,
        countdownNextDate: true,
        countdownRestartInMinutes: true,
      },
    });

    return data;
  }),
  setCountdownRestart: adminProcedure
    .input(z.object({ minutes: z.number().min(2).max(44640) }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, selectedGuildId, userDiscordId } = ctx;
      const { minutes } = input;

      try {
        await prisma.guild.update({
          where: { guildId: selectedGuildId },
          data: {
            countdownRestartInMinutes: minutes,
          },
        });
        return { success: true };
      } catch {
        return { error: true };
      } finally {
        await createAdminLog({
          content: 'Updated countdown auto-restart',
          guildId: selectedGuildId,
          userDiscordId,
        });
      }
    }),
  setCountdownDate: adminProcedure
    .input(z.object({ nextDate: z.date(), lastDate: z.date() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, selectedGuildId, userDiscordId } = ctx;
      const { lastDate, nextDate } = input;

      try {
        await prisma.guild.update({
          where: { guildId: selectedGuildId },
          data: {
            countdownLastDate: lastDate,
            countdownNextDate: nextDate,
          },
        });
        return { success: true };
      } catch {
        return { error: true };
      } finally {
        await createAdminLog({
          content: 'Updated countdown date',
          guildId: selectedGuildId,
          userDiscordId,
        });
        await countdownWidget(selectedGuildId);
      }
    }),
  setCountdownFormat: adminProcedure
    .input(
      z.object({
        header: z.string().max(32),
        description: z.string().max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, selectedGuildId, userDiscordId } = ctx;
      const { description, header } = input;

      try {
        await prisma.guild.update({
          where: { guildId: selectedGuildId },
          data: {
            countdownDescription: description,
            countdownHeader: header,
          },
        });
        return { success: true };
      } catch {
        return { error: true };
      } finally {
        await createAdminLog({
          content: 'Updated countdown format',
          guildId: selectedGuildId,
          userDiscordId,
        });
        await countdownWidget(selectedGuildId);
      }
    }),
  setupLeaderboard: adminProcedure.mutation(async ({ ctx }) => {
    const { selectedGuildId, userDiscordId } = ctx;

    const createdLeaderboard = await setupLeaderboard(selectedGuildId);
    if (createdLeaderboard) {
      const updatedLeaderboard = await updateLeaderboard(selectedGuildId);
      return { created: true, sent: updatedLeaderboard };
    }

    await createAdminLog({
      content: 'Created leaderboard widget',
      guildId: selectedGuildId,
      userDiscordId,
    });

    return { created: createdLeaderboard, sent: false };
  }),
  addStaffMember: adminProcedure.input(StaffMemberSchema).mutation(async ({ ctx, input }) => {
    const { avatarUrl, joinedAt, role, username } = input;
    const { prisma, userDiscordId, selectedGuildId } = ctx;

    const member = await prisma.staff.create({
      data: {
        avatarUrl,
        joinedAt,
        role,
        username,
      },
    });

    if (!member.id) return { error: true };

    await createAdminLog({
      content: `Added staff member "${member.username}"`,
      guildId: selectedGuildId,
      userDiscordId,
    });

    return { success: true, memberName: member.username };
  }),
  removeStaffMember: adminProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const { id } = input;
    const { prisma, userDiscordId, selectedGuildId } = ctx;

    const member = await prisma.staff.delete({
      where: { id },
    });

    if (!member.id) return { error: true };

    await createAdminLog({
      content: `Removed staff member "${member.username}"`,
      guildId: selectedGuildId,
      userDiscordId,
    });

    return { success: true, memberName: member.username };
  }),
  getAvatar: adminProcedure
    .input(
      z.object({
        discordId: z.string().min(4),
      }),
    )
    .mutation(async ({ input }) => {
      const { discordId } = input;

      const avatarUrl = await apiAvatar(discordId);

      return avatarUrl;
    }),
});
