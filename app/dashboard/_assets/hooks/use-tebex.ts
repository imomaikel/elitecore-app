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

  updatePrice: () => void;
};
export const useTebex = create<TUseTebex>()(
  persist(
    (set, get) => ({
      categoryList: [],
      setCategoryList: (data) => set(() => ({ categoryList: data })),

      basket: undefined,
      setBasket: (data) => set(() => ({ basket: data })),

      updatePrice: () => {
        const idsInBasket = get().basket?.packages.map((item) => item.id);
        const allProducts = get()
          .categoryList.map((category) => category.packages)
          .flat()
          .filter((item) => idsInBasket?.includes(item.id));
        const totalPrice = allProducts.reduce((acc, curr) => (acc += curr.total_price), 0);
        const basePrice = allProducts.reduce((acc, curr) => (acc += curr.base_price), 0);
        const salesTax = allProducts.reduce((acc, curr) => (acc += curr.sales_tax), 0);
        set((state) => ({
          basket: state.basket
            ? { ...state.basket, base_price: basePrice, total_price: totalPrice, sales_tax: salesTax }
            : state.basket,
        }));
      },

      addToBasket: (item) => {
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
