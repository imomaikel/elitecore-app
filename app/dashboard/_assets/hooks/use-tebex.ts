import type { Basket, BasketPackage, Category } from 'tebex_headless';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

type TUseTebex = {
  categoryList: Category[] | [];
  setCategoryList: (categories: Category[] | []) => void;

  basket: undefined | Basket;
  setBasket: (basket: Basket) => void;

  addToBasket: (product: BasketPackage) => void;
  removeFromBasket: (productId: number) => void;

  authRedirectUrl: string;
  setAuthRedirectUrl: (path: string) => void;

  priceIncrease: (productId: number) => void;
  priceDecrease: (productId: number) => void;
};
export const useTebex = create<TUseTebex>()(
  persist(
    (set, get) => ({
      categoryList: [],
      setCategoryList: (data) => set(() => ({ categoryList: data })),

      basket: undefined,
      setBasket: (data) => set(() => ({ basket: data })),

      priceIncrease: (productId) => {
        const item = get()
          .categoryList.find((category) => category.packages.find((entry) => entry.id === productId))
          ?.packages.find((entry) => entry.id === productId);
        if (!item) return;
        set((state) => ({
          basket: state.basket
            ? {
                ...state.basket,
                total_price: state.basket.total_price + item.total_price,
                base_price: state.basket.base_price + item.base_price,
                sales_tax: state.basket.sales_tax + item.sales_tax,
              }
            : state.basket,
        }));
      },

      priceDecrease: (productId) => {
        const item = get()
          .categoryList.find((category) => category.packages.find((entry) => entry.id === productId))
          ?.packages.find((entry) => entry.id === productId);
        if (!item) return;
        set((state) => ({
          basket: state.basket
            ? {
                ...state.basket,
                total_price: state.basket.total_price - item.total_price,
                base_price: state.basket.base_price - item.base_price,
                sales_tax: state.basket.sales_tax - item.sales_tax,
              }
            : state.basket,
        }));
      },

      addToBasket: (item) => {
        get().priceIncrease(item.id);
        set((state) => ({
          basket: state.basket
            ? {
                ...state.basket,
                packages: state.basket.packages.find((entry) => entry.id === item.id)
                  ? state.basket.packages.map((entry) => {
                      if (entry.id === item.id) {
                        return {
                          ...entry,
                          in_basket: {
                            ...entry.in_basket,
                            quantity: entry.in_basket.quantity + 1,
                          },
                        };
                      } else {
                        return entry;
                      }
                    })
                  : [...state.basket.packages, item],
              }
            : state.basket,
        }));
      },

      removeFromBasket: (productId) => {
        get().priceDecrease(productId);
        set((state) => ({
          basket: state.basket
            ? {
                ...state.basket,
                packages: state.basket.packages.filter((entry) => entry.id !== productId),
              }
            : state.basket,
        }));
      },

      authRedirectUrl: '',
      setAuthRedirectUrl: (data) => set(() => ({ authRedirectUrl: data })),
    }),
    {
      name: 'tebex-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
