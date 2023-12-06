import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type TUseSidebarTab = {
  selected: 'shop' | 'panel';
  setTab: (newTab: TUseSidebarTab['selected']) => void;
};
export const useSidebarTab = create<TUseSidebarTab>()(
  persist(
    (set) => ({
      selected: 'shop',
      setTab: (newTab) =>
        set(() => ({
          selected: newTab,
        })),
    }),
    {
      name: 'sidebar-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
