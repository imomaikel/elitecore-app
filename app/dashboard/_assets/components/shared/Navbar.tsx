'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useCurrencyStorage } from '@/hooks/use-currency';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { Button } from '@/shared/components/ui/button';
import { CURRENCIES, TCurrency } from '@/constans';
import { signIn, signOut } from 'next-auth/react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { FiChevronsDown } from 'react-icons/fi';
import { FaUserAltSlash } from 'react-icons/fa';
import { useSheet } from '@/hooks/use-sheet';
import { useTebex } from '@/hooks/use-tebex';
import SignInConfirm from './SignInConfirm';
import { useEffect, useState } from 'react';
import ActionDialog from './ActionDialog';
import Image from 'next/image';
import { toast } from 'sonner';
import { trpc } from '@/trpc';
import Link from 'next/link';

const Navbar = () => {
  const { setSelectedCurrency, selected, lastUpdatedAt, setCurrencies, setLastUpdated, currencies } =
    useCurrencyStorage();
  const { onOpen: openMobileSidebar } = useMobileSidebar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { onOpen: openShoppingCart } = useSheet();
  const { user, sessionStatus } = useCurrentUser();
  const { basket } = useTebex();

  const { mutate: refreshCurrencies } = trpc.getCurrencies.useMutation({
    onSuccess: (response) => {
      setCurrencies(response as TCurrency[]);
      setLastUpdated(new Date());
    },
  });

  useEffect(() => {
    let requestNewCurrencies = false;
    if (!lastUpdatedAt || !currencies || currencies.length <= 0) {
      requestNewCurrencies = true;
    } else {
      const minutesAfterUpdate = Math.round((new Date().getTime() - new Date(lastUpdatedAt).getTime()) / 60_000);
      if (minutesAfterUpdate >= 60 * 6) requestNewCurrencies = true;
    }

    if (requestNewCurrencies) refreshCurrencies();

    setIsMounted(true);
  }, []);

  const updateCurrency = (value: TCurrency['code']) => {
    toast.info('Currency updated');
    setSelectedCurrency(value);
  };

  const cartSize = basket?.packages.length ?? 0;

  return (
    <>
      <ActionDialog
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
        onClick={() => signIn('discord')}
        isOpen={isDialogOpen}
        title="Disclaimer"
        description={<SignInConfirm />}
      />
      <div className="w-full h-16 fixed right-0 top-0 z-20 bg-background shadow-sm md:shadow-black/90">
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
              <div className="flex items-center">
                <Image src="/logo.png" width={48} height={48} alt="logo" />
                <div className="font-extrabold text-2xl ml-2 transition-colors hover:text-primary">
                  <Link href="/dashboard">EliteCore</Link>
                </div>
              </div>
            </div>
            {/* Profile and cart */}
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger className="group">
                  <div className="flex items-center mr-2">
                    <div className="max-w-[200px] truncate hidden md:block">
                      {sessionStatus === 'loading' ? (
                        <Skeleton className="w-[100px] h-6" />
                      ) : (
                        user?.name ?? 'You are not logged in'
                      )}
                    </div>
                    <FiChevronsDown className="w-6 h-6 md:mr-1 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary transition-all group-hover:text-primary" />
                    <Avatar className="w-8 h-8 hidden md:block">
                      <AvatarImage src={user?.image || ''} />
                      <AvatarFallback className="w-8 h-8 relative">
                        {sessionStatus === 'unauthenticated' ? (
                          <FaUserAltSlash />
                        ) : (
                          <Image src="https://cdn.discordapp.com/embed/avatars/3.png" alt="avatar" fill sizes="" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col mr-2">
                  <div className="mb-1">Your currency</div>
                  <Select onValueChange={updateCurrency} value={selected}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Separator className="my-2" />
                  <div className="flex md:hidden flex-col">
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <div className="mb-1">Logged in as</div>
                        <div className="max-w-[200px] truncate">{user?.name}</div>
                      </div>
                      <div>
                        <Avatar className="w-11 h-11">
                          <AvatarImage src={user?.image ?? 'https://cdn.discordapp.com/embed/avatars/3.png'} />
                          <AvatarFallback className="w-11 h-11 relative">
                            <Image src="https://cdn.discordapp.com/embed/avatars/3.png" alt="avatar" fill sizes="" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                  {sessionStatus === 'authenticated' ? (
                    <Button variant="ghost" onClick={() => signOut()}>
                      Log out
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setIsDialogOpen(true)}>
                      Log in
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
              <div className="md:ml-3 mr-3 sm:mr-0 relative cursor-pointer group" onClick={openShoppingCart}>
                {isMounted && cartSize >= 1 && (
                  <div className="w-6 h-6 absolute bg-primary rounded-full -top-3 -right-3 flex items-center justify-center">
                    {cartSize}
                  </div>
                )}
                <MdOutlineShoppingCart className="w-8 h-8 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
