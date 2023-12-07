import { colors, extraSigns, specialAvatar } from '../constans';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { errorEmbed } from '../constans/embeds';
import { command } from '../utils/commands';
import rconCommand from '../plugins/rcon';
import logger from '../scripts/logger';
import prisma from '../lib/prisma';

const cmd = new SlashCommandBuilder()
  .setName('players')
  .setDescription(`Shows online players on each map ${extraSigns.star}`);

export default command(cmd, async (client, interaction) => {
  try {
    if (!client.user?.username || !interaction.guild?.id || !interaction.channel?.id) {
      return;
    }

    const guild = interaction.guild;
    const guildData = await prisma.guild.findFirst({
      where: {
        guildId: guild.id,
      },
    });

    if (!guildData?.playersCmdChannelId) {
      await interaction.reply({
        embeds: [errorEmbed('This server has no configured channel to use this command.')],
      });
      return;
    }
    const channel = client.channels.cache.get(guildData.playersCmdChannelId);
    if (guildData.playersCmdChannelId !== interaction.channel.id) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            channel?.id
              ? `This command can only be used in this channel <#${guildData.playersCmdChannelId}>`
              : 'This command can not be used here',
          ),
        ],
      });
      return;
    }

    const servers = await prisma.server.findMany();
    servers.sort((a, b) => a.gameType.localeCompare(b.gameType));

    const playersEmbed = new EmbedBuilder()
      .setColor(colors.purple)
      .setTimestamp()
      .setAuthor({ name: 'Our active players', iconURL: specialAvatar });
    let totalPlayers = 0;

    for await (const server of servers) {
      const serverName = server.customName ?? server.mapName;
      try {
        const getPlayers = await rconCommand({
          command: 'ListPlayers',
          serverId: server.id,
        });
        if (!getPlayers || getPlayers.startsWith('Server received')) {
          playersEmbed.addFields({
            name: `:map: ${serverName} (ARK: ${server.gameType})`,
            value: 'Something went wrong',
            inline: true,
          });
          continue;
        }
        if (getPlayers.startsWith('No players')) continue;
        const players = [];
        const rows = getPlayers.split('\n');
        for (let row of rows) {
          if (!(row.includes('.') && row.includes(','))) continue;
          row = row.substring(row.indexOf(' ') + 1, row.lastIndexOf(','));
          players.push(`» ${row.length >= 1 ? row : '(Unknown name)'}`);
          totalPlayers++;
        }
        playersEmbed.addFields({
          name: `:map: ${serverName} (ARK: ${server.gameType})`,
          value: players.join('\n'),
          inline: true,
        });
      } catch (err) {
        playersEmbed.addFields({
          name: `:map: ${serverName} (ARK: ${server.gameType})`,
          value: 'Something went wrong',
          inline: true,
        });
      }
    }

    if (totalPlayers > 0) {
      playersEmbed.setFooter({ text: `Total ${totalPlayers} players` });
    }

    await interaction.reply({
      embeds: [playersEmbed],
    });
  } catch (error) {
    logger({
      type: 'error',
      message: 'Command error',
      data: JSON.stringify(error),
      file: 'players',
    });
  }
});
