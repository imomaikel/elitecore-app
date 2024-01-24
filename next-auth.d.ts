import { DefaultSession } from 'next-auth';
import { UserRole } from '@prisma/client';

interface NextAuthUser {
  id?: string;
  discordId?: string;
  role?: UserRole;
  selectedGuildId?: string | null;
  basketIdent?: string | null;
  currency?: string;
  steamId?: string;
  lastViewedTicketId?: string | null;
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
