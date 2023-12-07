import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/components/ui/hover-card';
import { FaCartPlus, FaCircleInfo } from 'react-icons/fa6';
import Image from 'next/image';
import { toast } from 'sonner';
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
  const addToCart = () => {
    toast.info('Added to the cart');
  };

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
              <Link className="underline" href={`/products/${productId}`}>
                More details
              </Link>
            </div>
          </HoverCardContent>
        </HoverCard>

        <FaCartPlus className="w-6 h-6 hover:text-primary transition-colors" onClick={addToCart} />
      </div>
    </div>
  );
};

export default ProductBox;
