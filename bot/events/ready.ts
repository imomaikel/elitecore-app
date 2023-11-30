import { event } from '../utils/events';

// Wait for client to start
export default event('ready', async (client) => {
    console.log(`Discord client started. (${client.user?.username})`);
});
