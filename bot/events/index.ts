import { Event } from '../utils/events';
import message from './message';
import ready from './ready';

// Export all events
export default [ready, message] as Event[];
