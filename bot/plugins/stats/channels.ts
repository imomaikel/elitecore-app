import { StatsData } from '@prisma/client';
import { TImages } from './images';

type TStatsDataFields = keyof StatsData;

type TCategoryChannel = {
  type: 'CATEGORY';
  label: TStatsDataFields;
  channelId: TStatsDataFields;
};
type TTextChannel = {
  type: 'TEXT';
  label: TStatsDataFields;
  channelId: TStatsDataFields;
  playerMessageId: TStatsDataFields;
  updateMessageId: TStatsDataFields;
  tribeMessageId: TStatsDataFields;
  playersImage: TImages;
  tribesImage: TImages;
};
type TChannels = TCategoryChannel | TTextChannel;
export const _channelsSchema: TChannels[] = [
  {
    type: 'CATEGORY',
    channelId: 'categoryChannelId',
    label: 'categoryLabel',
  },
  {
    type: 'TEXT',
    label: 'playtimeLabel',
    channelId: 'playtimeChannelId',
    updateMessageId: 'playtimeUpdateMsgId',
    playerMessageId: 'playtimePlayerMsgId',
    tribeMessageId: 'playtimeTribeMsgId',
    playersImage: 'playersPlaytime.jpg',
    tribesImage: 'tribesPlaytime.jpg',
  },
  {
    type: 'TEXT',
    label: 'killersLabel',
    channelId: 'killersChannelId',
    updateMessageId: 'killersUpdateMsgId',
    playerMessageId: 'killersPlayerMsgId',
    tribeMessageId: 'killersTribeMsgId',
    playersImage: 'playersKills.jpg',
    tribesImage: 'tribesKills.jpg',
  },
  {
    type: 'TEXT',
    label: 'deathsLabel',
    channelId: 'deathsChannelId',
    updateMessageId: 'deathsUpdateMsgId',
    playerMessageId: 'deathsPlayerMsgId',
    tribeMessageId: 'deathsTribeMsgId',
    playersImage: 'playersDeaths.jpg',
    tribesImage: 'tribesDeaths.jpg',
  },
  {
    type: 'TEXT',
    label: 'kdrLabel',
    channelId: 'kdrChannelId',
    updateMessageId: 'kdrUpdateMsgId',
    playerMessageId: 'kdrPlayerMsgId',
    tribeMessageId: 'kdrTribeMsgId',
    playersImage: 'playersKDR.jpg',
    tribesImage: 'tribesKDR.jpg',
  },
  {
    type: 'TEXT',
    label: 'wildKillsLabel',
    channelId: 'wildKillsChannelId',
    updateMessageId: 'wildKillsUpdateMsgId',
    playerMessageId: 'wildKillsPlayerMsgId',
    tribeMessageId: 'wildKillsTribeMsgId',
    playersImage: 'playersWildDinosKills.jpg',
    tribesImage: 'tribesWildDinosKills.jpg',
  },
  {
    type: 'TEXT',
    label: 'tamedKillsLabel',
    channelId: 'tamedKillsChannelId',
    updateMessageId: 'tamedKillsUpdateMsgId',
    playerMessageId: 'tamedKillsPlayerMsgId',
    tribeMessageId: 'tamedKillsTribeMsgId',
    playersImage: 'playersTamedDinosKills.jpg',
    tribesImage: 'tribesTamedDinosKills.jpg',
  },
];
