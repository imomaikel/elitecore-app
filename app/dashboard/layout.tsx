import { TRPCProvider } from './_assets/trpc/provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EliteCore - Dashboard',
  description:
    'EliteCore is dedicated to enhancing the gaming experience of ARK players, providing a comprehensive platform filled with resources, community interaction, and opportunities to bolster your in-game assets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <div>{children}</div>
    </TRPCProvider>
  );
}
