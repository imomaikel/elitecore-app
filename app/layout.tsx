import { NextAuthProvider } from './_shared/providers/auth';
import { Montserrat } from 'next/font/google';
import type { Metadata } from 'next';
import './_shared/globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EliteCore',
  description:
    'EliteCore is dedicated to enhancing the gaming experience of ARK players, providing a comprehensive platform filled with resources, community interaction, and opportunities to bolster your in-game assets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
