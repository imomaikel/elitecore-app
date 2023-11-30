import { botSendMessage } from '../../../bot/api';
// import { sendToPython } from '../../socket';
import { publicProcedure, privateProcedure, router } from './trpc';
// import prisma from '../lib/prisma';
import { z } from 'zod';

export const appRouter = router({
    addUser: publicProcedure
        .input(
            z.object({
                name: z.string().min(2, { message: 'Username is too short' }),
            }),
        )
        .mutation(async () => {
            return 1;
        }),
    getUsers: publicProcedure.mutation(async () => {
        return [];
    }),
    sendMessage: privateProcedure
        .input(
            z.object({
                channelId: z.string().min(5),
                content: z.string().min(2),
            }),
        )
        .mutation(async ({ input }) => {
            const { channelId, content } = input;

            // Discord.js action
            const action = await botSendMessage({
                channelId: channelId,
                content,
            });

            return action.message;
        }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
