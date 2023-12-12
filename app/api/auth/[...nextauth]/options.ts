import DiscordProvider from 'next-auth/providers/discord';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '../../../_shared/lib/prisma';
import { NextAuthOptions } from 'next-auth';

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_OAUTH2_CLIENT_ID!,
      clientSecret: process.env.DISCORD_OAUTH2_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (!session.user) return session;
      const getUserData = await prisma.user.findFirst({
        where: { id: token.uid },
      });
      if (!getUserData?.discordId) {
        await prisma.user.update({
          where: { id: token.uid },
          data: { discordId: token.discordId },
        });
      }
      if (getUserData?.steamId) {
        session.user.steamId = getUserData.steamId;
      }
      if (session.user.image?.includes('http') && getUserData?.avatar !== session.user.image) {
        await prisma.user.update({
          where: { id: token.uid },
          data: { avatar: session.user.image },
        });
      }
      session.user.basketIdent =
        getUserData?.basketIdent && getUserData.basketIdent?.length >= 5 ? getUserData?.basketIdent : null;
      session.user.currency === getUserData?.currency ?? 'EUR';
      session.user.isAdmin = getUserData?.isAdmin === true ? true : false;
      session.user.selectedGuildId = getUserData?.selectedDiscordId ? getUserData.selectedDiscordId : null;
      session.user.discordId = token.discordId;
      session.user.id = token.uid;
      return session;
    },
    jwt: async ({ token, user, account }) => {
      if (!user || !account) return token;
      token.discordId = account.providerAccountId;
      token.uid = user.id;
      return token;
    },
  },
};

export default authOptions;
