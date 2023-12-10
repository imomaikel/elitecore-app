'use client';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/components/ui/hover-card';
import { FaCartPlus, FaCircleInfo } from 'react-icons/fa6';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from 'sonner';
import Image from 'next/image';
import { trpc } from '@/trpc';
import Link from 'next/link';

type TProductBox = {
  description: string;
  productId: number;
  basePrice: number;
  imageURL: string;
  name: string;
};
const ProductBox = ({ basePrice, description, imageURL, name, productId }: TProductBox) => {
  // TODO
  const { mutate: addToBasket } = trpc.addToBasket.useMutation({
    onSuccess: (response) => {
      if (response.status === 'success') {
        const basket = response.extraMessage;
        console.log('basket:', basket);
      } else if (response.message === 'Basket not authorized') {
        console.log('not authorized', response.extraMessage);
      } else {
        toast.error(`Something went wrong! ${response.extraMessage ?? response.message}`);
      }
    },
    onError: () => {
      toast.error('Something went wrong!');
    },
  });

  return (
    <div className="w-[175px] shadows-lg p-2 rounded-md space-y-2 group">
      <Image alt="product" src={imageURL} width={175} height={175} />
      <div className="font-bold">{name}</div>
      <div className="text-muted-foreground flex justify-between items-center px-1">
        {/* TODO PRICE HOOK */}
        <span className="group-hover:text-primary transition-colors">{basePrice} EUR</span>

        <HoverCard openDelay={200} closeDelay={200}>
          <HoverCardTrigger>
            <FaCircleInfo className="w-6 h-6 hover:text-primary transition-colors" />
          </HoverCardTrigger>
          <HoverCardContent>
            <div>
              <div>{description}</div>
              {/* TODO LINK */}
              <Link className="underline" href={`/dashboard/shop/${productId}`}>
                More details
              </Link>
            </div>
          </HoverCardContent>
        </HoverCard>

        <FaCartPlus
          className="w-6 h-6 hover:text-primary transition-colors"
          onClick={() => addToBasket({ productId })}
        />
      </div>
    </div>
  );
};

// TODO
ProductBox.Skeleton = function ShowSkeleton() {
  return <Skeleton className="w-[175px] h-[239px] shadows-lg p-2 rounded-md space-y-2 group"></Skeleton>;
};
export default ProductBox;
