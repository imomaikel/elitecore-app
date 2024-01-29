import {
  addProduct,
  applyGiftCard,
  removeGiftCard,
  removeProduct,
  shopGetCategories,
  updateQuantity,
} from '../../../_shared/lib/tebex';
import {
  apiCloseTicket,
  apiTicketWebhookMessage,
  createTicket,
  createTicketTranscript,
} from '../../../../bot/plugins/tickets';
import { COORDS_REGEX } from '../../../../bot/plugins/tickets/message';
import { authorizedProcedure, publicProcedure, router } from './trpc';
import { getTribe } from '../../../../bot/plugins/tribe';
import { Category, GetBasket } from 'tebex_headless';
import { adminRouter } from './admin-router';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

let categories: Category[] = [];

setInterval(async () => {
  const response = await shopGetCategories();
  categories = response;
}, 3 * 60 * 1000);

const getCurrentMonth = () => {
  const dateFrom = new Date();
  const dateTo = new Date();
  dateFrom.setDate(1);
  dateTo.setMonth(dateTo.getMonth() + 1);
  dateTo.setDate(0);
  return {
    from: dateFrom,
    to: dateTo,
  };
};

const productFilter = (categoryName: string, game: 'ase' | 'asa' | 'all') => {
  if (game === 'all') return true;
  categoryName = categoryName.toLowerCase();
  if (categoryName.startsWith('ase+asa') || categoryName.startsWith('asa+ase')) return true;
  if (categoryName.startsWith('ase') && game === 'ase') return true;
  if (categoryName.startsWith('asa') && game === 'asa') return true;
  return false;
};

