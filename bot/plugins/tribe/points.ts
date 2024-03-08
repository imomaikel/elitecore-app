import prisma from '../../lib/prisma';

export const _calculateTribePoints = async () => {
  const tribes = await prisma.tribeScore.findMany({
    orderBy: {
      score: 'desc',
    },
  });

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
    newTribeScores.map(async (tribe) => {
      await prisma.tribeScore.update({
        where: { tribeId: tribe.tribeId },
        data: { ...tribe },
      });
    }),
  );
};
