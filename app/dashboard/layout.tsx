import MobileSidebar from '@/components/shared/MobileSidebar';
import ShoppingCart from '@/components/shared/ShoppingCart';
import ActionDialog from '@/components/shared/ActionDialog';
import Sidebar from '@/components/shared/Sidebar';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
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
      <div className="flex flex-col relative min-h-screen">
        <div className="flex flex-grow flex-1">
          <Navbar />
          <MobileSidebar />
          <div className="flex relative flex-grow">
            <Sidebar className="min-w-[310px] max-w-[310px]" />
            <div className="px-3 md:px-6 pt-[82px] pb-5 min-h-full w-full">{children}</div>
          </div>
        </div>
        <Footer />
        <ShoppingCart />
        <ActionDialog />
      </div>
    </TRPCProvider>
  );
}
