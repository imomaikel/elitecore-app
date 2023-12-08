import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';

type TUseMobileSidebar = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
};
export const useMobileSidebar = create<TUseMobileSidebar>()(
  persist(
    (set) => ({
      isOpen: false,
      onClose: () =>
        set(() => ({
          isOpen: false,
        })),
      onOpen: () =>
        set(() => ({
          isOpen: true,
        })),
    }),
    {
      name: 'mobile-sidebar-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
