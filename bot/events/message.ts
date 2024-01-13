import { ticketMessage } from '../plugins/tickets';
import { event } from '../utils/events';

// Listen for a new message
export default event('messageCreate', async (client, message) => {
  if (message.author.bot) return;

  if (message.channel.isTextBased()) {
    await ticketMessage(message);
  }
});
