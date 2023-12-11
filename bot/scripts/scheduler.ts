import { updateServerControlWidget } from '../plugins/server-control';
import updateServerStatusWidget from '../plugins/server-status';
import { getEnv } from '../utils/env';
import prisma from '../lib/prisma';

const scheduler = () => {
  setInterval(() => {
    updateServerControlWidget();
  }, 1000 * 60 * 3);
  updateServerControlWidget();

  setInterval(() => {
    updateServerStatusWidget();
  }, 1000 * 60 * 5);
  updateServerStatusWidget();

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

                await prisma.currencies.upsert({
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
