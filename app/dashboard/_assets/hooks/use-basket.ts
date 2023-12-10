'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Basket } from 'tebex_headless';

const WEBSTORE_IDENTIFIER = process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER;
const BASE_URL = process.env.NEXT_PUBLIC_TEBEX_BASE_URL;

export const useBasket = () => {
  const { data: session } = useSession();
  const [isBasketLoading, setIsBasketLoading] = useState(true);
  const [basketData, setBasketData] = useState<Basket | null>(null);

  useEffect(() => {
    if (!session?.user || !session.user.basketIdent || !isBasketLoading) return;

    const url = `${BASE_URL}/api/accounts/${WEBSTORE_IDENTIFIER}/baskets/${session.user.basketIdent}`;
    fetch(url, { method: 'GET' })
      .then((res) => res.json())
      .then((basket) => {
        setBasketData(basket.data);
        setIsBasketLoading(false);
      });
  }, [session, isBasketLoading]);

  return {
    isBasketLoading,
    basketData,
  };
};
