import { MYSQL_PLAYERS_DATA, MYSQL_TRIBES_DATA } from '../../constans/types';
import { readFileSync, mkdirSync } from 'fs';
import createImage from 'node-html-to-image';
import logger from '../../scripts/logger';
import { resolve } from 'path';

const GENERATE_PATH = resolve(process.cwd(), 'bot', 'plugins', 'leaderboard', 'images', 'generated');
const STATIC_IMAGES_PATH = resolve(process.cwd(), 'bot', 'plugins', 'leaderboard', 'images', 'static');

const HTML_SCHEMA = readFileSync(resolve(process.cwd(), 'bot', 'plugins', 'leaderboard', 'schema.html'));
const PLAYERS_IMAGE = readFileSync(resolve(STATIC_IMAGES_PATH, 'player.txt'), 'utf-8');
const BG_IMAGE = readFileSync(resolve(STATIC_IMAGES_PATH, 'background.txt'), 'utf-8');
const TRIBES_IMAGE = readFileSync(resolve(STATIC_IMAGES_PATH, 'tribe.txt'), 'utf-8');
const CROWN_IMAGE = readFileSync(resolve(STATIC_IMAGES_PATH, 'crown.txt'), 'utf-8');
const BOARD_SIZE = 10;

export type TImages =
  | 'playersPlaytime.jpg'
  | 'tribesPlaytime.jpg'
  | 'playersKills.jpg'
  | 'tribesKills.jpg'
  | 'playersDeaths.jpg'
  | 'tribesDeaths.jpg'
  | 'playersKDR.jpg'
  | 'tribesKDR.jpg'
  | 'playersWildDinosKills.jpg'
  | 'tribesWildDinosKills.jpg'
  | 'playersTamedDinosKills.jpg'
  | 'tribesTamedDinosKills.jpg';

type TCreateImages = {
  players: MYSQL_PLAYERS_DATA[];
  tribes: MYSQL_TRIBES_DATA[];
};
export const _createImages = async ({ players, tribes }: TCreateImages): Promise<boolean> => {
  mkdirSync(GENERATE_PATH, { recursive: true });

  try {
    await createImage({
      // @ts-expect-error Custom handlebars helper
      handlebarsHelpers: {
        increment: (number: number) => number + 1,
      },
      html: HTML_SCHEMA.toString(),
      quality: 100,
      content: [
        {
          // Players playtime
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Playtime',
          headerImage: PLAYERS_IMAGE,
          output: resolve(GENERATE_PATH, 'playersPlaytime.jpg' satisfies TImages),
          rows: players
            .sort((a, b) => b.playTime - a.playTime)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.playerName, score: entry.playTime })),
        },
        {
          // Tribes playtime
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Playtime',
          headerImage: TRIBES_IMAGE,
          output: resolve(GENERATE_PATH, 'tribesPlaytime.jpg' satisfies TImages),
          rows: tribes
            .sort((a, b) => b.playTime! - a.playTime!)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.tribeName, score: entry.playTime })),
        },
        {
          // Players players kills
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Kills',
          headerImage: PLAYERS_IMAGE,
          output: resolve(GENERATE_PATH, 'playersKills.jpg' satisfies TImages),
          rows: players
            .sort((a, b) => b.playersKills - a.playersKills)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.playerName, score: entry.playersKills })),
        },
        {
          // Tribes players kills
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Kills',
          headerImage: TRIBES_IMAGE,
          output: resolve(GENERATE_PATH, 'tribesKills.jpg' satisfies TImages),
          rows: tribes
            .sort((a, b) => b.playersKills - a.playersKills)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.tribeName, score: entry.playersKills })),
        },
        {
          // Players deaths
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Deaths',
          headerImage: PLAYERS_IMAGE,
          output: resolve(GENERATE_PATH, 'playersDeaths.jpg' satisfies TImages),
          rows: players
            .sort((a, b) => b.deaths - a.deaths)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.playerName, score: entry.deaths })),
        },
        {
          // Tribes deaths
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Deaths',
          headerImage: TRIBES_IMAGE,
          output: resolve(GENERATE_PATH, 'tribesDeaths.jpg' satisfies TImages),
          rows: tribes
            .sort((a, b) => b.playersDeaths - a.playersDeaths)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.tribeName, score: entry.playersDeaths })),
        },
        {
          // Players kdr
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Kill Death Ratio',
          headerImage: PLAYERS_IMAGE,
          output: resolve(GENERATE_PATH, 'playersKDR.jpg' satisfies TImages),
          rows: players
            .sort((a, b) => b.kdr! - a.kdr!)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.playerName, score: entry.kdr })),
        },
        {
          // Tribes kdr
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Kill Death Ratio',
          headerImage: TRIBES_IMAGE,
          output: resolve(GENERATE_PATH, 'tribesKDR.jpg' satisfies TImages),
          rows: tribes
            .sort((a, b) => b.kdr! - a.kdr!)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.tribeName, score: entry.kdr })),
        },
        {
          // Players wild dinos kills
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Wild Dinos Kills',
          headerImage: PLAYERS_IMAGE,
          output: resolve(GENERATE_PATH, 'playersWildDinosKills.jpg' satisfies TImages),
          rows: players
            .sort((a, b) => b.wildDinosKills - a.wildDinosKills)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.playerName, score: entry.wildDinosKills })),
        },
        {
          // Tribes wild dinos kills
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Wild Dinos Kills',
          headerImage: TRIBES_IMAGE,
          output: resolve(GENERATE_PATH, 'tribesWildDinosKills.jpg' satisfies TImages),
          rows: tribes
            .sort((a, b) => b.wildDinosKills - a.wildDinosKills)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.tribeName, score: entry.wildDinosKills })),
        },
        {
          // Players tamed dinos kills
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Tamed Dinos Kills',
          headerImage: PLAYERS_IMAGE,
          output: resolve(GENERATE_PATH, 'playersTamedDinosKills.jpg' satisfies TImages),
          rows: players
            .sort((a, b) => b.tamedDinosKills - a.tamedDinosKills)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.playerName, score: entry.tamedDinosKills })),
        },
        {
          // Tribes tamed dinos kills
          BG_IMAGE,
          CROWN_IMAGE,
          title: 'Tamed Dinos Kills',
          headerImage: TRIBES_IMAGE,
          output: resolve(GENERATE_PATH, 'tribesTamedDinosKills.jpg' satisfies TImages),
          rows: tribes
            .sort((a, b) => b.tamedDinosKills - a.tamedDinosKills)
            .slice(0, BOARD_SIZE)
            .map((entry) => ({ name: entry.tribeName, score: entry.tamedDinosKills })),
        },
      ],
    });

    return true;
  } catch (error) {
    logger({
      message: 'Create image error',
      type: 'error',
      data: error,
      file: 'images',
    });
    return false;
  }
};
