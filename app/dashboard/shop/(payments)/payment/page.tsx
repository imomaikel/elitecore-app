'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useCurrency, useCurrencyStorage } from '@/hooks/use-currency';
import { errorToast, relativeDate } from '@/shared/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/shared/components/ui/separator';
import ProductBox from '@/components/shared/ProductBox';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { ClimbingBoxLoader } from 'react-spinners';
import { HiStatusOnline } from 'react-icons/hi';
import ItemWrapper from '@/admin/ItemWrapper';
import { useTebex } from '@/hooks/use-tebex';
import { CURRENCIES } from '@/constans';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { trpc } from '@/trpc';
import Link from 'next/link';

const AfterPaymentPage = () => {
  const { setSelectedCurrency, selected: selectedCurrency } = useCurrencyStorage();
  const { categoryList, getCategoryList } = useTebex();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const transactionId = searchParams.get('txn-id');

  useEffect(() => {
    if (!transactionId) {
      errorToast('Missing transaction id!');
      router.replace('/dashboard');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const { data, isLoading: isFetching } = trpc.getPayment.useQuery(
    { transactionId: transactionId as string },
    {
      enabled: !!transactionId,
      refetchOnWindowFocus: false,
      refetchInterval: (payment) => (payment ? false : 1000),
    },
  );

  useEffect(() => {
    if (!data?.priceCurrency) return;
    if (selectedCurrency !== data.priceCurrency) {
      if (CURRENCIES.find((entry) => entry === data.priceCurrency)) {
        setSelectedCurrency(data.priceCurrency as (typeof CURRENCIES)[number]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedCurrency]);

  const isLoading = isFetching || !data;
  if (isLoading) return <AfterPaymentPage.Loading transactionId={transactionId ?? null} />;

  const filteredCategory = getCategoryList();
  const randomCategoryId = filteredCategory[Math.floor(Math.random() * filteredCategory.length)].id;

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      viewport={{
        once: true,
      }}
    >
      <div className="flex flex-col lg:flex-row max-w-2xl w-full rounded-lg bg-background/50 ring-muted/50 ring-1">
        <div className="flex flex-1 flex-col p-4 space-y-1.5">
          <div className="flex items-center h-min space-x-2">
            <div className="text-xl">Order status</div>
            <div>
              <Badge>{data.status}</Badge>
            </div>
          </div>
          <div className="flex items-center h-min space-x-2">
            <div className="text-xl">Order ID</div>
            <div>
              <Badge
                onClick={() => {
                  navigator.clipboard.writeText(data.transactionId);
                  toast.info('Copied to the clipboard!');
                }}
                className="cursor-pointer"
              >
                {data.transactionId}
              </Badge>
            </div>
          </div>
          <div>
            <div className="flex items-center mr-6">
              <div>Price</div>
              <div className="h-[1px] bg-primary/40 flex flex-1 mx-4" />
              <div>{formatPrice(data.priceAmount)}</div>
            </div>
            <div className="flex items-center mr-6">
              <div>Tax Fee</div>
              <div className="h-[1px] bg-primary/40 flex flex-1 mx-4" />
              <div>{formatPrice(data.taxFeeAmount)}</div>
            </div>
            <div className="flex items-center mr-6">
              <div>Gateway Fee</div>
              <div className="h-[1px] bg-primary/40 flex flex-1 mx-4" />
              <div>{formatPrice(data.gatewayFeeAmount)}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="tracking-wider">Bought by</div>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={data.user.image ?? undefined} alt="avatar" />
                <AvatarFallback className="relative">
                  <Image src="https://cdn.discordapp.com/embed/avatars/3.png" alt="avatar" fill sizes="100vw" />
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-semibold">{data.user.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-normal">Payment confirmed</div>
            <div className="text-normal">{relativeDate(data.createdAt)}</div>
          </div>
          <div>
            <Button className="w-full mt-2" size="sm" asChild>
              <Link href={`/dashboard/shop/category/${randomCategoryId}`}>
                View more products
                <FaExternalLinkAlt className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <Image
            src="/bought.png"
            width={0}
            height={0}
            sizes="100vw"
            alt="order completed"
            className="object-cover object-center rounded-br-lg rounded-bl-lg lg:rounded-none lg:rounded-tr-lg lg:rounded-br-lg z-10 w-full h-auto lg:w-[325px] lg:h-[325px]"
          />
          <div className="absolute w-1/2 h-1/2 top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 bg-gradient-to-r from-fuchsia-500 via-red-600 to-orange-400 blur-[50px]" />
        </div>
      </div>
      <div className="mt-3 text-center max-w-2xl">
        <h1 className="text-xl font-semibold">
          Thank you for <span className="text-primary">completing</span> your payment and{' '}
          <span className="text-primary">choosing</span> our services
        </h1>
        <p className="text-sm text-muted-foreground">
          We <span className="text-primary">appreciate</span> your <span className="text-primary">trust</span> in us
        </p>
        <p className="text-muted-foreground text-xs">Check your email for more details on this transaction.</p>
      </div>
      <Separator className="mt-6" />
      <ItemWrapper title="Purchased products">
        <div className="flex flex-wrap gap-6">
          {data?.products.map((product) => {
            const exist = categoryList
              .flat()
              .some((entry) => entry.packages.some(({ id }) => id === product.productId));
            return (
              <ProductBox
                key={product.id}
                imageURL={product.image}
                name={product.productName}
                {...product}
                exist={exist}
              />
            );
          })}
        </div>
      </ItemWrapper>
    </motion.div>
  );
};

AfterPaymentPage.Loading = function ShowLoading({ transactionId }: { transactionId: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center mt-6">
      <div className="relative">
        <h1 className="font-bold text-3xl lg:text-6xl capitalize inline-block bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent">
          Your order is on its way
        </h1>
        <div className="absolute -right-3 -top-3 opacity-50">
          <HiStatusOnline className="h-8 w-8 animate-pulse duration-500" />
        </div>
      </div>
      <ClimbingBoxLoader color="#ea580c" size={25} className="mt-12 relative z-0" />
      <p className="text-muted-foreground text-xs mt-8 relative z-10">
        If loading takes more than a minute, check your email
      </p>
      {transactionId && (
        <div className="flex space-x-2 items-center mt-2">
          <p className="text-muted-foreground text-sm">Transaction ID</p>
          <div className="relative flex flex-col justify-center">
            <Badge
              onClick={() => {
                navigator.clipboard.writeText(transactionId);
                toast.info('Copied to the clipboard!');
              }}
              className="cursor-pointer relative z-10"
            >
              {transactionId}
            </Badge>
            <p className="text-muted-foreground text-xs absolute -bottom-5 w-full text-center">Click to copy</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AfterPaymentPage;
