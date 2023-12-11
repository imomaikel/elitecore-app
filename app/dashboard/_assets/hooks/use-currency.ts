import { createJSONStorage, persist } from 'zustand/middleware';
import { LOCALE_CODES, TCurrency } from '@/constans';
import { useEffect, useState } from 'react';
import { create } from 'zustand';

type TUseCurrency = {
  selected: TCurrency['code'];
  currencies: TCurrency[] | [];
  lastUpdatedAt: Date | undefined;
  setCurrencies: (data: TCurrency[]) => void;
  setSelectedCurrency: (data: TCurrency['code']) => void;
  setLastUpdated: (data: Date) => void;
};

export const useCurrencyStorage = create<TUseCurrency>()(
  persist(
    (set) => ({
      currencies: [],
      selected: 'EUR',
      lastUpdatedAt: undefined,
      setCurrencies: (data) => set(() => ({ currencies: data })),
      setSelectedCurrency: (data) => set(() => ({ selected: data })),
      setLastUpdated: (data) => set(() => ({ lastUpdatedAt: data })),
    }),
    { name: 'currency-data', storage: createJSONStorage(() => localStorage) },
  ),
);

export const useCurrency = () => {
  const { selected, currencies } = useCurrencyStorage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const createFormat = (price: number, code: TCurrency['code']) => {
    return new Intl.NumberFormat(LOCALE_CODES.find((entry) => entry.code === code)?.locale ?? undefined, {
      style: 'currency',
      currency: code,
    }).format(price);
  };

  const formatPrice = (price: number) => {
    if (!isMounted) return;
    if (currencies.length <= 0 || selected === 'EUR') {
      return createFormat(price, 'EUR');
    }

    const rate = currencies.find((entry) => entry.code === selected)?.rate;
    if (!rate) return createFormat(price, 'EUR');

    return createFormat(price * rate, selected);
  };

  return {
    formatPrice,
  };
};
