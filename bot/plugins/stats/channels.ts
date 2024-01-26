import { StatsData } from '@prisma/client';

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
  },
  {
    type: 'TEXT',
    label: 'killersLabel',
    channelId: 'killersChannelId',
    updateMessageId: 'killersUpdateMsgId',
    playerMessageId: 'killersPlayerMsgId',
    tribeMessageId: 'killersTribeMsgId',
  },
  {
    type: 'TEXT',
    label: 'deathsLabel',
    channelId: 'deathsChannelId',
    updateMessageId: 'deathsUpdateMsgId',
    playerMessageId: 'deathsPlayerMsgId',
    tribeMessageId: 'deathsTribeMsgId',
  },
  {
    type: 'TEXT',
    label: 'kdrLabel',
    channelId: 'kdrChannelId',
    updateMessageId: 'kdrUpdateMsgId',
    playerMessageId: 'kdrPlayerMsgId',
    tribeMessageId: 'kdrTribeMsgId',
  },
  {
    type: 'TEXT',
    label: 'wildKillsLabel',
    channelId: 'wildKillsChannelId',
    updateMessageId: 'wildKillsUpdateMsgId',
    playerMessageId: 'wildKillsPlayerMsgId',
    tribeMessageId: 'wildKillsTribeMsgId',
  },
  {
    type: 'TEXT',
    label: 'tamedKillsLabel',
    channelId: 'tamedKillsChannelId',
    updateMessageId: 'tamedKillsUpdateMsgId',
    playerMessageId: 'tamedKillsPlayerMsgId',
    tribeMessageId: 'tamedKillsTribeMsgId',
  },
];
