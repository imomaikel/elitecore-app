import { addProduct, removeProduct, shopGetCategories } from '../../../_shared/lib/tebex';
import { authorizedProcedure, publicProcedure, router } from './trpc';
import { adminRouter } from './admin-router';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { GetBasket } from 'tebex_headless';

export const appRouter = router({
  admin: adminRouter,
  getRecentPayments: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;
    const users = (
      await prisma.payment.findMany({
        orderBy: { createdAt: 'asc' },
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
