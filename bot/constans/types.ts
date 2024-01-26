import { z } from 'zod';

export const API_BROADCAST_WIDGETS = z.enum([
  'serverStatusWidget',
  'serverStatusNotify',
  'serverControlWidget',
  'serverControlLog',
]);
export type TAPI_BROADCAST_WIDGETS = z.infer<typeof API_BROADCAST_WIDGETS>;

export const API_WIDGETS = z.enum(['ticketWidget', 'countdownWidget']);
export type TAPI_WIDGETS = z.infer<typeof API_WIDGETS>;

export type MYSQL_EOS_QUERY = {
  eos_id: string;
  player_id: number;
  character_name: string;
};
export type MYSQL_STEAM_QUERY = {
  steamid: string;
};

export type MYSQL_TRIBE_LOGS_QUERY = {
  tribeName: string;
  content: string;
  tribeId: number;
  logId: number;
  timestamp: Date;
};

export type MYSQL_TRIBE_MEMBER_QUERY = {
  pk: number;
  steam_id: string;
  player_id: number;
  player_name: string;
  tribe_id: number;
  tribe_rank: string;
  last_login: number;
  play_time: number;
  online_status: number;
  deaths: number;
  players_kills: number;
  wild_dinos_kills: number;
  tamed_dinos_kills: number;
  CustomTableName: number;
  CustomTableName02: number;
  CustomTableName03: number;
  need_handling: number;
  server_id: string;
  tribe_name: string;
  players_deaths: number;
  tamed_dinos_deaths: number;
};

export type MYSQL_PLAYERS_DATA = {
  pk: number;
  steamId: string;
  playerId: number;
  playerName: string;
  tribeId: number;
  playTime: number;
  onlineStatus: number;
  playersKills: number;
  deaths: number;
  tamedDinosKills: number;
  wildDinosKills: number;
  kdr?: number;
};
export type MYSQL_TRIBES_DATA = {
  pk: number;
  tribeId: number;
  tribeName: string;
  playersKills: number;
  playersDeaths: number;
  wildDinosKills: number;
  tamedDinosKills: number;
  kdr?: number;
  playTime?: number;
};
