import { BasketPackage, Package } from 'tebex_headless';
import { BsFillCartDashFill } from 'react-icons/bs';
import { useTebex } from '@/hooks/use-tebex';
import { ImSpinner9 } from 'react-icons/im';
import Image from 'next/image';
import { toast } from 'sonner';
import { trpc } from '@/trpc';
import { useCurrency } from '@/hooks/use-currency';

type TCartItem = {
  productItem: Package | undefined;
  basketItem: BasketPackage;
};
const CartItem = ({ basketItem, productItem }: TCartItem) => {
  const { removeFromBasket: clientRemoveFromBasket } = useTebex();
  const { formatPrice } = useCurrency();
  const image = productItem?.image ?? '/logo.png';

  const { mutate: removeFromBasket, isLoading } = trpc.removeFromBasket.useMutation({
    onSuccess: (data) => {
      if (data.status === 'success') {
        clientRemoveFromBasket(basketItem.id);
        toast.success(`Removed "${basketItem.name}" from the cart!`);
      } else {
        toast.error(`Something went wrong! ${data.extraMessage ?? data.message}`);
      }
    },
    onError: () => {
      toast.error('Something went wrong!');
    },
  });

  return (
    <div className="my-6 group hover:bg-muted-foreground/25 rounded-md transition-colors flex relative">
      <div className="h-16 w-16">
        {isLoading ? (
          <ImSpinner9 className="h-full w-full animate-spin p-4" />
        ) : (
          <Image
            src={image}
            width={64}
            height={64}
            alt="product"
            className="h-16 w-16 object-cover object-center rounded-tl-md rounded-bl-md"
          />
        )}
      </div>
      <div className="w-[calc(100%-64px)] flex flex-col justify-between max-h-16">
        <div className="text-xl font-bold tracking-wide truncate px-2 group-hover:text-primary transition-colors">
          {basketItem.name}
        </div>
        <div className="px-2 flex justify-between items-center pb-2">
          {/* TODO: PRICE HOOK */}
          <div className="flex">
            <div className="w-24 font-semibold">{formatPrice(basketItem.in_basket.price)}</div>
            <div className="">x{basketItem.in_basket.quantity}</div>
          </div>
          <div>
            <BsFillCartDashFill
              className="h-6 w-6 cursor-pointer hover:text-primary transition-colors opacity-70"
              onClick={() => {
                if (!isLoading) {
                  removeFromBasket({ productId: basketItem.id });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
