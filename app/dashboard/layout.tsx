import MobileSidebar from '@/components/shared/MobileSidebar';
import ShoppingCart from '@/components/shared/ShoppingCart';
import SelectGame from '@/components/shared/SelectGame';
import Sidebar from '@/components/shared/Sidebar';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard | EliteCore',
    template: '%s | EliteCore',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col relative min-h-screen">
      <div className="flex flex-grow flex-1">
        <Navbar />
        <MobileSidebar />
        <div className="flex relative flex-grow">
          <Sidebar className="min-w-[310px] max-w-[310px]" />
          <div className="px-3 md:px-6 pt-[82px] pb-5 min-h-full w-full max-w-[1595px]">
            <div className="max-w-[1595px]">
              {children}
              <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 fixed w-[100px] h-[200px] rotate-45 left-0 md:left-[400px] top-0 blur-[150px] -z-10" />
              <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 fixed w-[100px] h-[200px] md:w-[200px] md:h-[600px] rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[225px] opacity-40 -z-10" />
              <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 fixed w-[300px] h-[100px] rotate-12 right-24 top-[400px] hidden md:block blur-[150px] -z-10" />
              <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 fixed w-[100px] h-[200px] rotate-45 bottom-0 right-0 blur-[150px] -z-10" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ShoppingCart />
      <SelectGame />
    </div>
  );
}
