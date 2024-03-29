import serverControlSelectionHandler from '../plugins/server-control/selectionHandler';
import { serverControlButtonHandler } from '../plugins/server-control/buttonHandler';
import { ticketInteraction, ticketSelectMap } from '../plugins/tickets';
import { event } from '../utils/events';
import commands from '../commands';

// Listen for a new interaction
export default event('interactionCreate', async (client, interaction) => {
  if (!client.user?.id || interaction.applicationId !== client.user.id) {
    return;
  }
  if (!interaction.guild?.id) return;

  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const commandName = interaction.commandName;
    const command = commands.find((cmd) => cmd.body.name === commandName);
    if (!command) return;
    await command.execute(client, interaction);
  }

  // Handle button click
  if (interaction.isButton()) {
    const command = interaction.customId.split('|')[1];
    if (!command) return;
    if (command.startsWith('server')) {
      await serverControlButtonHandler({ interaction });
    } else if (command.startsWith('ticket')) {
      await ticketInteraction(interaction);
    }
    return;
  }

  // Handle select menu choice
  if (interaction.isStringSelectMenu()) {
    const command = interaction.customId.split('|')[1];
    if (!command) return;
    if (command.startsWith('server')) {
      await serverControlSelectionHandler({ interaction });
    } else if (command.startsWith('ticket:map')) {
      await ticketSelectMap(interaction);
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    const command = interaction.fields.fields.first()?.customId.split('|')[1];
    if (!command) return;

    if (command.startsWith('ticket')) {
      await ticketInteraction(interaction);
    }
  }
});
