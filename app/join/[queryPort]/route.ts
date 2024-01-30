import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

const handler = (req: NextRequest, { params }: { params: { queryPort: string } }) => {
  return redirect(`steam://connect/join.elitecore.nl:${params.queryPort}`);
};

export { handler as GET };
