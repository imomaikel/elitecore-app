'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const BasketAuth = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get('success');
    if (!success) return;
    if (success === 'true') {
      toast.success('Authenticated!');
    } else {
      toast.error('Failed to authenticate!');
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.delete('success');
    router.replace(`${pathname}?${newParams}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname]);

  return null;
};

export default BasketAuth;
