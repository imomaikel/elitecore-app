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
