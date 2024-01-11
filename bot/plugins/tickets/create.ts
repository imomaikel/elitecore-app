import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import prisma from '../../lib/prisma';
import { client } from '../../client';

type TCreateTicket = {
  categoryId: string;
  userId: string;
  guildId: string;
  interaction?: ButtonInteraction | ModalSubmitInteraction;
};
export const _createTicket = async ({ categoryId, guildId, userId, mode, interaction }: TCreateTicket) => {
  if (!client.user?.id) return { error: true, message: 'Internal server error' };

  const [user, guildData] = await Promise.all([
    client.users.fetch(userId),
    prisma.guild.findUnique({
      where: { guildId },
      include: {
        ticketCategories: {
          include: {
            tickets: {
              where: {
                AND: [
                  { authorDiscordId: userId },
                  {
                    closedAt: {
                      equals: null,
                    },
                  },
                ],
              },
            },
          },
        },
      },
    }),
  ]);

  const category = guildData?.ticketCategories.find(({ id }) => id === categoryId);

  if (!user?.id || !guildData?.id || !category) {
    return { error: true, message: 'Bad request' };
  }

  const { createConfirmation: _createConfirmation, limit } = category;

  const createConfirmation = _createConfirmation && _createConfirmation?.length >= 4 ? _createConfirmation : false;

  if (createConfirmation && interaction instanceof ButtonInteraction) {
    const modal = new ModalBuilder()
      .setTitle('Confirmation')
      .setCustomId(`${client.user.id}|ticket:confirm-${categoryId}`);
    const confirmInput = new TextInputBuilder()
      .setCustomId(`${client.user.id}|ticket:modal-${category.id}`)
      .setLabel('Type "yes" to confirm and create a ticket')
      .setPlaceholder(createConfirmation)
      .setMinLength(3)
      .setMaxLength(3)
      .setStyle(TextInputStyle.Paragraph);
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(confirmInput);

    modal.addComponents(row);

    await interaction.showModal(modal);
    return { success: true, message: 'Modal opened' };
  }

  const userOpenedTickets = category.tickets.length;
  if (userOpenedTickets + 1 > limit) {
    return {
      error: true,
      message: `You have reached your ticket limit! Close the previous ticket${
        userOpenedTickets >= 2 ? '(s)' : ''
      } to open a new one.`,
    };
  }

  // Create a ticket
};
