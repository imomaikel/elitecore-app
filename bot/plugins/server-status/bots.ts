import { avatars, extraSigns, randomAvatar } from '../../constans';
import { Client, GatewayIntentBits } from 'discord.js';
import type { Server } from '@prisma/client';
import logger from '../../scripts/logger';
import { clientBots } from '../../client';
import prisma from '../../lib/prisma';

type TServer = Server & {
  hasPair?: true | undefined;
};
/**
 * Update each bot's presence and status
 */
export const updateBots = async (servers: TServer[]) => {
  if (servers.length === 0) return;

  const serversSize = servers.length;
  const botsSize = clientBots.length;

  if (serversSize > botsSize) {
    logger({
      type: 'error',
      message: 'There are not enough bots to create presence-statuses',
    });
    return;
  }

  // Reset states
  clientBots.forEach((bot) => (bot.hasPair = false));

  // Check if a server has a pair
  for (const server of servers) {
    const serverName = server.customName ?? server.mapName;
    const matchBot = clientBots.find((bot) => bot.data.nickname === serverName);
    if (!matchBot) continue;
    matchBot.lastPlayers = server.lastPlayers;
    matchBot.lastStatus = server.lastStatus;
    matchBot.hasPair = true;
    server.hasPair = true;
  }

  // Find a pair for servers that don't have
  for await (const server of servers) {
    if (server.hasPair) continue;
    const serverName = server.customName ?? server.mapName;
    const pairedBot = clientBots.find((bot) => !bot.hasPair);
    if (!pairedBot) {
      logger({
        message: 'No pair for the bot',
        type: 'error',
        file: 'bot',
      });
      continue;
    }
    server.hasPair = true;
    pairedBot.hasPair = true;
    await prisma.bot.update({
      where: {
        id: pairedBot.data.id,
      },
      data: {
        nickname: serverName,
        gameName: server.gameType === 'Evolved' ? 'ASE' : 'ASA',
        isAvatarUpdated: false,
      },
    });
    pairedBot.lastPlayers = server.lastPlayers;
    pairedBot.lastStatus = server.lastStatus;
    pairedBot.newNickname = server.customName ?? server.mapName;
    pairedBot.gameType = server.gameType === 'Evolved' ? 'ASE' : 'ASA';
  }

  // Make bots' avatars unique if possible
  const avatarStack: string[] = [];
  let uniqueAvatars = Object.keys(avatars).length;

  for (const bot of clientBots) {
    if (!bot.hasPair) continue;
    // Check if bot should be enabled
    if (!bot.data.status) {
      await prisma.bot.update({
        where: {
          id: bot.data.id,
        },
        data: {
          status: true,
        },
      });
    }
    // Update status
    bot.account.user?.setStatus(bot.lastStatus === 'online' ? 'online' : 'dnd');
    const presenceText =
      bot.lastStatus === 'online'
        ? `${bot.lastPlayers} player${bot.lastPlayers! >= 2 ? 's' : ''} ${extraSigns.family}`
        : `offline server ${extraSigns.redCircle}`;
    bot.account.user?.setActivity({
      name: presenceText,
      type: 3,
    });
    // Check if the nickname is up to date
    if (bot.account?.user?.id) {
      bot.account.guilds.cache.forEach(async (guild) => {
        if (bot.newNickname) {
          const clientAsMember = await guild.members.fetch(bot.account.user?.id as string);
          const currentNickname = clientAsMember.nickname;
          const expectedNickname = `${bot.newNickname.replace(/_/gi, ' ')} (${bot.gameType})`;
          if (currentNickname !== expectedNickname) {
            await clientAsMember.setNickname(expectedNickname).catch(() => {});
          }
        }
      });
    }
    // Try to make the bot's avatar unique
    if (avatarStack.includes(bot.data.avatar)) {
      if (uniqueAvatars >= 1) {
        uniqueAvatars--;
        let newAvatar = randomAvatar();
        while (avatarStack.includes(newAvatar)) {
          newAvatar = randomAvatar();
        }
        // Delay the avatar update if the Discord API limit is hit
        const isAvatarUpdated = await bot.account.user
          ?.setAvatar(newAvatar)
          .then(() => true)
          .catch(() => false);
        await prisma.bot.update({
          where: {
            id: bot.data.id,
          },
          data: {
            avatar: newAvatar,
            isAvatarUpdated: isAvatarUpdated,
          },
        });
      }
    } else {
      avatarStack.push(bot.data.avatar);
    }
  }
  // Disable bots without a pair
  clientBots.forEach(async (bot) => {
    if (bot.data.status && !bot.hasPair) {
      await prisma.bot.update({
        where: {
          id: bot.data.id,
        },
        data: {
          status: false,
        },
      });
    }
  });
};

// Start each bot and make it invisible waiting for server statuses
export const setupBots = async () => {
  const bots = await prisma.bot.findMany();
  for await (const bot of bots) {
    // Create the client
    const account = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });
    clientBots.push({
      account: account,
      data: bot,
      isLoggedIn: false,
    });
  }
  // Set the status
  for (let i = 0; i < clientBots.length; i++) {
    const bot = clientBots[i];
    await bot.account.login(bot.data.token).catch(() => {});
    bot.account.once('ready', async (botInstance) => {
      bot.isLoggedIn = true;
      if (!bot.data.status) bot.account.user?.setStatus('invisible');
      if (bot.account.user?.username !== 'EliteCore Servers') bot.account.user?.setUsername('EliteCore Servers');
      if (!bot.data.clientId) {
        await prisma.bot.update({
          data: {
            clientId: botInstance.user.id,
          },
          where: {
            id: bot.data.id,
          },
        });
      }
      // Check if the nickname is up to date
      botInstance.guilds.cache.forEach(async (guild) => {
        const clientAsMember = await guild.members.fetch(botInstance.user.id);
        const currentNickname = clientAsMember.nickname;
        const expectedNickname = `${bot.data.nickname.replace(/_/gi, ' ')} (${bot.data.gameName})`;
        if (currentNickname !== expectedNickname) {
          await clientAsMember.setNickname(expectedNickname).catch(() => {});
        }
      });
      // Update the avatar if it was denied before
      if (!bot.data.isAvatarUpdated) {
        const isAvatarUpdated = await botInstance.user
          .setAvatar(bot.data.avatar)
          .then(() => true)
          .catch(() => false);
        if (isAvatarUpdated) {
          await prisma.bot.update({
            where: {
              id: bot.data.id,
            },
            data: {
              isAvatarUpdated: true,
            },
          });
        }
      }
    });
  }
};
