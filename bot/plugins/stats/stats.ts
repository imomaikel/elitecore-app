import { getPlayersData, getTribesData } from '../../lib/mysql';
import { createImages, updateStats } from '.';

export const _createStats = async () => {
  const players = await getPlayersData();
  const tribes = await getTribesData();

  if (!players || !tribes) return;

  // Calculate each player kdr and add playtime to tribe
  for (const player of players) {
    if (player.deaths === 0) {
      player.kdr = player.playersKills;
    } else {
      player.kdr = parseFloat((player.playersKills / player.deaths).toFixed(2));
    }
    if (player.tribeId) {
      const tribe = tribes.find((entry) => entry.pk === player.tribeId);
      if (!tribe) continue;
      if (tribe.playTime) {
        tribe.playTime += player.playTime;
      } else {
        tribe.playTime = player.playTime;
      }
    }
  }

  // Calculate each tribe kdr
  for (const tribe of tribes) {
    if (!tribe.playTime) tribe.playTime = 0;
    if (tribe.playersDeaths === 0) {
      tribe.kdr = tribe.playersKills;
    } else {
      tribe.kdr = parseFloat((tribe.playersKills / tribe.playersDeaths).toFixed(2));
    }
  }

  const imagesCreated = await createImages({ players, tribes });

  if (!imagesCreated) return null;

  return await updateStats();
};
