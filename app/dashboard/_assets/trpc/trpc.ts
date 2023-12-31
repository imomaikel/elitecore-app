import { NextAuthSession } from '../../../../next-auth';
import { ExpressContext } from '../../../../server';
import { TRPCError, initTRPC } from '@trpc/server';
import prisma from '../../../_shared/lib/prisma';
import { getSession } from 'next-auth/react';

const t = initTRPC.context<ExpressContext>().create();

export const router = t.router;
export const middleware = t.middleware;

const prismaContext = middleware(({ next }) => {
  return next({
    ctx: {
      prisma,
    },
  });
});

export const publicProcedure = t.procedure.use(prismaContext);

const isLoggedIn = middleware(async ({ ctx, next }) => {
  const { req } = ctx;
  const session = (await getSession({ req })) as NextAuthSession | null;
  if (session && session.user.id) {
    return next({
      ctx: {
        user: session.user,
        prisma,
      },
    });
  }
  throw new TRPCError({ code: 'UNAUTHORIZED' });
});
const isAdmin = middleware(async ({ ctx, next }) => {
  const { req } = ctx;
  const session = (await getSession({ req })) as NextAuthSession | null;
  if (session && session.user.id && session.user.isAdmin) {
    return next({
      ctx: {
        user: session.user,
        prisma,
      },
    });
  } else {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
});

export const authorizedProcedure = publicProcedure.use(isLoggedIn);
export const adminProcedure = publicProcedure.use(isAdmin);
