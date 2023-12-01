import serverControlSelectionHandler from '../plugins/server-control/selectionHandler';
import { serverControlButtonHandler } from '../plugins/server-control/buttonHandler';
import { event } from '../utils/events';

// Listen for a new interaction
export default event('interactionCreate', async (client, interaction) => {
    if (!client.user?.id || interaction.applicationId !== client.user.id) {
        return;
    }
    if (!interaction.guild?.id) return;

    // Handle button click
    if (interaction.isButton()) {
        const command = interaction.customId.split('|')[1];
        if (!command) return;
        if (command.startsWith('server')) {
            await serverControlButtonHandler({ interaction });
        }
        return;
    }

    // Handle select menu choice
    if (interaction.isStringSelectMenu()) {
        const command = interaction.customId.split('|')[1];
        if (!command) return;
        if (command.startsWith('server')) {
            await serverControlSelectionHandler({ interaction });
        }
        return;
    }
});
