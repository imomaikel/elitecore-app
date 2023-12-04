import DiscordProvider from 'next-auth/providers/discord';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import NextAuth, { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
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
            session.user.discordId = token.discordId;
            session.user.id = token.uid;
            return session;
        },
        jwt: async ({ user, token, account }) => {
            if (!user || !account) return token;
            token.discordId = account.providerAccountId;
            token.uid = user.id;
            return token;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
