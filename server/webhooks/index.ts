import handleWebhookEvent from './events';
import { TWebhookData } from './types';
import { TWebhookRequest } from '..';
import express from 'express';
import crypto from 'crypto';

const ALLOWED_IPS = ['::ffff:18.209.80.3', '18.209.80.3', '::ffff:54.87.231.232', '54.87.231.232'];

const webhookHandler = async (req: any, res: express.Response) => {
  // Check webhook IP
  if (!req?.headers || !req.headers['x-forwarded-for'] || !ALLOWED_IPS.includes(req.headers['x-forwarded-for'])) {
    return res.status(401).send('Invalid request');
  }

  try {
    const webhookRequest = req as TWebhookRequest;
    const data = JSON.parse(webhookRequest.rawBody.toString()) as TWebhookData;
    const headers = req.headers;
    const signature = headers['x-signature'];
    if (!data || !headers || !signature) return res.status(400).send('Invalid request');
    // Verify signature
    const secretKey = process.env.TEBEX_WEBHOOK_SECRET;
    if (!secretKey) return res.status(500).send('Server error (1)');
    const hashedBody = crypto.createHash('sha256').update(webhookRequest.rawBody.toString()).digest('hex');
    const hmac = crypto.createHmac('sha256', secretKey).update(hashedBody).digest('hex');
    if (hmac !== signature) return res.status(410).send('Signature mismatch');

    if (data.type === 'validation.webhook') {
      res.json({ id: data.id }).status(200);
    }

    // Handle webhook event and send response
    await handleWebhookEvent({ data, res });
  } catch (error) {
    res.status(500).send('Server error (2)');
  }
};

export default webhookHandler;
