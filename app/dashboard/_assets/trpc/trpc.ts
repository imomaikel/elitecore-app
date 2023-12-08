import { NextAuthSession } from '../../../../next-auth';
import { ExpressContext } from '../../../../server';
import { TRPCError, initTRPC } from '@trpc/server';
import { getSession } from 'next-auth/react';

const t = initTRPC.context<ExpressContext>().create();

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

const isLoggedIn = middleware(async ({ ctx, next }) => {
  try {
    const { req } = ctx;
    const session = (await getSession({ req })) as NextAuthSession | null;
    if (!session || !session.user.id) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return next({
      ctx: {
        user: session.user,
      },
    });
  } catch (error) {
    console.log('Middleware error', error);
  }
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
});

export const authorizedProcedure = publicProcedure.use(isLoggedIn);
