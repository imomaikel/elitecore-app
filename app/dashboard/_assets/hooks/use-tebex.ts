import { persist, createJSONStorage } from 'zustand/middleware';
import type { Category } from 'tebex_headless';
import { create } from 'zustand';

type TUseTebex = {
  categoryList: Category[] | [];
  setCategoryList: (categories: Category[] | []) => void;
};
export const useTebex = create<TUseTebex>()(
  persist(
    (set) => ({
      categoryList: [],
      setCategoryList: (data) => set(() => ({ categoryList: data })),
    }),
    {
      name: 'tebex-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
