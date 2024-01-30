'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { errorToast } from '@/shared/lib/utils';
import { useTebex } from '@/hooks/use-tebex';
import ActionDialog from './ActionDialog';
import { useState } from 'react';
import { trpc } from '@/trpc';
import Link from 'next/link';

type TCheckoutButton = {
  className?: string;
  onClick?: () => void;
  label?: string;
};
const CheckoutButton = ({ className, onClick, label }: TCheckoutButton) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, sessionStatus } = useCurrentUser();
  const pathname = usePathname();
  const { authUrl } = useTebex();
  const router = useRouter();

  const { mutate: createBasket, isLoading } = trpc.createBasket.useMutation();

  const onCreate = () => {
    createBasket(
      {
        path: pathname,
      },
      {
        onSuccess: ({ error, message, success, url }) => {
          if (error) {
            errorToast(message);
            return;
          } else if (success) {
            router.push(url);
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  if (sessionStatus !== 'authenticated') {
    return (
      <Button className={className} onClick={onClick}>
        Login to proceed
      </Button>
    );
  }

  if (!user?.basketIdent) {
    return (
      <>
        <ActionDialog
          onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
          onProceed={() => router.push(authUrl)}
          isOpen={isDialogOpen}
          title="Authentication needed!"
          description='Please click "Continue" to link your Steam account with your basket so we know where to send the package after purchase.'
        />
        <Button className={className} onClick={onCreate} disabled={isLoading}>
          Authorize to proceed
        </Button>
      </>
    );
  }

  return (
    <Button asChild className={className}>
      <Link href={`https://checkout.tebex.io/checkout/${user.basketIdent}`}>
        {label ?? 'CHECKOUT'} <FaExternalLinkAlt className="h-4 w-4 ml-2" />
      </Link>
    </Button>
  );
};

export default CheckoutButton;
