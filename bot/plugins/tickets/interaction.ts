import { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { errorEmbed } from '../../constans/embeds';
import { createTicket } from '.';

export const _ticketInteraction = async (interaction: ButtonInteraction | ModalSubmitInteraction) => {
  try {
    const input = interaction.customId.split(':')[1].split('-');
    const [action, id] = [...input];

    if (!interaction.guild?.id) return;

    if (action === 'create' || action === 'confirm') {
      if (interaction instanceof ModalSubmitInteraction) {
        const modalInput = interaction.fields.fields.first()?.value;
        const fixFormat = modalInput?.replace(/ /gi, '').toLowerCase();

        if (!(fixFormat?.includes('yes') && !fixFormat.includes('no'))) {
          await interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed('You didn\'t type "yes" in the modal so the ticket creation has been canceled.')],
          });
          return;
        }
      }

      const newTicket = await createTicket({
        categoryId: id,
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        interaction,
      });
      console.log(newTicket, 'response');
    }
  } catch (error) {
    console.log(error);
  }
};