export const appRouter = router({
  admin: adminRouter,
  getTopPicks: publicProcedure
    .input(z.object({ activeProducts: z.array(z.number()), game: z.enum(['ase', 'asa', 'all']) }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { activeProducts, game } = input;

      const productsCount: { productId: number; count: number }[] = [];

      const boughtProducts = (
        await prisma.product.findMany({
          where: {
            productId: {
              in: activeProducts,
            },
          },
        })
      ).filter(({ categoryName }) => productFilter(categoryName, game));

      for (const product of boughtProducts) {
        const isAlready = productsCount.find((entry) => entry.productId === product.productId);
        if (isAlready) {
          isAlready.count++;
        } else {
          productsCount.push({ count: 1, productId: product.productId });
        }
      }

      const descOrder = productsCount.sort((a, b) => b.count - a.count).map((entry) => entry.productId);

      if (categories.length <= 0) {
        const getCategories = await shopGetCategories();
        categories = getCategories;
      }

      const products = categories
        .filter(({ name }) => productFilter(name, game))
        .map(({ packages }) => packages)
        .flat();

      const TOP_PICKS_TO_GENERATE = 4;
      let randomPicksToGenerate = 4;
      const topPicks: number[] = [];

      descOrder.forEach((entry) => {
        if (topPicks.length < TOP_PICKS_TO_GENERATE) {
          topPicks.push(entry);
        }
      });

      const matchedProducts = descOrder?.length;
      const needProducts = matchedProducts < TOP_PICKS_TO_GENERATE;

      if (needProducts) {
        const extraProducts = products.filter((product) => !topPicks.includes(product.id));
        while (extraProducts.length >= 1) {
          const randomProduct = extraProducts[Math.floor(Math.random() * extraProducts.length)];
          if (!topPicks.includes(randomProduct.id)) topPicks.push(randomProduct.id);
          if (topPicks.length >= TOP_PICKS_TO_GENERATE) break;
          if (products.length < TOP_PICKS_TO_GENERATE) break;
        }
      }

      while (randomPicksToGenerate) {
        const extraProducts = products.filter((product) => !topPicks.includes(product.id));
        if (!extraProducts || extraProducts.length <= 0) break;
        const randomProduct = extraProducts[Math.floor(Math.random() * extraProducts.length)];
        if (!topPicks.includes(randomProduct.id)) {
          topPicks.push(randomProduct.id);
          randomPicksToGenerate--;
        }
      }

      return topPicks;
    }),
  getMonthlyCosts: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const monthlyGoal = (
      await prisma.config.findFirst({
        select: { monthlyPaymentGoal: true },
      })
    )?.monthlyPaymentGoal;

    if (!monthlyGoal) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    const thisMonth = getCurrentMonth();

    const paymentsThisMonth = (
      await prisma.payment.findMany({
        where: {
          priceAmount: {
            not: 0,
          },
          createdAt: {
            gte: thisMonth.from,
            lte: thisMonth.to,
          },
        },
      })
    ).reduce((acc, curr) => (acc += curr.priceAmount), 0);

    const progress = Math.round((paymentsThisMonth / monthlyGoal) * 100);

    return progress;
  }),
  getTopDonators: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const topDonator = (
      await prisma.user.findMany({
        orderBy: { totalPaid: 'desc' },
        where: {
          totalPaid: {
            not: 0,
          },
        },
        take: 1,
      })
    ).map((user) => ({
      username: user.name,
      avatarUrl: user.avatar,
    }));

    const thisMonth = getCurrentMonth();

    const topMonthDonator = (
      await prisma.payment.findMany({
        orderBy: { priceAmount: 'desc' },
        take: 1,
        where: {
          priceAmount: {
            not: 0,
          },
          createdAt: {
            gte: thisMonth.from,
            lte: thisMonth.to,
          },
        },
        include: {
          user: true,
        },
      })
    ).map((entry) => ({
      username: entry.user.name,
      avatarUrl: entry.user.avatar,
    }));

    return {
      overall: topDonator,
      thisMonth: topMonthDonator,
    };
  }),
  getRecentPayments: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;
    const users = (
      await prisma.payment.findMany({
        orderBy: { createdAt: 'asc' },
        where: {
          priceAmount: {
            not: 0,
          },
        },
        take: 4,
        include: {
          user: {
            select: {
              avatar: true,
              name: true,
            },
          },
        },
      })
    ).map((entry) => ({
      username: entry.user.name,
      avatarUrl: entry.user.avatar,
    }));
    return users;
  }),
  getCurrencies: publicProcedure.mutation(async ({ ctx }) => {
    const { prisma } = ctx;

    const currencies = await prisma.currency.findMany({ select: { code: true, rate: true } });

    return currencies;
  }),
  removeFromBasket: authorizedProcedure.input(z.object({ productId: z.number() })).mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { productId } = input;

    const response = await removeProduct({
      productId,
      user,
    });

    return response;
  }),
  updateQuantity: authorizedProcedure
    .input(z.object({ productId: z.number(), quantity: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { productId, quantity } = input;

      const response = await updateQuantity({
        productId,
        user,
        quantity,
      });

      return response;
    }),
  applyGiftCard: authorizedProcedure.input(z.object({ giftCard: z.string() })).mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { giftCard } = input;

    const response = await applyGiftCard({
      user,
      giftCard,
    });

    return response;
  }),
  removeGiftCard: authorizedProcedure.input(z.object({ giftCard: z.string() })).mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { giftCard } = input;

    const response = await removeGiftCard({
      user,
      giftCard,
    });

    return response;
  }),
  addToBasket: authorizedProcedure
    .input(z.object({ productId: z.number(), pathname: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { req, user, prisma } = ctx;
      const { productId, pathname } = input;

      if (!user) throw new TRPCError({ code: 'BAD_REQUEST' });

      const response = await addProduct({
        ipAddress: req.ip,
        productId: productId,
        user,
        pathname,
      });

      if (response.status === 'success' && !user.steamId && user.basketIdent) {
        const getBasket = await GetBasket(user.basketIdent);
        await prisma.user.update({
          where: { discordId: user.discordId },
          data: { steamId: getBasket.username_id },
        });
      }

      return response;
    }),
  addAsGift: authorizedProcedure
    .input(z.object({ productId: z.number(), giftForUserId: z.string(), pathname: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { req, user, prisma } = ctx;
      const { productId, giftForUserId, pathname } = input;

      if (!user) throw new TRPCError({ code: 'BAD_REQUEST' });
      const response = await addProduct({
        ipAddress: req.ip,
        productId: productId,
        user,
        giftForUserId,
        pathname,
      });

      if (response.status === 'success' && !user.steamId && user.basketIdent) {
        const getBasket = await GetBasket(user.basketIdent);
        await prisma.user.update({
          where: { discordId: user.discordId },
          data: { steamId: getBasket.username_id },
        });
      }

      return response;
    }),
  getCategories: publicProcedure.query(async () => {
    if (categories.length <= 0) {
      const fetchCategories = await shopGetCategories();
      categories = fetchCategories;
      return fetchCategories;
    }

    return categories;
  }),
  getTicketCategories: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const ticketCategories = await prisma.ticketCategory.findMany({
      select: {
        id: true,
        coordinateInput: true,
        steamRequired: true,
        description: true,
        image: true,
        limit: true,
        mapSelection: true,
        name: true,
        createConfirmation: true,
      },
      orderBy: {
        position: 'asc',
      },
    });

    return ticketCategories;
  }),
  createTicket: authorizedProcedure
    .input(
      z.object({
        categoryId: z.string().min(1),
        coordinateInput: z.optional(z.string().min(1)),
        mapSelection: z.optional(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user, prisma } = ctx;
      const { categoryId, coordinateInput, mapSelection } = input;
      const { selectedGuildId } = user;

      const category = await prisma.ticketCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) throw new TRPCError({ code: 'BAD_REQUEST' });

      if (category.coordinateInput) {
        if (!coordinateInput) throw new TRPCError({ code: 'BAD_REQUEST' });
        if (!coordinateInput.match(COORDS_REGEX)) throw new TRPCError({ code: 'BAD_REQUEST' });
        if (category.mapSelection) {
          if (!mapSelection) throw new TRPCError({ code: 'BAD_REQUEST' });
          const findServer = await prisma.server.findUnique({
            where: { id: mapSelection },
          });
          if (!findServer) throw new TRPCError({ code: 'BAD_REQUEST' });
        }
      }

      if (!user.discordId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const newTicket = await createTicket({
        categoryId,
        guildId: selectedGuildId
          ? selectedGuildId
          : process.env.NODE_ENV === 'production'
          ? (process.env.PRODUCTION_DISCORD_GUILD_ID as string)
          : (process.env.DEVELOPMENT_DISCORD_GUILD_ID as string),
        userId: user.discordId,
        forceCoords: coordinateInput,
        forceServerId: mapSelection,
      });

      if (newTicket.status === 'success') {
        return {
          success: true,
          inviteLink: newTicket.details?.data.inviteLink,
          ticketId: newTicket.details?.data.ticketId,
        };
      } else {
        return {
          error: true,
          message: newTicket.details?.message,
        };
      }
    }),
  getServers: authorizedProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;
    const servers = await prisma.server.findMany({
      select: {
        id: true,
        mapName: true,
        customName: true,
        gameType: true,
      },
    });
    return servers;
  }),
  getTicketWithLogs: authorizedProcedure.input(z.object({ ticketId: z.string() })).query(async ({ ctx, input }) => {
    const { prisma, user } = ctx;
    const { ticketId } = input;

    const isAdmin = user.role === 'ADMIN';

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
        ...(!isAdmin && {
          authorDiscordId: user.discordId,
        }),
      },
      include: {
        TicketCategory: {
          select: {
            coordinateInput: true,
            steamRequired: true,
            mapSelection: true,
            name: true,
          },
        },
        messages: {
          include: {
            attachments: true,
          },
        },
      },
    });

    if (ticket) {
      await prisma.user.update({
        where: { discordId: user.discordId },
        data: {
          lastViewedTicketId: ticket.id,
        },
      });
    }

    return ticket;
  }),
  getUserTickets: authorizedProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    if (!user.discordId) throw new TRPCError({ code: 'BAD_REQUEST' });

    const tickets = await prisma.ticket.findMany({
      where: { authorDiscordId: user.discordId },
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
  getTribe: authorizedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const steamId = user?.steamId;
    if (!steamId) return { error: true, message: 'Steam is not paired' };

    const data = await getTribe(steamId);
    if (!data) return { error: true, message: 'Could not find a tribe' };

    return { success: true, data };
  }),
  getTribeLogs: authorizedProcedure.query(async ({ ctx }) => {
    const { user, prisma } = ctx;

    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const steamId = user.steamId;
    if (!steamId) return { error: true, message: 'Steam is not paired' };

    const data = await getTribe(steamId);
    if (!data) return { error: true, message: 'Could not find a tribe' };

    const logs = await prisma.tribeLog.findMany({
      where: { tribeId: data.tribe.tribeId },
      select: {
        content: true,
        timestamp: true,
        logType: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return { success: true, tribeName: data.tribe.tribeName, messages: logs };
  }),
  getTranscript: authorizedProcedure
    .input(z.object({ ticketId: z.string().min(1), authorId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const { authorId, ticketId } = input;

      const getTranscript = await createTicketTranscript(authorId, ticketId);

      return { url: getTranscript };
    }),
  closeTicket: authorizedProcedure.input(z.object({ ticketId: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { ticketId } = input;

    if (!user.discordId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const closeStatus = await apiCloseTicket(user.discordId, ticketId);

    return { closed: closeStatus };
  }),
  sendMessage: authorizedProcedure
    .input(z.object({ ticketId: z.string().min(1), content: z.string().min(1).max(1500) }))
    .mutation(async ({ ctx, input }) => {
      const { content, ticketId } = input;
      const { user } = ctx;

      if (!user.discordId || !user.name) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const action = await apiTicketWebhookMessage({
        content,
        ticketId,
        userDiscordId: user.discordId,
        authorUsername: `${user.name} (website)`,
        avatar: user.image ?? undefined,
      });

      return action;
    }),
  getPayment: authorizedProcedure
    .input(z.object({ transactionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { transactionId } = input;
      const { prisma } = ctx;

      const payment = await prisma.payment.findUnique({
        where: { transactionId },
        select: {
          transactionId: true,
          status: true,
          priceAmount: true,
          priceCurrency: true,
          taxFeeAmount: true,
          taxFeeCurrency: true,
          gatewayFeeAmount: true,
          gatewayFeeCurrency: true,
          customerUsername: true,
          createdAt: true,
          products: true,
          user: {
            select: {
              image: true,
              name: true,
            },
          },
        },
      });

      return payment;
    }),
  getMembers: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;
    const guild = await prisma.config.findFirst({
      select: {
        discordMembers: true,
      },
    });
    return guild?.discordMembers ?? 7000;
  }),
  getRandomProducts: publicProcedure.query(async () => {
    if (categories.length <= 0) {
      const getCategories = await shopGetCategories();
      categories = getCategories;
    }

    const allProducts = categories.map((entry) => entry.packages).flat();
    if (allProducts.length <= 4) {
      return allProducts.map(({ image, base_price, name, id }) => ({
        name,
        image,
        basePrice: base_price,
        id,
      }));
    }

    const randomProducts = [];
    const ids = new Set();

    while (randomProducts.length < 4) {
      const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
      if (ids.has(randomProduct.id)) continue;
      randomProducts.push(randomProduct);
      ids.add(randomProduct.id);
    }

    return randomProducts.map(({ image, base_price, name, id }) => ({
      name,
      image,
      basePrice: base_price,
      id,
    }));
  }),
});

export type AppRouter = typeof appRouter;
