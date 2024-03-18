import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { errorEmbed, successEmbed } from '../constans/embeds';
import { command } from '../utils/commands';
import { extraSigns } from '../constans';
import logger from '../scripts/logger';
import prisma from '../lib/prisma';

const cmd = new SlashCommandBuilder()
  .setName('add')
  .setDescription(`Add another Discord member related to your ticket ${extraSigns.star}`)
  .addUserOption((option) =>
    option.setName('user').setDescription('Be careful! This user will have access to your ticket.').setRequired(true),
  );

export default command(cmd, async (client, interaction) => {
  try {
    await interaction.deferReply();

    if (!interaction.guild?.id || !interaction.channel?.id) {
      await interaction.editReply({ embeds: [errorEmbed('You can not use this command here!')] });
      return;
    }

    const channel = client.guilds.cache.get(interaction.guild.id)?.channels.cache.get(interaction.channel.id);

    if (!channel?.id || !channel.isTextBased()) {
      await interaction.editReply({ embeds: [errorEmbed('You can not use this command here!')] });
      return;
    }

    const ticket = await prisma.ticket.findUnique({
      where: { channelId: channel.id },
      include: {
        TicketCategory: {
          include: {
            supportRoles: true,
          },
        },
      },
    });

    if (!ticket?.id) {
      await interaction.editReply({ embeds: [errorEmbed('You can not use this command here!')] });
      return;
    }

    const user = interaction.options.getUser('user');

    if (!user?.id) {
      await interaction.editReply({ embeds: [errorEmbed('Could not find the user.')] });
      return;
    }

    const isAuthor = ticket.authorDiscordId === interaction.user.id;

    const supportRoles = ticket.TicketCategory?.supportRoles.map(({ roleId }) => roleId);
    const memberRoles = (await client.guilds.cache.get(interaction.guild.id)?.members.fetch(interaction.user.id))
      ?.roles;
    const isSupporter = memberRoles?.cache.some((role) => supportRoles?.includes(role.id));

    if (!(isAuthor || isSupporter)) {
      await interaction.editReply({ embeds: [errorEmbed('You are not allowed to add other members.')] });
      return;
    }

    await channel
      .edit({
        permissionOverwrites: [
          { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ],
      })
      .then(
        async () =>
          await interaction.editReply({
            embeds: [successEmbed(`Added ${user.toString()} to this ticket! :white_check_mark:`)],
          }),
      )
      .catch(async () => await interaction.editReply({ embeds: [errorEmbed('Something went wrong!')] }));
  } catch (error) {
    logger({
      type: 'error',
      message: 'Command error',
      data: error,
      file: 'add',
    });
  }
});
