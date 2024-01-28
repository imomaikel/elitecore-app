'use server';
import authOptions from '../../api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user.role || session.user.role !== 'ADMIN') {
    return redirect('/dashboard');
  }

  return <>{children}</>;
};

export default AdminLayout;
