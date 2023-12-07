import { broadcaster } from '../../helpers/broadcaster';
import { colors, randomAvatar, specialAvatar } from '../../constans';
import { EmbedBuilder } from 'discord.js';
import updateServerStatusWidget from '.';
import prisma from '../../lib/prisma';

// Send notify props that come from the socket server
type TSendServerStatusNotifications = {
  serverId: number;
  currentStatus: 'online' | 'offline';
};
/**
 * Send a Discord notification and update a widget when the server state changes
 * @param servers Data from the Python Server Socket or ID of a server that was auto restarted
 */
const sendServerStatusNotifications = async (serversOrId: TSendServerStatusNotifications[] | number) => {
  // Get servers from the database
  const storedServers = await prisma.server.findMany();

  const { red, green } = colors;
  const embeds = [];

  // Server status notification or auto restart notification
  if (typeof serversOrId !== 'number') {
    for (const server of serversOrId) {
      try {
        // Get server by ID
        const serverData = storedServers.find((entry) => entry.id === server.serverId);
        if (!serverData) continue;
        // Create a new embed
        const serverName = serverData.customName ?? serverData.mapName;
        const statusEmbed = new EmbedBuilder()
          .setColor(server.currentStatus === 'online' ? green : red)
          .setAuthor({
            name: `${serverName} (ARK: ${serverData.gameType})`,
            iconURL: randomAvatar(),
          })
          .setDescription(`**The server went ${server.currentStatus}**`)
          .setTimestamp();
        embeds.push(statusEmbed);
      } catch {}
    }
  } else {
    const serverData = storedServers.find((entry) => entry.id === serversOrId);
    if (!serverData) return;
    const serverName = serverData.customName ?? serverData.mapName;
    const statusEmbed = new EmbedBuilder()
      .setColor(green)
      .setAuthor({
        name: `${serverName} (ARK: ${serverData.gameType})`,
        iconURL: specialAvatar,
      })
      .setDescription('**The server has been automatically restarted and is now online.**')
      .setTimestamp();
    embeds.push(statusEmbed);
  }

  // If there is no error then send the notifications and update the widget
  if (embeds.length >= 1) {
    await broadcaster({
      widget: 'serverNotify',
      messageEmbeds: embeds,
    });
    await updateServerStatusWidget();
  }
  return;
};

export default sendServerStatusNotifications;
