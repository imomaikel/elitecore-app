// import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import MobileSidebar from '@/components/MobileSidebar';
import Navbar from '@/components/Navbar';
import ShoppingCart from '@/components/ShoppingCart';
import Sidebar from '@/components/Sidebar';
import { TRPCProvider } from '@/trpc/provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EliteCore - Dashboard',
  description:
    'EliteCore is dedicated to enhancing the gaming experience of ARK players, providing a comprehensive platform filled with resources, community interaction, and opportunities to bolster your in-game assets.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <div className="flex flex-col relative min-h-screen dark:bg-background bg-white/90">
        <div className="flex flex-grow flex-1">
          <Navbar />
          <MobileSidebar />
          <div className="flex relative flex-grow">
            <Sidebar />
            <div className="px-3 md:px-6 pt-[82px] pb-5 min-h-full">{children}</div>
          </div>
        </div>
        <Footer />
        <ShoppingCart />
      </div>
    </TRPCProvider>
  );
}
