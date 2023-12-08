import { DefaultSession } from 'next-auth';
// import type { User } from '@prisma/client';

interface NextAuthUser {
  id?: string;
  discordId?: string;
}
export interface NextAuthSession {
  user: NextAuthUser & DefaultSession['user'];
}

declare module 'next-auth/core/types' {
  interface Session {
    user: NextAuthUser & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    discordId?: string;
    uid?: string;
  }
}
