import { CreateExpressContextOptions, createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../app/dashboard/_assets/trpc/trpc-router';
import { getPort, nextApp, nextRequestHandler } from '../app/next';
import { dataReceived } from '../bot/helpers/api';
import buildNextApp from 'next/dist/build';
import { IncomingMessage } from 'http';
import webhookHandler from './webhooks';
import bodyParser from 'body-parser';
import express from 'express';

// Create express server
const app = express();
const PORT = getPort();
const createContext = async ({ req, res }: CreateExpressContextOptions) => ({ req, res });
export type ExpressContext = Awaited<ReturnType<typeof createContext>>;
export type TWebhookRequest = IncomingMessage & { rawBody: Buffer };

// Initialize app and server
(() => {
  console.log('\n');
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
      createContext,
    }),
  );

  // API Server
  app.use('/api/manager', bodyParser.json(), (req, res) => {
    if (
      !(
        req.socket.remoteAddress === '127.0.0.1' ||
        req.socket.remoteAddress === '::ffff:127.0.0.1' ||
        req.socket.remoteAddress === 'localhost'
      )
    ) {
      return res.sendStatus(401);
    }
    try {
      const command = req.body['command'];
      const data = req.body['data'];
      if (!(command && data)) return;
      dataReceived(command, data);
      res.sendStatus(200);
    } catch {}
  });

  // Listen for webhooks
  app.use(
    '/api/webhooks',
    bodyParser.json({
      verify: (req: TWebhookRequest, _, buf) => {
        req.rawBody = buf;
      },
    }),
    webhookHandler,
  );

  // Start the app
  app.use((req, res) => nextRequestHandler(req, res));
  nextApp.prepare().then(() => {
    app.listen(PORT, async () => {
      console.log(`Next.js started. ${process.env.NEXT_PUBLIC_SERVER_URL}`);
    });
  });

  // Start the bot
  import('../bot/client');
})();
