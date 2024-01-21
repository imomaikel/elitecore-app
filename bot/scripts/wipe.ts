import { getTableCreateTime } from '../lib/mysql';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const checkForNewWipe = async () => {
  const [config, tableData] = await Promise.all([
    prisma.config.findFirst({
      select: { lastWipe: true },
    }),
    getTableCreateTime(),
  ]);

  const lastWipe = config?.lastWipe.getTime();
  const createTime = tableData && tableData[0].createTime.getTime();
  if (!createTime) return;
  if (lastWipe === createTime) return;

  await prisma.$queryRaw(Prisma.sql`DROP TABLE IF EXISTS TribeLogBackup;`);
  await prisma.$queryRaw(Prisma.sql`CREATE TABLE TribeLogBackup AS SELECT * FROM ec.TribeLog;`);
  await prisma.tribeLog.deleteMany();
  await prisma.config.updateMany({
    data: {
      lastWipe: new Date(createTime),
    },
  });
};
