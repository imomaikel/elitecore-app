import {
  MYSQL_EOS_QUERY,
  MYSQL_PLAYERS_DATA,
  MYSQL_STEAM_QUERY,
  MYSQL_TRIBES_DATA,
  MYSQL_TRIBE_LOGS_QUERY,
  MYSQL_TRIBE_MEMBER_QUERY,
  TDbGetTopTribeScore,
} from '../constans/types';
import { schemaCreateList, schemaDeleteList } from '../../app/dashboard/_assets/constans';
import { TribeScorePosition } from '@prisma/client';
import { playTimeToText } from '../utils/misc';
import { getEnv } from '../utils/env';
import mysql from 'mysql';

const pool = mysql.createPool({
  connectionLimit: 50,
  host: getEnv('DATABASE_HOST'),
  user: getEnv('DATABASE_USER'),
  password: getEnv('DATABASE_PASSWORD'),
  supportBigNumbers: true,
  connectTimeout: 5_000,
});

const db = async (query: string, noLog?: boolean) => {
  const result = await new Promise((resolve, reject) => {
    try {
      pool.getConnection(async (err, connection) => {
        if (err) {
          console.log('DB Pool awaiting');
          setTimeout(() => {
            db(query);
            return;
          }, 2000);
        } else {
          try {
            connection.query(
              {
                sql: query,
              },
              (error, res) => {
                if (error) {
                  if (!noLog) console.log(err);
                  reject(null);
                }
                if (res && res[0]) return resolve(res);
                return reject(null);
              },
            );
            connection.release();
          } catch (error) {
            console.log('Mysql Error', error);
            reject(null);
          }
        }
      });
    } catch {
      reject(null);
    }
  }).catch(() => null);
  return result;
};
export const findEOS = async (userDiscordId: string) => {
  const query = await db(`SELECT eos_id FROM eosid.player_discord WHERE discord_id = ${userDiscordId};`);
  return typeof query === 'object' ? (query as MYSQL_EOS_QUERY[]) : null;
};
export const findSteam = async (userDiscordId: string) => {
  const query = await db(`SELECT steamid FROM discord.discord_integration_players WHERE DiscordID = ${userDiscordId};`);
  return typeof query === 'object' ? (query as MYSQL_STEAM_QUERY[]) : null;
};

export const deleteSchema = async (schemaName: string) => {
  if (![...schemaDeleteList, ...schemaCreateList].includes(schemaName)) return false;
  const mode = schemaName.includes('.') ? 'TABLE' : 'SCHEMA';

  await db(`DROP ${mode} ${schemaName};`, true).catch(() => {});
  if (schemaCreateList.includes(schemaName) && mode == 'SCHEMA') {
    await db(`CREATE SCHEMA ${schemaName};`, true).catch(() => {});
  }
  return true;
};

export const getLogs = async () => {
  const query = await db(`
  SELECT 
  tribes.wtribes_tribedata.TribeName AS tribeName,
  tribes.wtribes_events.TribeName AS content,
  tribes.wtribes_events.TribeID AS tribeId,
  tribes.wtribes_events.ID AS logId,
    timestamp
  FROM
    tribes.wtribes_events
  INNER JOIN
    tribes.wtribes_tribedata
  ON 
    tribes.wtribes_tribedata.TribeID = tribes.wtribes_events.TribeID
      AND
        tribes.wtribes_events.EventType = 1012
      AND
        tribes.wtribes_events.fetched = FALSE;`);
  return typeof query === 'object' ? (query as MYSQL_TRIBE_LOGS_QUERY[]) : null;
};

export const disableLogs = async (logIds: number[]) => {
  const idsArray = `(${logIds.join(',')})`;
  await db(`UPDATE tribes.wtribes_events SET fetched = 1 WHERE ID IN ${idsArray};`);
};

export const getTribeData = async (steamId: string) => {
  const query = await db(`SELECT *, s.tribe_id
  FROM gog_stats_ark.personal_stats n
  LEFT JOIN gog_stats_ark.tribe_stats s ON s.pk = n.tribe_id
  LEFT JOIN gog_stats_ark.personal_stats d ON s.pk = d.tribe_id
  WHERE n.steam_id = '${steamId}';`);

  const data = typeof query === 'object' ? (query as MYSQL_TRIBE_MEMBER_QUERY[]) : null;
  if (!data) return null;

  const members = data.map((player) => ({
    steamId: player.steam_id,
    lastLogin: new Date((player.last_login ?? 0) * 1000),
    playerName: player.player_name,
    playTimeText: playTimeToText(player.play_time ?? 0),
    playTime: player.play_time,
    isOnline: !!player.online_status,
    deaths: player.deaths,
    kills: player.players_kills,
    wildDinosKills: player.wild_dinos_kills,
    tamedDinosDeaths: player.tamed_dinos_deaths,
    tamedDinosKills: player.tamed_dinos_kills,
  }));

  const response = {
    user: members[0],
    members: members.slice(1),
    tribe: {
      tribeId: data[0].tribe_id,
      tribeName: data[0].tribe_name,
    },
  };

  return response;
};

export const getTableCreateTime = async () => {
  const query = await db(
    'SELECT CREATE_TIME AS createTime FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "tribes" AND TABLE_NAME = "wtribes_log";',
  );
  const data = typeof query === 'object' ? (query as { createTime: Date }[]) : null;
  return data;
};

export const getPlayersData = async () => {
  const query = await db(
    `SELECT 
    pk, steam_id AS steamId, player_id AS playerId,
    player_name AS playerName, tribe_id AS tribeId,
    play_time AS playTime, online_status AS onlineStatus,
    players_kills AS playersKills, deaths, tamed_dinos_kills AS tamedDinosKills,
     wild_dinos_kills AS wildDinosKills FROM gog_stats_ark.personal_stats;`,
  );
  const data = typeof query === 'object' ? (query as MYSQL_PLAYERS_DATA[]) : null;
  return data;
};
export const getTribesData = async () => {
  const query = await db(
    `SELECT pk, tribe_id AS tribeId, tribe_name AS tribeName,
     players_kills AS playersKills, players_deaths AS playersDeaths,
     wild_dinos_kills AS wildDinosKills, tamed_dinos_kills AS tamedDinosKills
     FROM gog_stats_ark.tribe_stats;`,
  );
  const data = typeof query === 'object' ? (query as MYSQL_TRIBES_DATA[]) : null;
  return data;
};

export const getTopTribeScore = async () => {
  const query = await db(
    // eslint-disable-next-line quotes
    `SELECT * FROM webapp.tribescore WHERE TribeName NOT LIKE '' ORDER BY score DESC LIMIT 10;`,
  );

  return query ? (query as TDbGetTopTribeScore) : [];
};
export const getAllTribeScore = async () => {
  const query = await db(
    // eslint-disable-next-line quotes
    `SELECT * FROM webapp.tribescore WHERE TribeName NOT LIKE '' ORDER BY SCORE DESC;`,
  );

  return query ? (query as TDbGetTopTribeScore) : [];
};
export const updateTribeScore = async (
  tribeId: bigint,
  progress: number,
  oldScore: number,
  position: number,
  mode: TribeScorePosition,
) => {
  await db(
    // eslint-disable-next-line quotes
    `UPDATE webapp.tribescore SET progress = ${progress}, oldScore = ${oldScore}, mode = '${mode}', position = ${position} WHERE TribeID = ${tribeId};`,
  );

  return;
};
