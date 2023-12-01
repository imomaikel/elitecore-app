import { appRouter } from '../app/_assets/trpc/trpc-router';
import { nextApp, nextRequestHandler } from '../app/next';
import { inferAsyncReturnType } from '@trpc/server';
import { connectToSocketServer } from './socket';
import { getPort } from '../app/_assets/utils';
import buildNextApp from 'next/dist/build';
import express from 'express';
import {
    CreateExpressContextOptions,
    createExpressMiddleware,
} from '@trpc/server/adapters/express';

// Create express server
const app = express();
const PORT = getPort();
const expressContext = ({ req, res }: CreateExpressContextOptions) => ({
    req,
    res,
});
export type ExpressContext = inferAsyncReturnType<typeof expressContext>;

// Initialize app and server
(() => {
    // Build the app
    if (process.env.NEXT_BUILD) {
        app.listen(PORT, async () => {
            // @ts-expect-error Build from directory
            await buildNextApp(process.cwd());
            process.exit();
        });
        return;
    }

    // Create tRPC
    app.use(
        '/trpc',
        createExpressMiddleware({
            router: appRouter,
            createContext: expressContext,
        }),
    );

    // Start the app
    app.use((req, res) => nextRequestHandler(req, res));
    nextApp.prepare().then(() => {
        app.listen(PORT, async () => {
            console.log(
                `Next.js started. ${process.env.NEXT_PUBLIC_SERVER_URL}`,
            );
        });
    });

    // Create socket client
    connectToSocketServer();

    // Start the bot
    import('../bot/client');
})();
