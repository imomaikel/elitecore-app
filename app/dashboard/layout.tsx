// import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import MobileSidebar from '@/components/MobileSidebar';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EliteCore - Dashboard',
  description:
    'EliteCore is dedicated to enhancing the gaming experience of ARK players, providing a comprehensive platform filled with resources, community interaction, and opportunities to bolster your in-game assets.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col relative min-h-screen">
      <div className="flex flex-grow flex-1">
        <Navbar />
        <MobileSidebar />
        <div className="flex relative">
          <Sidebar />
          <div className="px-6 pt-[72px] pb-5 min-h-full">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
