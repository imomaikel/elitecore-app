'use server';
import { TSocketNewMessage } from '@/shared/lib/utils';
import { getSession } from 'next-auth/react';
import { Socket } from 'socket.io';
import { io } from '.';

export const socketSetup = () => {
  io.on('connection', async (socket: Socket) => {
    const session = await getSession({ req: socket.request });
    if (!session || !session.user.lastViewedTicketId) {
      socket.disconnect();
      return;
    }

    socket.join(session.user.lastViewedTicketId);
  });
};

export const socketNewMessage = (data: TSocketNewMessage, ticketId: string) => io.to(ticketId).emit('newMessage', data);
