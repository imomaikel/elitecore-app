import channelDelete from './channelDelete';
import { Event } from '../utils/events';
import interaction from './interaction';
import message from './message';
import ready from './ready';

// Export all events
export default [ready, message, interaction, channelDelete] as Event[];
