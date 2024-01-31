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
  last_login: number | null;
  play_time: number | null;
  online_status: number | null;
  deaths: number | null;
  players_kills: number | null;
  wild_dinos_kills: number | null;
  tamed_dinos_kills: number | null;
  CustomTableName: number | null;
  CustomTableName02: number | null;
  CustomTableName03: number | null;
  need_handling: number | null;
  server_id: string;
  tribe_name: string;
  players_deaths: number | null;
  tamed_dinos_deaths: number | null;
};

export type MYSQL_PLAYERS_DATA = {
  pk: number;
  steamId: string;
  playerId: number;
  playerName: string;
  tribeId: number;
  playTime: number | null;
  onlineStatus: number | null;
  playersKills: number | null;
  deaths: number | null;
  tamedDinosKills: number | null;
  wildDinosKills: number | null;
  kdr?: number;
};
export type MYSQL_TRIBES_DATA = {
  pk: number;
  tribeId: number;
  tribeName: string;
  playersKills: number | null;
  playersDeaths: number | null;
  wildDinosKills: number | null;
  tamedDinosKills: number | null;
  kdr?: number;
  playTime?: number;
};
