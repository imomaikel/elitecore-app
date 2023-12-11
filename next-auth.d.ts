import { DefaultSession } from 'next-auth';

interface NextAuthUser {
  id?: string;
  discordId?: string;
  isAdmin?: boolean;
  selectedGuildId?: string | null;
  basketIdent?: string | null;
  currency?: string;
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
