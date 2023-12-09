'use client';
import { Button } from '@/shared/components/ui/button';
import { signIn } from 'next-auth/react';

export default function Home() {
  return (
    <div>
      Home
      <Button
        onClick={() =>
          signIn('discord', {
            redirect: true,
            callbackUrl: '/dashboard',
          }).catch(() => {})
        }
      >
        Login
      </Button>
    </div>
  );
}
