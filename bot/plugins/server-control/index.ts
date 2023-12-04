import { colors, extraSigns, gifs, specialAvatar } from '../../constans';
import { broadcaster } from '../../helpers/broadcaster';
import { socketMessage } from '../../helpers/socket';
import prisma from '../../lib/prisma';
import { client } from '../../client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time } from 'discord.js';

/**
 * Create an embed with options to control the servers
 */
export const updateServerControlWidget = async (): Promise<boolean> => {
  // Get the data from the Python socket
  const data = await socketMessage({
    commandToSend: 'getStatuses',
    timeoutInSeconds: 5,
  });
  if (!data) return false;

  const [storedServers, config] = await Promise.all([prisma.servers.findMany(), prisma.config.findFirst()]);

  const onlineServers = data.filter((entry) => entry.currentStatus === 'online').length;
  const offlineServers = data.filter((entry) => entry.currentStatus === 'offline').length;

  const showStartButton = offlineServers >= 1;
  const showStopButton = onlineServers >= 1;

  const { star, zap } = extraSigns;

  // Generate buttons
  const buttons = [];
  if (showStartButton) {
    buttons.push(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel('START')
        .setCustomId(`${client.user?.id}|server-start`),
    );
  }
  if (showStopButton) {
    buttons.push(
      new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('STOP').setCustomId(`${client.user?.id}|server-stop`),
    );
    buttons.push(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel('RESTART')
        .setCustomId(`${client.user?.id}|server-restart`),
    );
  }
  buttons.push(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel('REFRESH')
      .setCustomId(`${client.user?.id}|server-refresh`),
  );

  // Create an embed
  const embed = new EmbedBuilder()
    .setColor(colors.purple)
    .setAuthor({
      iconURL: specialAvatar,
      name: 'EliteCore Server Manager',
    })
    .setDescription(`**Last update: ${time(new Date(), 'R')}**`)
    .setThumbnail(gifs.pulseUrl)
    .setFooter({
      text: `${star} Servers with a star have enabled auto restart option\n${zap} Auto update every ${config?.serverControlUpdateDelay} minutes.`,
    });

  // Append the buttons
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);

  // Display the current statuses
  for (const server of data) {
    const serverDetails = storedServers.find((entry) => entry.id === server.serverId);
    if (!serverDetails) continue;

    const serverName = serverDetails.customName ?? serverDetails.mapName;
    const isAutoRestartSign = serverDetails.autoRestart ? `${star} ` : ':map: ';

    embed.addFields({
      name: `${isAutoRestartSign} ${serverName} (ARK: ${serverDetails.gameType})`,
      value:
        server.currentStatus === 'online'
          ? `:green_circle: Online\n:crossed_swords: ${serverDetails.gameMode}\n:family: Player count: ${serverDetails.lastPlayers}`
          : `:red_circle: Offline\n:crossed_swords: ${serverDetails.gameMode}`,
      inline: true,
    });
  }

  // Update the widget at every guild
  await broadcaster({
    widget: 'serverControl',
    messageEmbeds: [embed],
    messageButtons: [row],
  });

  return true;
};
