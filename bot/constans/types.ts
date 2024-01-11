import { z } from 'zod';

export const API_BROADCAST_WIDGETS = z.enum(['serverStatusWidget', 'serverStatusNotify']);
export type TAPI_BROADCAST_WIDGETS = z.infer<typeof API_BROADCAST_WIDGETS>;

export const API_WIDGETS = z.enum(['ticketWidget']);
export type TAPI_WIDGETS = z.infer<typeof API_WIDGETS>;
