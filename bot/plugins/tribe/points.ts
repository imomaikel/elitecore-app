import { getAllTribeScore, updateTribeScore } from '../../lib/mysql';

export const _calculateTribePoints = async () => {
  const tribes = await getAllTribeScore();

  if (!tribes || tribes.length <= 0) {
    _calculateTribePoints();
    return;
  }

  const newTribeScores = tribes.map((tribe, newPosition) => {
    newPosition++;
    tribe.progress = tribe.score - tribe.oldScore;
    tribe.oldScore = tribe.score;
    if (newPosition === tribe.position) {
      tribe.mode = 'KEEP';
    } else if (newPosition > tribe.position) {
      tribe.mode = 'DEMOTE';
    } else if (newPosition < tribe.position) {
      tribe.mode = 'PROMOTE';
    }
    if (tribe.position === 0) tribe.mode = 'PROMOTE';
    tribe.position = newPosition;
    return tribe;
  });

  await Promise.all(
    newTribeScores.map(async ({ tribeId, oldScore, mode, position, progress }) => {
      await updateTribeScore(tribeId, progress, oldScore, position, mode);
    }),
  );
};
