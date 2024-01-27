'use client';
import PageWrapper from '@/components/shared/PageWrapper';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/shared/components/ui/button';
import { FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';

const PaymentCancelledPage = () => {
  const { user } = useCurrentUser();

  return (
    <PageWrapper pageName="Payment" title="Cancelled">
      <div className="max-w-md tracking-wide text-justify text-lg">
        <p>
          We regret to inform you that your payment has been cancelled. Please feel free to try again or explore our
          shop for other options.
        </p>
        <div className="flex flex-col space-y-3 mt-3">
          <Button asChild>
            <Link href={`https://checkout.tebex.io/checkout/${user?.basketIdent}`}>
              Try again
              <FaExternalLinkAlt className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <p className="text-muted-foreground text-sm">Having problems? Open a ticket</p>
          <Button asChild>
            <Link href="/dashboard/tickets/create">Open a ticket</Link>
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PaymentCancelledPage;
