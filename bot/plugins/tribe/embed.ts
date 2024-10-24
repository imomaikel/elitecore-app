import { minutesToMilliseconds } from 'date-fns';
import { colors, extraSigns } from '../../constans';
import { getTopTribeScore } from '../../lib/mysql';
import { EmbedBuilder, time } from 'discord.js';

export const _generateScoreMessage = async () => {
  const tribes = await getTopTribeScore();

  if (!tribes || tribes.length <= 0) {
    setTimeout(() => {
      _generateScoreMessage();
    }, minutesToMilliseconds(30));
    return;
  }

  const longestNameLength = tribes.slice().sort((a, b) => b.tribeName.length - a.tribeName.length)[0].tribeName.length;

  const content = tribes.map((tribe, index) => {
    const position = index + 1;
    const mode = tribe.mode === 'DEMOTE' ? '-' : tribe.mode === 'PROMOTE' ? '+' : ' ';
    const points = tribe.score.toLocaleString('de-DE');
    const positionSpace = position <= 9 ? ' ' : '';
    const tribeSpace = ' '.repeat(longestNameLength - tribe.tribeName.length + 4);
    const positiveProgress = tribe.progress >= 0;

    const line = `${mode} ${position}.${positionSpace}  ${tribe.tribeName}${tribeSpace} ${points} (${
      positiveProgress ? '+' : '-'
    }${Math.abs(tribe.progress)} score)`;
    return line;
  });

  const title = 'PLACE | TRIBE NAME | POINTS (PROGRESS)\n';

  const embed = new EmbedBuilder()
    .setColor(colors.purple)
    .setDescription(`**Last update: ** ${time(new Date(), 'R')}`)
    .setFooter({
      text: `${extraSigns.zap} Auto update every 2 hours`,
    })
    .addFields({
      name: 'How is it calculated?',
      value:
        'Each structure in the game has its certain points. Every time **you destroy** a structure you get points, as well as minus points when someone **destroys your** structure. Furthermore, collapsed structures are also tallied in the scoring system.',
    });

  return {
    embed,
    content: `\`\`\`diff\n${title + content.join('\n')}\`\`\``,
  };
};
