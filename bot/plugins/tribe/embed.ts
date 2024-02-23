import { colors, extraSigns } from '../../constans';
import { EmbedBuilder, time } from 'discord.js';
import prisma from '../../lib/prisma';

export const _generateScoreMessage = async () => {
  const tribes = await prisma.tribe.findMany({
    orderBy: {
      points: 'desc',
    },
    take: 10,
  });
  if (tribes.length <= 0) return null;

  const longestNameLength = tribes.slice().sort((a, b) => b.tribeName.length - a.tribeName.length)[0].tribeName.length;

  const content = tribes.map((tribe, index) => {
    const position = index + 1;
    const mode = tribe.newScoreMode === 'DEMOTE' ? '-' : tribe.newScoreMode === 'PROMOTE' ? '+' : ' ';
    const modeIcon = tribe.newScoreMode === 'DEMOTE' ? '🡻' : tribe.newScoreMode === 'PROMOTE' ? '🡹' : ' ';
    const points = tribe.points.toLocaleString('de-DE');
    const positionSpace = position <= 9 ? ' ' : '';
    const tribeSpace = ' '.repeat(longestNameLength - tribe.tribeName.length + 4);

    const line = `${mode} ${position}.${positionSpace} ${tribe.tribeName}${tribeSpace} ${modeIcon} ${points}`;
    return line;
  });

  const embed = new EmbedBuilder()
    .setColor(colors.purple)
    .setDescription(`**Last update: ** ${time(new Date(), 'R')}`)
    .setFooter({
      text: `${extraSigns.zap} Auto update every 6 hours`,
    })
    .addFields({
      name: 'How is it calculated?',
      value:
        'Each structure in game has its certain points. Every time you destroy a structure you get points, as well as minus points when someone destroys your structure.',
    });

  return {
    embed,
    content: `\`\`\`diff\n${content.join('\n')}\`\`\``,
  };
};
