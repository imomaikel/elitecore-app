import { z } from 'zod';

export const API_CHANNEL_ACTIONS_LIST = z.enum(['serverStatusWidget', 'serverStatusNotify', 'ticketWidget']);
