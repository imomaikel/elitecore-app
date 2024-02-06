import { NextAuthSession } from '../../../../next-auth';
import { ExpressContext } from '../../../../server';
import { TRPCError, initTRPC } from '@trpc/server';
import prisma from '../../../_shared/lib/prisma';
import { getSession } from 'next-auth/react';
import SuperJSON from 'superjson';

const t = initTRPC.context<ExpressContext>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const middleware = t.middleware;

const prismaContext = middleware(async ({ next, ctx }) => {
  const { req } = ctx;
  const session = (await getSession({ req })) as NextAuthSession | null;
  return next({
    ctx: {
      prisma,
      user: session?.user ?? null,
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
  if (
    session &&
    session.user.id &&
    session.user.role === 'ADMIN' &&
    session.user.discordId &&
    session.user.discordId &&
    session.user.selectedGuildId
  ) {
    return next({
      ctx: {
        user: session.user,
        selectedGuildId: session.user.selectedGuildId,
        userDiscordId: session.user.discordId,
        prisma,
      },
    });
  } else {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
});

const isManager = middleware(async ({ ctx, next }) => {
  const { req } = ctx;
  const session = (await getSession({ req })) as NextAuthSession | null;
  if (
    session &&
    session.user.id &&
    session.user.discordId &&
    (session.user.role === 'ADMIN' || session.user.role === 'MANAGER')
  ) {
    return next({
      ctx: {
        user: session.user,
        selectedGuildId: session.user.selectedGuildId,
        userDiscordId: session.user.discordId,
        prisma,
      },
    });
  } else {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
});

export const authorizedProcedure = publicProcedure.use(isLoggedIn);
export const adminProcedure = publicProcedure.use(isAdmin);
export const managerProcedure = publicProcedure.use(isManager);
