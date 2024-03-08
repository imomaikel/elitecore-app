import { cleanTicketAttachments, ticketCleaner } from '../plugins/tickets';
import { updateServerControlWidget } from '../plugins/server-control';
import { fetchLogs, updateDamageWidget } from '../plugins/tribe';
import updateServerStatusWidget from '../plugins/server-status';
import { createLeaderboard } from '../plugins/leaderboard';
import { updateCountdown } from '../plugins/countdown';
import { minutesToMilliseconds } from 'date-fns';
import { checkForNewWipe } from './wipe';
import { getEnv } from '../utils/env';
import prisma from '../lib/prisma';
import { client } from '../client';

const scheduler = () => {
  setInterval(() => {
    updateServerControlWidget();
  }, 1000 * 60 * 3);
  updateServerControlWidget();

  setInterval(() => {
    updateServerStatusWidget();
  }, 1000 * 60 * 5);
  updateServerStatusWidget();

  setInterval(() => {
    ticketCleaner();
  }, 1000 * 60 * 2);

  setInterval(() => {
    fetchLogs();
  }, 1000 * 60 * 3);

  setInterval(() => {
    checkForNewWipe();
  }, 1000 * 60 * 3);

  setInterval(() => {
    updateCountdown();
  }, 1000 * 60 * 5);

  setInterval(() => {
    cleanTicketAttachments();
  }, 1000 * 60 * 60 * 6);

  setInterval(() => {
    createLeaderboard();
  }, 1000 * 60 * 30);

  setInterval(() => {
    updateDamageWidget();
  }, minutesToMilliseconds(60));

  // Update member count
  setInterval(async () => {
    const guildId = getEnv('PRODUCTION_DISCORD_GUILD_ID');
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;
    if (guild.memberCount < 100) return;
    await prisma.config.updateMany({
      data: {
        discordMembers: guild.memberCount,
      },
    });
  }, 1000 * 60 * 10);

  setInterval(async () => {
    const config = await prisma.config.findFirst();
    if (config) {
      const currenciesLastUpdatedInMinutes = Math.round(
        (new Date().getTime() - config.currenciesLastUpdated.getTime()) / 60_000,
      );
      if (currenciesLastUpdatedInMinutes >= 55) {
        try {
          fetch(getEnv('EXCHANGE_RATES_API_URL'))
            .then((res) => res.json())
            .then(async (data) => {
              if (!(data?.success && data?.rates)) return;
              const codes = Object.keys(data.rates);
              for await (const code of codes) {
                const rate = data.rates[code];

                await prisma.currency.upsert({
                  where: { code },
                  update: { code, rate },
                  create: { code, rate },
                });
              }
              await prisma.config.update({
                where: { id: config.id },
                data: { currenciesLastUpdated: new Date() },
              });
            });
        } catch {}
      }
    }
  }, 1000 * 60 * 50);
};

export default scheduler;
