import { time, EmbedBuilder, hyperlink } from 'discord.js';
import { colors, extraSigns, gifs } from '../../constans';
import { broadcaster } from '../../helpers/broadcaster';
import prisma from '../../lib/prisma';
import { updateBots } from './bots';

/**
 * Create server-status widget message embed for all servers and update message
 * @param updateOnlyOneGuildId If specified, the widget will be sent to only one guild, and the returned value will be more detailed
 */
const updateServerStatusWidget = async (updateOnlyOneGuildId: string | undefined = undefined) => {
  const [servers, config] = await Promise.all([
    prisma.server.findMany({
      where: {
        serverName: {
          equals: 'EliteCore',
        },
      },
    }),
    prisma.config.findFirst(),
  ]);

  const { zap } = extraSigns;
  const { pulseUrl } = gifs;
  const { green, red } = colors;

  // Create widget embed
  const embed = new EmbedBuilder()
    .setDescription(`Servers updated ${time(new Date(), 'R')}`)
    .setFooter({
      text: `${zap} Auto update every ${config?.serverStatusUpdateDelay} minutes.`,
    })
    .setThumbnail(pulseUrl);

  // Count online and offline servers
  const onlineServersLen = servers.filter((server) => server.lastStatus === 'online').length;
  const offlineServersLen = servers.filter((server) => server.lastStatus === 'offline').length;

  // Choose embed color depending on server status
  embed.setColor(onlineServersLen >= offlineServersLen ? green : red);

  // Sort by position
  servers.sort((a, b) => a.position - b.position);
  // Sort by status
  servers.sort((a, b) => b.lastStatus.localeCompare(a.lastStatus));

  // Add a field for each server
  for (const server of servers) {
    const serverName = server?.customName ?? server.mapName;
    const statusIcon = server.lastStatus === 'online' ? ':green_circle:' : ':red_circle:';
    const statusLabel = server.lastStatus === 'online' ? `Players: ${server.lastPlayers}` : 'Offline';

    const joinLink =
      server.gameType === 'Evolved'
        ? `:video_game: ${hyperlink(
            'Click',
            `${process.env.NEXT_PUBLIC_SERVER_URL}/join/${server.queryPort}`,
          )} to join\n`
        : '';

    embed.addFields({
      name: `:map: ${serverName} (ARK: ${server.gameType})`,
      value: `
                ${statusIcon} ${statusLabel}
                ${joinLink}:crossed_swords: ${server.gameMode}
                `,
      inline: true,
    });
  }

  // Statistics
  const totalPlayers = servers.reduce((total, server) => (total += server.lastPlayers), 0);
  embed.addFields({
    name: ':bar_chart: Statistics',
    value: `:family: Total players: ${totalPlayers}`,
    inline: false,
  });

  // Update bots presence
  updateBots(servers);

  return await broadcaster({
    widget: 'serverStatus',
    messageEmbeds: [embed],
    updateOnlyOneGuildId,
  });
};

export default updateServerStatusWidget;
