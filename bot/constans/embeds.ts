import { EmbedBuilder } from 'discord.js';
import { colors } from '.';

export const errorEmbed = (description: string, toUsername?: string) => {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setDescription(toUsername ? `Hey, ${toUsername}!\n${description}` : description)
    .setTimestamp();
  return embed;
};

export const successEmbed = (description: string, toUsername?: string) => {
  const embed = new EmbedBuilder()
    .setColor(colors.green)
    .setDescription(toUsername ? `Hey, ${toUsername}!\n${description}` : description)
    .setTimestamp();
  return embed;
};

type TSelectMapEmbed = {
  customName: string | null;
  mapName: string;
  gameType: string;
};
export const selectedMapEmbed = ({ customName, gameType, mapName }: TSelectMapEmbed) => {
  return new EmbedBuilder()
    .setColor(colors.green)
    .setFooter({ text: `${customName ? customName.replace(/_/gi, ' ') : ''} ARK: ${gameType}` })
    .setDescription(`:map: **Selected** \`${mapName.replace(/_/gi, ' ')}\` **map** :map:`);
};

export const enteredCoordsEmbed = (coords: string) => {
  return new EmbedBuilder().setColor(colors.green).setDescription(`:compass: **Coordinates entered:** \`${coords}\``);
};

export const changeMapEmbed = () => {
  return new EmbedBuilder()
    .setColor(colors.green)
    .setDescription('**Map selected!**\nIf you did it by mistake feel free to change it below.');
};
