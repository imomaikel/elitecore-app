import { getPlayersData, getTribesData } from '../../lib/mysql';
import { createImages, updateLeaderboard } from '.';

export const _createLeaderboard = async (firstTime?: boolean): Promise<boolean> => {
  const players = await getPlayersData();
  const tribes = await getTribesData();

  if (!players || !tribes) return false;

  // Calculate each player kdr and add playtime to tribe
  for (const player of players) {
    if (player.deaths === 0) {
      player.kdr = player.playersKills ?? 0;
    } else {
      player.kdr = parseFloat(((player.playersKills ?? 0) / (player.deaths ?? 1)).toFixed(2));
    }
    if (player.tribeId) {
      const tribe = tribes.find((entry) => entry.pk === player.tribeId);
      if (!tribe) continue;
      if (tribe.playTime) {
        tribe.playTime += player.playTime ?? 0;
      } else {
        tribe.playTime = player.playTime ?? 0;
      }
    }
  }

  // Calculate each tribe kdr
  for (const tribe of tribes) {
    if (!tribe.playTime) tribe.playTime = 0;
    if (tribe.playersDeaths === 0) {
      tribe.kdr = tribe.playersKills ?? 0;
    } else {
      tribe.kdr = parseFloat(((tribe.playersKills ?? 0) / (tribe.playersDeaths ?? 1)).toFixed(2));
    }
  }

  const imagesCreated = await createImages({ players, tribes });

  if (!imagesCreated) return false;
  if (firstTime) return true;

  return await updateLeaderboard();
};
