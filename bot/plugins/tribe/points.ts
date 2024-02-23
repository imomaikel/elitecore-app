import prisma from '../../lib/prisma';

export const _calculateTribePoints = async () => {
  const logsToCalculate = await prisma.tribeLog.findMany({
    where: { possiblePoints: true },
  });

  const buildings = await prisma.building.findMany();
  if (logsToCalculate.length <= 0 || buildings.length <= 0) return;

  const newBuildings = new Set<string>();
  const logsToUpdate: number[] = [];
  const tribesToUpdate: { tribeId: number; tribeName: string; points: number }[] = [];

  for (const log of logsToCalculate) {
    const content = log.content;

    let building = content;
    let mode: 'ADD' | 'REMOVE' = 'ADD';
    if (content.includes('destroyed their')) {
      building = content.substring(content.lastIndexOf('destroyed their') + 'destroyed their'.length + 2);
    } else if (content.includes('destroyed your')) {
      building = content.substring(content.lastIndexOf('destroyed your') + 'destroyed your'.length + 2);
      mode = 'REMOVE';
    } else {
      continue;
    }

    // prettier-ignore
    building = building.substring(0, building.lastIndexOf('\''));
    building = building
      .replace(/\(.*?\)/gi, '')
      .replace(/\s\s+/g, '')
      .trim();

    const buildingData = buildings.find(({ label }) => label === building);
    if (!buildingData) {
      newBuildings.add(building);
    } else {
      logsToUpdate.push(log.id);
      const pointsForBuilding = buildingData.points;
      if (!pointsForBuilding) continue;
      const findTribe = tribesToUpdate.find((entry) => entry.tribeId === log.tribeId);
      if (!findTribe) {
        tribesToUpdate.push({
          points: pointsForBuilding,
          tribeId: log.tribeId,
          tribeName: log.tribeName,
        });
      } else {
        findTribe.points += mode === 'ADD' ? pointsForBuilding : -pointsForBuilding;
      }
    }
  }

  for await (const tribe of tribesToUpdate) {
    await prisma.tribe.upsert({
      where: { tribeId: tribe.tribeId },
      create: {
        tribeId: tribe.tribeId,
        tribeName: tribe.tribeName,
        points: tribe.points,
      },
      update: {
        points: {
          ...(tribe.points >= 0
            ? {
                increment: tribe.points,
              }
            : {
                decrement: Math.abs(tribe.points),
              }),
        },
      },
    });
  }

  const updatedTribes = await prisma.tribe.findMany({
    orderBy: {
      points: 'desc',
    },
  });

  for (let i = 0; i < updatedTribes.length; i++) {
    const tribe = updatedTribes[i];
    const currentPosition = tribe.position;
    if (currentPosition === null) {
      tribe.newScoreMode = 'PROMOTE';
    } else if (currentPosition < i) {
      tribe.newScoreMode = 'DEMOTE';
    } else if (currentPosition > i) {
      tribe.newScoreMode = 'PROMOTE';
    } else if (currentPosition === i) {
      tribe.newScoreMode = 'SAME';
    }
    tribe.position = i;
  }

  for await (const tribe of updatedTribes) {
    await prisma.tribe.update({
      where: { tribeId: tribe.tribeId },
      data: tribe,
    });
  }

  await prisma.tribeLog.updateMany({
    where: {
      id: {
        in: logsToUpdate,
      },
    },
    data: {
      possiblePoints: false,
    },
  });

  const buildingsToAdd = Array.from(newBuildings);
  if (buildingsToAdd.length >= 1) {
    await prisma.building.createMany({
      data: buildingsToAdd.map((entry) => ({
        label: entry,
      })),
    });
  }
};
