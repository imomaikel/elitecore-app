import { TWebhookRequest } from '..';
import express from 'express';
import crypto from 'crypto';
import { TWebhookData } from './types';

const ALLOWED_IPS = ['::ffff:18.209.80.3', '18.209.80.3', '::ffff:54.87.231.232', '54.87.231.232'];

const webhookHandler = (req: any, res: express.Response) => {
  // Check webhook IP
  if (!req?.ip || !ALLOWED_IPS.includes(req.ip)) return res.sendStatus(401);

  try {
    const webhookRequest = req as TWebhookRequest;
    const data = JSON.parse(webhookRequest.rawBody.toString()) as TWebhookData;
    const headers = req.headers;
    const signature = headers['x-signature'];
    if (!data || !headers || !signature) return res.sendStatus(400);
    // Verify signature
    const secretKey = process.env.TEBEX_WEBHOOK_SECRET;
    if (!secretKey) return res.sendStatus(500);
    const hashedBody = crypto.createHash('sha256').update(webhookRequest.rawBody.toString()).digest('hex');
    const hmac = crypto.createHmac('sha256', secretKey).update(hashedBody).digest('hex');
    if (hmac !== signature) return res.sendStatus(410);

    if (data.type === 'validation.webhook') {
      res.json({ id: data.id }).status(200);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

export default webhookHandler;
