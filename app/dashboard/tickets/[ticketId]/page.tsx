'use server';
import authOptions from '../../../api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import prisma from '@/shared/lib/prisma';
import TicketPage from './Ticket';

const page = async ({ params }: { params: { ticketId: string } }) => {
  const session = await getServerSession(authOptions);
  if (session?.user.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastViewedTicketId: params.ticketId,
      },
    });
  }

  return <TicketPage />;
};

export default page;
