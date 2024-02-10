import { ChannelType, EmbedBuilder, WebhookClient } from 'discord.js';
import { specialAvatar } from '../constans';
import { client } from '../client';
import logger from './logger';

// Create webhook if not exist
export const createWebhook = async (channel_id: string, avatar?: string) => {
  const channel = client.channels.cache.get(channel_id);
  if (!channel || channel.type !== ChannelType.GuildText) return null;

  let newWebhook: { id: string; token: string } = { id: '', token: '' };

  await channel
    .createWebhook({
      name: 'EliteCore',
      avatar: avatar ?? specialAvatar,
    })
    .then(async (webhook) => {
      newWebhook = {
        id: webhook.id,
        token: webhook.token!,
      };
    })
    .catch((err) => {
      logger({
        message: 'Could not create a webhook',
        type: 'error',
        data: err,
        file: 'webhook',
      });
    });

  return newWebhook.id.length >= 4 ? newWebhook : null;
};

// Check if webhook exist
const findWebhook = async (channel_id: string, webhook_id: string): Promise<boolean> => {
  const channel = client.channels.cache.get(channel_id);
  if (!channel || channel.type !== ChannelType.GuildText) return false;

  let found = false;

  await channel.fetchWebhooks().then(async (webhooks) => {
    webhooks.map((w) => {
      if (w.id === webhook_id) {
        found = true;
        return;
      }
    });
  });
  return found;
};

// Send webhook message
type TSuccess = {
  status: 'success';
  messageId: string;
  webhookId: string;
  webhookToken: string;
};
type TError = {
  status: 'error';
  message: string;
};
type TSendWebhookMessageOrEditResponse = TSuccess | TError;
type TSendWebhookMessageOrEdit = {
  channelId: string;
  customAvatar?: string;
  customName?: string;
  messageId?: string;
  messageContent?: string;
  embeds?: EmbedBuilder[];
  webhookId: string;
  webhookToken: string;
};
export const sendWebhookMessageOrEdit = async ({
  customAvatar,
  customName,
  channelId,
  embeds,
  messageContent,
  messageId,
  webhookId: _webhookId,
  webhookToken: _webhookToken,
}: TSendWebhookMessageOrEdit): Promise<TSendWebhookMessageOrEditResponse> => {
  let webhookId = '',
    webhookToken = '';

  if (!(_webhookId && _webhookToken)) {
    const createHook = await createWebhook(channelId, customAvatar);
    if (createHook) {
      webhookId = createHook.id;
      webhookToken = createHook.token;
    }
  } else {
    webhookId = _webhookId;
    webhookToken = _webhookToken;
    const ifExist = await findWebhook(channelId, webhookId);
    if (!ifExist) {
      const createHook = await createWebhook(channelId, customAvatar);
      if (createHook) {
        webhookId = createHook.id;
        webhookToken = createHook.token;
      }
    }
  }

  if (webhookId.length <= 4 || webhookToken.length <= 4) {
    return { status: 'error', message: 'Could not create a webhook' };
  }

  const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

  const message = messageId ? await webhookClient.fetchMessage(messageId).catch(() => {}) : null;

  let response: TSendWebhookMessageOrEditResponse = { status: 'error', message: 'Could not send the message' };

  if (message) {
    await webhookClient
      .editMessage(messageId!, {
        embeds,
        content: messageContent,
      })
      .then((msg) => {
        response = { status: 'success', messageId: msg.id, webhookId, webhookToken };
      })
      .catch(() => {});
  } else {
    await webhookClient
      .send({
        embeds,
        content: messageContent,
        // avatarURL: customAvatar,
        username: customName,
      })
      .then((msg) => {
        response = { status: 'success', messageId: msg.id, webhookId, webhookToken };
      })
      .catch(() => {});
  }
  return response;
};
