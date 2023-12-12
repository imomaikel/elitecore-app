import { addProduct, removeProduct, shopGetCategories } from '../../../_shared/lib/tebex';
import { authorizedProcedure, publicProcedure, router } from './trpc';
import { adminRouter } from './admin-router';
import { GetBasket } from 'tebex_headless';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

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

export const appRouter = router({
  admin: adminRouter,
  getTopPicks: publicProcedure
    .input(z.object({ activeProducts: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { activeProducts } = input;

      const productsCount: { productId: number; count: number }[] = [];

      const products = await prisma.product.findMany({
        where: {
          productId: {
            in: activeProducts,
          },
        },
      });
      for (const product of products) {
        const isAlready = productsCount.find((entry) => entry.productId === product.productId);
        if (isAlready) {
          isAlready.count++;
        } else {
          productsCount.push({ count: 1, productId: product.productId });
        }
      }

      const descOrder = productsCount.sort((a, b) => b.count - a.count).map((entry) => entry.productId);
      return descOrder;
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

    const currencies = await prisma.currencies.findMany({ select: { code: true, rate: true } });

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
  addToBasket: authorizedProcedure.input(z.object({ productId: z.number() })).mutation(async ({ ctx, input }) => {
    const { req, user } = ctx;
    const { productId } = input;

    if (!user) throw new TRPCError({ code: 'BAD_REQUEST' });

    const response = await addProduct({
      ipAddress: req.ip,
      productId: productId,
      user,
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
  getCategories: authorizedProcedure.query(async ({ ctx }) => {
    const { user, prisma } = ctx;

    const userData = await prisma.user.findFirst({
      where: { id: user.id },
    });
    if (!userData) throw new TRPCError({ code: 'UNAUTHORIZED' });

    let allowRefetch = false;

    if (!userData.lastCategoryFetch) {
      allowRefetch = true;
    } else {
      const timeNow = new Date().getTime();
      const lastTime = userData.lastCategoryFetch.getTime();

      const timeDiffInMs = timeNow - lastTime;
      const timeDiffInMinutes = Math.round(timeDiffInMs / 60_000);
      if (timeDiffInMinutes >= 1) {
        allowRefetch = true;
        await prisma.user.update({
          where: { id: user.id },
          data: { lastCategoryFetch: new Date() },
        });
      }
    }

    // if (!allowRefetch) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
    if (!allowRefetch) return undefined;

    const categories = await shopGetCategories();

    return categories;
  }),
});

export type AppRouter = typeof appRouter;
