'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Separator } from '@/shared/components/ui/separator';
import ActionButton from '@/components/shared/ActionButton';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { redirect, useRouter } from 'next/navigation';
import { Input } from '@/shared/components/ui/input';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useCurrency } from '@/hooks/use-currency';
import { useDialog } from '@/hooks/use-dialog';
import { useTebex } from '@/hooks/use-tebex';
import { FaCartPlus } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { trpc } from '@/trpc';
import Link from 'next/link';

type TProductPage = {
  params: {
    productId: string;
  };
};
const ProductPage = ({ params }: TProductPage) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { onOpen: openDialog, setAuthUrl } = useDialog();
  const { addToBasket: clientAddToBasket } = useTebex();
  const [isMounted, setIsMounted] = useState(false);
  const [steamId, setSteamId] = useState('');
  const { formatPrice } = useCurrency();
  const { categoryList } = useTebex();
  const router = useRouter();

  const { productId } = params;
  const numberProductId = parseInt(productId);

  if (isNaN(numberProductId)) {
    redirect('/dashboard');
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const category =
    isMounted &&
    categoryList.filter((entry) => entry.packages.some((categoryPackage) => categoryPackage.id === numberProductId))[0];
  const product = isMounted && category && category.packages.find((entry) => entry.id === numberProductId);

  if (!product && isMounted) {
    redirect('/dashboard');
  }
  const { mutate: addToBasket, isLoading } = trpc.addToBasket.useMutation({
    onSuccess: (response) => {
      if (response.status === 'success') {
        const basket = response.data;
        if (typeof basket === 'object' && product) {
          const findProduct = basket.packages.find((entry) => entry.id === product.id);
          if (findProduct) {
            clientAddToBasket(findProduct);
            toast.success(`Added "${findProduct.name}" to the cart!`);
          }
        }
      } else if (response.message === 'Basket not authorized') {
        setAuthUrl(response.errorMessage as string);
        openDialog();
      } else {
        toast.error(`Something went wrong! ${response.errorMessage ?? response.message}`);
      }
    },
    onError: () => {
      toast.error('Something went wrong!');
    },
  });

  const { mutate: addAsGift, isLoading: isGiftLoading } = trpc.addAsGift.useMutation({
    onSuccess: (response) => {
      if (response.status === 'success') {
        const basket = response.data;
        if (typeof basket === 'object' && product) {
          const findProduct = basket.packages.find((entry) => entry.id === product.id);
          if (findProduct) {
            clientAddToBasket(findProduct);
            toast.success(`Added "${findProduct.name}" to the cart!`);
          }
        }
      } else if (response.message === 'Basket not authorized') {
        setAuthUrl(response.errorMessage as string);
        openDialog();
      } else {
        toast.error(`Something went wrong! ${response.errorMessage ?? response.message}`);
      }
    },
    onError: () => {
      toast.error('Something went wrong!');
    },
  });

  if (isMounted && product) {
    return (
      <>
        <div className="relative">
          <div className="flex flex-col lg:flex-row">
            <div className="w-64 h-64 relative mb-6 lg:mb-0">
              <Image alt="product" loading="eager" src={product.image ?? '/logo.png'} fill className="rounded-md" />
              <div className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 w-[75%] right-0 h-full absolute z-0 blur-[200px] opacity-75" />
            </div>
            <div className="flex flex-col lg:ml-4">
              <div className="flex items-center self-start">
                <h1 className="font-extrabold text-5xl tracking-wide cursor-default">{product.name}</h1>
                <div
                  className="items-center text-muted-foreground ml-4 opacity-50 hover:opacity-100 transition-opacity hover:underline cursor-pointer flex"
                  role="button"
                  onClick={() => router.back()}
                >
                  Go back
                  <IoArrowBackOutline className="ml-1" />
                </div>
              </div>
              <div className="mt-2 flex flex-col space-y-2">
                <div className="text-muted-foreground">({category.name})</div>
                <div className="flex flex-col">
                  <h2 className="font-bold text-xl">{formatPrice(product.total_price)}</h2>
                  <h3 className="text-muted-foreground text-lg">
                    {formatPrice(product.base_price)} + ({formatPrice(product.sales_tax)} sales tax)
                  </h3>
                </div>
                <div className="flex flex-col">
                  <Button
                    className="font-medium text-lg uppercase"
                    onClick={() => addToBasket({ productId: product.id })}
                    disabled={isLoading}
                  >
                    <FaCartPlus className="h-6 w-6 mr-2" /> Add to cart
                  </Button>
                </div>
                <div className="space-x-0 lg:space-x-3">
                  <Button className="uppercase" variant="ghost" asChild>
                    <Link href={`/dashboard/shop/category/${category.id}`}>Browse Similar</Link>
                  </Button>
                  <Button className="uppercase" variant="ghost" onClick={() => setIsDialogOpen(true)}>
                    Gift one-off package
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex my-4 items-center overflow-hidden">
              <div className="text-lg mr-2 tracking-wide font-medium">Description</div>
              <Separator />
            </div>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
          <div className="bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800 absolute w-[150px] h-[350px] right-28 rotate-45 z-0 blur-[200px] opacity-40 bottom-0" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gift a Package</DialogTitle>
              <DialogDescription>Enter the Steam ID of the player you want to surprise with a gift.</DialogDescription>
            </DialogHeader>
            <div>
              <Input placeholder="Steam ID" value={steamId} onChange={(e) => setSteamId(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <ActionButton
                onClick={() => addAsGift({ productId: product.id, giftForUserId: steamId })}
                disabled={isGiftLoading}
              >
                Add as a Gift
              </ActionButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  return (
    <div className="relative">
      <div className="flex flex-col lg:flex-row">
        <div className="w-64 h-64 relative mb-6 lg:mb-0">
          <Skeleton className="w-64 h-64 rounded-md" />
          <div className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 w-[75%] right-0 h-full absolute z-0 blur-[200px] opacity-75" />
        </div>
        <div className="flex flex-col lg:ml-4">
          <div className="flex items-center self-start">
            <Skeleton className="w-[500px] h-12 rounded-md" />
          </div>
          <div className="mt-2 flex flex-col space-y-2">
            <div className="text-muted-foreground">
              <Skeleton className="w-72 h-6 rounded-md" />
            </div>
            <div className="flex flex-col">
              <div className="font-bold text-xl">
                <Skeleton className="w-32 h-7 rounded-md" />
              </div>
              <div className="text-muted-foreground text-lg mt-2">
                <Skeleton className="w-60 h-7 rounded-md" />
              </div>
            </div>
            <div className="flex flex-col">
              <Skeleton className="w-full lg:w-[500px] h-9 rounded-md" />
            </div>
            <div className="space-x-0 lg:space-x-3 flex">
              <Skeleton className="w-36 h-9 rounded-md" />
              <Skeleton className="w-52 h-9 rounded-md" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex my-4 items-center overflow-hidden">
          <div className="text-lg mr-2 tracking-wide font-medium">
            <Skeleton className="w-[100px] h-7 rounded-md" />
          </div>
          <Separator />
        </div>
        <Skeleton className="w-[900px] h-8 rounded-md" />
        <Skeleton className="w-[600px] h-12 rounded-md" />
        <Skeleton className="w-[900px] h-8 rounded-md" />
        <Skeleton className="w-[400px] h-12 rounded-md" />
        <Skeleton className="w-[1200px] h-10 rounded-md" />
        <Skeleton className="w-[900px] h-8 rounded-md" />
      </div>
      <div className="bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800 absolute w-[150px] h-[350px] right-28 rotate-45 z-0 blur-[200px] opacity-40 bottom-0" />
    </div>
  );
};

export default ProductPage;
