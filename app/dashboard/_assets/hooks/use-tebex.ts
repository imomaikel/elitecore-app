import type { Basket, BasketPackage, Category } from 'tebex_headless';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

type TItem = 'ase' | 'asa' | 'all' | 'other' | 'always' | 'none';

type TUseTebex = {
  categoryList: (Category & { itemType: TItem })[] | [];
  setCategoryList: (categories: Category[] | []) => void;
  getCategoryList: () => Category[];

  showItemType: TItem;
  setShowItem: (type: TItem) => void;

  basket: Basket;
  setBasket: (basket: Basket) => void;

  addToBasket: (product: BasketPackage, setQuantity?: number) => void;
  removeFromBasket: (productId: number) => void;

  authRedirectUrl: string;
  setAuthRedirectUrl: (path: string) => void;

  updatePrice: () => void;

  applyGiftCard: (code: string) => void;
  removeGiftCard: (code: string) => void;

  authUrl: string;
  setAuthUrl: (url: string) => void;
};
export const useTebex = create<TUseTebex>()(
  persist(
    (set, get) => ({
      categoryList: [],
      setCategoryList: (data) => {
        set(() => ({
          categoryList: data.map((entry) => {
            const label = entry.name.toLowerCase();
            return {
              ...entry,
              itemType:
                label.startsWith('ase+ase') || label.startsWith('ase+asa')
                  ? 'always'
                  : label.startsWith('ase')
                  ? 'ase'
                  : label.startsWith('asa')
                  ? 'asa'
                  : 'other',
            };
          }),
        }));
      },

      showItemType: 'none',
      setShowItem: (type) =>
        set(() => ({
          showItemType: type,
        })),

      getCategoryList: () =>
        get().categoryList.filter(
          (category) =>
            category.itemType === get().showItemType ||
            get().showItemType === 'all' ||
            (category.itemType === 'always' && get().showItemType !== 'none'),
        ),

      basket: {
        ident: '',
        complete: false,
        id: 0,
        country: '',
        ip: '',
        username_id: null,
        username: null,
        cancel_url: '',
        complete_url: '',
        complete_auto_redirect: false,
        base_price: 0,
        sales_tax: 0,
        total_price: 0,
        currency: '',
        packages: [],
        coupons: [],
        giftcards: [],
        creator_code: '',
        links: { checkout: '' },
        custom: { '': '' },
      },
      setBasket: (data) => set(() => ({ basket: data })),

      updatePrice: () => {
        const itemsInBasket = get().basket?.packages.map((item) => {
          const productData = get()
            .categoryList.find((category) => category.packages.find((entry) => entry.id === item.id))
            ?.packages.find((entry) => entry.id === item.id);
          return {
            quantity: item.in_basket.quantity,
            itemData: productData,
          };
        });

        if (!itemsInBasket) return;

        let totalPrice = 0,
          basePrice = 0,
          salesTax = 0;
        for (const item of itemsInBasket) {
          if (!item.itemData) continue;
          totalPrice += item.quantity * item.itemData.total_price;
          basePrice += item.quantity * item.itemData.base_price;
          salesTax += item.quantity * item.itemData.sales_tax;
        }

        set((state) => ({
          basket: state.basket
            ? { ...state.basket, base_price: basePrice, total_price: totalPrice, sales_tax: salesTax }
            : state.basket,
        }));
      },

      addToBasket: (item, setQuantity) => {
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
                            quantity: setQuantity ? setQuantity : entry.in_basket.quantity + 1,
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

      applyGiftCard: (data) =>
        set((state) => ({
          basket: state.basket
            ? { ...state.basket, giftcards: [...state.basket.giftcards, { card_number: data }] }
            : state.basket,
        })),
      removeGiftCard: (data) => {
        set((state) => ({
          basket: state.basket
            ? { ...state.basket, giftcards: state.basket.giftcards.filter((card) => card.card_number != data) }
            : state.basket,
        }));
      },

      authUrl: '',
      setAuthUrl: (data) => set(() => ({ authUrl: data })),
    }),
    {
      name: 'tebex-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
