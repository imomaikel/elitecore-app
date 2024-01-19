import { getTribeData } from '../../lib/mysql';

export const _getTribe = async (steamId: string) => {
  const data = await getTribeData(steamId);

  return data;
};
