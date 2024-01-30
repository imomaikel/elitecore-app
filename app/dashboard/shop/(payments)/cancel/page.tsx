'use client';
import CheckoutButton from '@/components/shared/CheckoutButton';
import PageWrapper from '@/components/shared/PageWrapper';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

const PaymentCancelledPage = () => {
  return (
    <PageWrapper pageName="Payment" title="Cancelled">
      <div className="max-w-md tracking-wide text-justify text-lg">
        <p>
          We regret to inform you that your payment has been cancelled. Please feel free to try again or explore our
          shop for other options.
        </p>
        <div className="flex flex-col space-y-3 mt-3">
          <CheckoutButton label="Try again" />
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
