import prisma from '../../_shared/lib/prisma';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

const handler = async (req: NextRequest, { params: { queryPort } }: { params: { queryPort: string } }) => {
  const config = await prisma.config.findFirst();
  const ipAddr = config?.ipAddress;

  return redirect(`steam://run/346110//+connect%20${ipAddr}:${queryPort}`);
};

export { handler as GET };
