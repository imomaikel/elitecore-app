import { broadcaster } from '../../helpers/broadcaster';
import { colors, specialAvatar } from '../../constans';
import { TControlServer } from '../../helpers/socket';
import { EmbedBuilder, type User } from 'discord.js';
import prisma from '../../lib/prisma';

type TServerControlLog = {
  serversOrId: TControlServer[] | number;
  restartedBy: User | 'auto';
  action: string;
};
const serverControlLog = async ({ restartedBy, serversOrId, action }: TServerControlLog) => {
  const storedServers = await prisma.servers.findMany();

  const embeds = [];

  const dataSize = typeof serversOrId === 'number' ? 1 : serversOrId.length;

  for (let i = 0; i < dataSize; i++) {
    const serverDetails = storedServers.find(
      (entry) => entry.id === (typeof serversOrId === 'number' ? serversOrId : serversOrId[i].serverId),
    );
    if (!serverDetails) continue;

    const footerText = restartedBy === 'auto' ? 'Auto restarted' : `${restartedBy.username} took the action`;
    const footerImage = restartedBy === 'auto' ? specialAvatar : restartedBy.client.user.displayAvatarURL();

    const { mapName, customName } = serverDetails;

    let formatAction = '';
    if (action === 'start') {
      formatAction = 'started';
    } else if (action === 'stop') {
      formatAction = 'stopped';
    } else if (action === 'restart') {
      formatAction = 'restarted';
    }
    const serverName = `${mapName}${customName ? `(${customName})` : ''}`;

    const description = `Server \`${serverName}\` has been ${formatAction}\nAction status: ${
      typeof serversOrId === 'number' ? 'success' : serversOrId[i].status
    }`;

    embeds.push(
      new EmbedBuilder()
        .setColor(colors.purple)
        .setDescription(description)
        .setAuthor({ name: 'Server Control Notifications' })
        .setFooter({ text: footerText, iconURL: footerImage }),
    );
  }

  await broadcaster({
    messageEmbeds: embeds,
    widget: 'serverControlLog',
  });
};

export default serverControlLog;
