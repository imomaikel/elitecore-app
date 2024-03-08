import { EmbedBuilder, type StringSelectMenuInteraction } from 'discord.js';
import { colors, gifs, specialAvatar } from '../../constans';
import updateServerStatusWidget from '../server-status';
import { hasPermissionToControl } from './permissions';
import { errorEmbed } from '../../constans/embeds';
import { fetchRequest } from '../../helpers/api';
import { updateServerControlWidget } from '.';
import { ACTIONS } from './serverSelection';
import { clientStates } from '../../client';
import serverControlLog from './logs';
import prisma from '../../lib/prisma';

type TSelectionHandler = {
  interaction: StringSelectMenuInteraction;
};
/**
 * Handle the user selection menu choice
 */
export const serverControlSelectionHandler = async ({ interaction }: TSelectionHandler) => {
  try {
    if (!interaction.guild?.id) return;
    const commandAction = interaction.customId.split('|')[1];
    if (!commandAction) return;

    const args = commandAction.split(':');
    const command = args[0];

    const guildData = await prisma.guild.findFirst({
      where: {
        guildId: interaction.guild.id,
      },
    });

    const hasPermission = await hasPermissionToControl({
      guildData,
      interaction,
    });
    if (!hasPermission) return;

    if (command === 'server-control') {
      const action = args[1];
      if (!ACTIONS.includes(action)) return;
      clientStates.lastSelectionPicked = true;
      clientStates.usingServerControl = true;

      const value = interaction.values[0];
      // Check if the user wants to control one server or all of them
      const serverId = value === 'all' ? 'all' : parseInt(value);

      // Delete the selection menu to prevent multiple choices
      await interaction.message.delete().catch(() => {});

      // Create an embed
      const loadingEmbed = new EmbedBuilder()
        .setColor(colors.purple)
        .setImage(gifs.loadingWithTextUrl)
        .setDescription('**Please wait...**')
        .setFooter({
          text: `${interaction.user.username} took the action`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.reply({
        embeds: [loadingEmbed],
      });
      // Execute the action through the socket
      const data = await fetchRequest(action as 'start' | 'stop' | 'restart', {
        serverId: serverId,
      });
      if (!data) {
        clientStates.usingServerControl = false;
        await interaction.editReply({
          embeds: [errorEmbed('Something went wrong. Please try again.')],
        });
        return;
      }
      // Show the results
      const responseEmbed = new EmbedBuilder()
        .setColor(colors.purple)
        .setFooter({
          text: `${interaction.user.username} took the action`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setAuthor({
          name: 'Your result',
          iconURL: specialAvatar,
        });
      const storedServers = await prisma.server.findMany({ where: { serverName: { equals: 'EliteCore' } } });
      for (const server of data) {
        const serverDetails = storedServers.find((entry) => entry.id === server.serverId);
        if (!serverDetails) continue;
        const serverName = serverDetails.customName ?? serverDetails.mapName;
        responseEmbed.addFields({
          name: `:map: ${serverName} (ARK: ${serverDetails.gameType})`,
          value: server.status === 'success' ? ':green_circle: Success' : ':red_circle: Fail',
          inline: true,
        });
      }
      await interaction
        .editReply({
          content: undefined,
          embeds: [responseEmbed],
        })
        .then((reply) => {
          setTimeout(() => {
            reply.delete().catch(() => {});
          }, 25_000);
        });

      // Update all of the server-control and server-status widgets to show the updated statuses, create the action log
      updateServerControlWidget();
      updateServerStatusWidget();
      serverControlLog({
        action,
        restartedBy: interaction.user,
        serversOrId: data,
      });
      clientStates.usingServerControl = false;
      return;
    }
  } catch (error) {
    clientStates.usingServerControl = false;
    updateServerControlWidget();
    if (interaction.isStringSelectMenu() && interaction.deferred) {
      await interaction.deleteReply().catch(() => {});
    }
  }
};

export default serverControlSelectionHandler;
