import { MYSQL_EOS_QUERY, MYSQL_STEAM_QUERY } from '../constans/types';
import { schemaList } from '../../app/dashboard/_assets/constans';
import { getEnv } from '../utils/env';
import mysql from 'mysql';

const db = async (query: string) => {
  try {
    const connection = mysql.createConnection({
      host: getEnv('DATABASE_HOST'),
      user: getEnv('DATABASE_USER'),
      password: getEnv('DATABASE_PASSWORD'),
      supportBigNumbers: true,
      connectTimeout: 5_000,
    });

    const result = await new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (res[0]) return resolve(res);
        return reject();
      });
    }).catch(() => null);

    connection.end();

    return typeof result === 'object' ? result : null;
  } catch {
    return null;
  }
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
  if (!schemaList.includes(schemaName)) return false;
  const mode = schemaName.includes('.') ? 'TABLE' : 'SCHEMA';

  await db(`DROP ${mode} ${schemaName};`);
  return true;
};
