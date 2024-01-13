import { ButtonInteraction, ModalSubmitInteraction, hyperlink } from 'discord.js';
import { errorEmbed, successEmbed } from '../../constans/embeds';
import logger from '../../scripts/logger';
import prisma from '../../lib/prisma';
import { createTicket } from '.';

export const _ticketInteraction = async (interaction: ButtonInteraction | ModalSubmitInteraction) => {
  try {
    const input = interaction.customId.split(':')[1].split('-');
    const [action, id] = [...input];

    if (!interaction.guild?.id) return;

    if (action === 'create' || action === 'confirm') {
      // Check if confirmation is needed
      const confirmation = !!(
        await prisma.ticketCategory.findUnique({
          where: { id },
          select: { createConfirmation: true },
        })
      )?.createConfirmation;

      if (!confirmation) await interaction.deferReply({ ephemeral: true });
      if (interaction instanceof ModalSubmitInteraction) {
        const modalInput = interaction.fields.fields.first()?.value;
        const fixFormat = modalInput?.replace(/ /gi, '').toLowerCase();

        if (!(fixFormat?.includes('yes') && !fixFormat.includes('no'))) {
          await interaction.reply({
            embeds: [errorEmbed('You didn\'t type "yes" in the modal so the ticket creation has been canceled.')],
          });
          return;
        } else {
          await interaction.deferReply({ ephemeral: true });
        }
      }

      const { status, details } = await createTicket({
        categoryId: id,
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        interaction,
      });
      const message = details?.message as string;
      if (status === 'success') {
        if (message === 'Ticket created' && details) {
          const inviteLink = details.data!.inviteLink as string;
          await interaction.editReply({
            embeds: [successEmbed(`**Your ticket is ready!** ${hyperlink('Click', inviteLink)} to open.`)],
          });
        }
      } else if (status === 'error') {
        await interaction.editReply({ embeds: [errorEmbed(message)] });
      }
    }
  } catch (error) {
    logger({
      message: 'Ticket Error',
      type: 'error',
      data: JSON.stringify(error),
      file: 'tickets/interaction.ts',
    });
  }
};
