import { checkForLogsColumn, disableLogs, getLogs } from '../../lib/mysql';
import prisma from '../../lib/prisma';
import { getLogType } from '.';

export const _fetchLogs = async () => {
  await checkForLogsColumn();
  const logs = await getLogs();
  if (!logs) return;

  try {
    await prisma.tribeLog.createMany({
      data: logs.map(({ content, timestamp, tribeId, tribeName }) => {
        content = content
          .replace(/<RichColor Color=".{0,30}">/gi, '')
          .replace(/<\/>/gi, '')
          .replace(/[0-9]{6,12}/gi, '');
        const logType = getLogType(content);
        return {
          content,
          timestamp,
          tribeId,
          tribeName,
          logType,
        };
      }),
    });

    const ids = logs.map(({ logId }) => logId);
    await disableLogs(ids);
  } catch {}
};
