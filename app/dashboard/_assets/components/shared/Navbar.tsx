'use client';
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar';
import { importantNotification } from '@/shared/lib/utils';
import { GiHamburgerMenu } from 'react-icons/gi';
import { usePathname } from 'next/navigation';
import SignInConfirm from './SignInConfirm';
import ActionDialog from './ActionDialog';
import UserSettings from './UserSettings';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const { onOpen: openMobileSidebar } = useMobileSidebar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const pathname = usePathname();

  const notify = importantNotification(pathname);

  return (
    <>
      <ActionDialog
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
        onProceed={() => signIn('discord')}
        isOpen={isDialogOpen}
        title="Disclaimer"
        description={<SignInConfirm />}
      />
      <div className="w-full h-16 fixed right-0 top-0 z-20 shadow-sm md:shadow-black/90 bg-background/60 backdrop-blur-lg">
        <nav className="h-full">
          <div className="h-full px-3 lg:px-8 md:px-6 flex justify-between">
            <div className="flex">
              {/* Mobile button */}
              <div className="items-center h-full flex md:hidden mr-4">
                <div className="cursor-pointer" onClick={openMobileSidebar} role="button">
                  <GiHamburgerMenu className="w-6 h-6" />
                </div>
              </div>
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center group">
                <Image src="/logo.png" width={48} height={48} alt="logo" />
                <div className="font-extrabold text-2xl ml-2 relative">
                  <h1 className="tracking-wide">
                    {/* <h1 className="bg-gradient-to-r from-yellow-600 to-red-600 inline-block text-transparent bg-clip-text tracking-wide"> */}
                    EliteCore
                  </h1>
                  <div className="bg-gradient-to-r from-yellow-600 to-red-600 absolute w-1/2 h-full -z-10 inset-0 blur-[50px] rotate-45" />
                </div>
              </Link>
            </div>
            <div className="h-full items-center text-destructive hidden md:flex">{notify}</div>
            {/* Profile and cart */}
            <UserSettings setIsDialogOpen={() => setIsDialogOpen(true)} />
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
