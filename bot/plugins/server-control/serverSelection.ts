import { ActionRowBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';
import { StringSelectMenuBuilder } from 'discord.js';
import { client, clientStates } from '../../client';
import type { ButtonInteraction } from 'discord.js';
import { errorEmbed } from '../../constans/embeds';
import { fetchRequest } from '../../helpers/api';
import prisma from '../../lib/prisma';

export const ACTIONS = ['start', 'stop', 'restart'];
type TServerSelection = {
  action: string;
  interaction: ButtonInteraction;
};
/**
 * Show all possible servers depending on the action
 */
export const serverSelection = async ({ action, interaction }: TServerSelection) => {
  const [statuses, storedServers] = await Promise.all([fetchRequest('getStatuses'), prisma.servers.findMany()]);
  if (!statuses) {
    await interaction.editReply({
      embeds: [errorEmbed('Something went wrong. Please try again')],
    });
    clientStates.usingServerControl = false;
    return;
  }
  const searchForStatus = action === 'stop' || action === 'restart' ? 'online' : 'offline';
  const possibleServers = statuses.filter((server) => server.currentStatus === searchForStatus);
  if (possibleServers.length == 0) {
    await interaction
      .editReply({
        embeds: [errorEmbed(`There are no servers to ${action}`)],
      })
      .then((reply) => {
        setTimeout(() => {
          reply.delete().catch(() => {});
        }, 15_000);
      });
    clientStates.usingServerControl = false;
    return;
  }
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`${client.user?.id}|server-control:${action}`)
    .setPlaceholder('Please select a server');
  const options = [];
  for (const status of possibleServers) {
    const serverDetails = storedServers.find((server) => server.id === status.serverId);
    if (!serverDetails) continue;
    const serverName = `${serverDetails.mapName} ${serverDetails.customName ? `(${serverDetails.customName})` : ''}`;
    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(serverName)
        .setDescription(`${serverDetails.gameType} ${serverDetails.gameMode}`)
        .setValue(status.serverId.toString()),
    );
  }
  if (options.length >= 2) {
    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel('All servers')
        .setDescription('Start all of the servers')
        .setValue('all'),
    );
  }

  selectMenu.addOptions(...options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  clientStates.lastSelectionPicked = false;
  await interaction
    .editReply({
      components: [row],
      content: `Please select a server to ${action}`,
    })
    .then((reply) => {
      setTimeout(() => {
        reply.delete().catch(() => {});
        if (!clientStates.lastSelectionPicked) {
          clientStates.usingServerControl = false;
        }
      }, 25_000);
    });
  return;
};
