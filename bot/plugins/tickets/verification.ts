import { findEOS, findSteam } from '../../lib/mysql';
import prisma from '../../lib/prisma';

export type TFindReturn = {
  method: 'STEAM' | 'EOS';
  id: string;
};

export const findPairedAccount = async (userDiscordId: string): Promise<TFindReturn | boolean> => {
  userDiscordId = '321345707917443072';
  const userData = await prisma.user.findUnique({
    where: { discordId: userDiscordId },
  });

  if (userData?.steamId && userData.steamId.length >= 10) {
    return { method: 'STEAM', id: userData.steamId };
  }

  const getEOS = await findEOS(userDiscordId);
  const eosId = getEOS && getEOS[0].eos_id;
  if (eosId) {
    if (userData?.id) {
      await prisma.user.update({
        where: { discordId: userDiscordId },
        data: { eosId },
      });
    }
    return { method: 'EOS', id: eosId };
  }

  const getSteamId = await findSteam(userDiscordId);
  const steamId = getSteamId && getSteamId[0].steamid;
  if (steamId) {
    if (userData?.id) {
      await prisma.user.update({
        where: { discordId: userDiscordId },
        data: { steamId },
      });
    }
    return { method: 'STEAM', id: steamId };
  }

  return false;
};
