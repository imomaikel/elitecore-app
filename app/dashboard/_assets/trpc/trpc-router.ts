import { addProduct, shopGetCategories } from '../../../_shared/lib/tebex';
import { authorizedProcedure, router } from './trpc';
import { adminRouter } from './admin-router';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const appRouter = router({
  admin: adminRouter,
  addToBasket: authorizedProcedure.input(z.object({ productId: z.number() })).mutation(async ({ ctx, input }) => {
    const { req, user } = ctx;
    const { productId } = input;

    const response = await addProduct({
      ipAddress: req.ip,
      productId: productId,
      user,
    });

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

    if (!allowRefetch) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

    const categories = await shopGetCategories();

    return categories;
  }),
});

export type AppRouter = typeof appRouter;
