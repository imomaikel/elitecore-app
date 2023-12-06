import { NextAuthProvider } from './_shared/providers/auth';
import { Montserrat } from 'next/font/google';
import type { Metadata } from 'next';
import './_shared/globals.css';
import { ThemeProvider } from './_shared/providers/theme';
import { cn } from './_shared/lib/utils';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EliteCore',
  description:
    'EliteCore is dedicated to enhancing the gaming experience of ARK players, providing a comprehensive platform filled with resources, community interaction, and opportunities to bolster your in-game assets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={cn('font-sans relative h-full', montserrat.className)}>
        <NextAuthProvider>
          <ThemeProvider defaultTheme="dark" attribute="class">
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
