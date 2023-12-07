'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar';
import { Separator } from '@/shared/components/ui/separator';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { Button } from '@/shared/components/ui/button';
import { GiHamburgerMenu } from 'react-icons/gi';
import { FiChevronsDown } from 'react-icons/fi';
import { useCart } from '@/hooks/use-cart';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

const Navbar = () => {
  const { onOpen: openMobileSidebar } = useMobileSidebar();
  const { onOpen: openShoppingCart } = useCart();
  const { setTheme } = useTheme();

  const updateCurrency = () => {
    toast.info('Currency updated');
  };

  return (
    <div className="w-full h-16 fixed right-0 top-0 z-10 bg-background shadow-sm dark:md:shadow-md dark:md:shadow-black/90">
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
                  {/* SSR */}
                  <div>imomaikel</div>
                  <FiChevronsDown className="w-6 h-6 md:mr-1 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary transition-all group-hover:text-primary" />
                  <Avatar className="w-8 h-8 hidden md:block">
                    <AvatarImage src="https://cdn.discordapp.com/embed/avatars/4xx.png" />
                    <AvatarFallback className="w-8 h-8 relative">
                      <Image src="https://cdn.discordapp.com/embed/avatars/3.png" alt="avatar" fill sizes="" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col">
                <div className="mb-1">Theme</div>
                <div className="flex space-x-2">
                  <Button variant="secondary" onClick={() => setTheme('dark')}>
                    Dark
                  </Button>
                  <Button variant="secondary" onClick={() => setTheme('light')}>
                    Light
                  </Button>
                  <Button variant="secondary" onClick={() => setTheme('system')}>
                    Auto
                  </Button>
                </div>
                <Separator className="my-2" />
                <div className="mb-1">Your currency</div>
                {/* TODO HOOK */}
                <Select onValueChange={updateCurrency}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <Separator className="my-2" />
                <Button variant="ghost">Log out</Button>
              </PopoverContent>
            </Popover>
            {/* SSR */}
            <div
              className="relative cursor-pointer transition-colors group after:content-[attr(data-cart-size)] data-[cart-size]:after:bg-primary after:text-center after:h-6 after:w-6 after:rounded-full after:absolute after:-top-3 after:-right-3"
              data-cart-size="2"
              onClick={openShoppingCart}
            >
              <MdOutlineShoppingCart className="w-7 h-7 md:ml-3 group-hover:text-primary" />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
