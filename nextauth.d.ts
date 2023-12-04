import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        discordId?: string;
        id?: string;
    }
    interface Session extends DefaultSession {
        user?: User;
    }
}
declare module 'next-auth/jwt' {
    interface JWT {
        discordId?: string;
        uid?: string;
    }
}
