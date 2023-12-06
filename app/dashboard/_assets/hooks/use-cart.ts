import { create } from 'zustand';

type TUseCart = {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
};
export const useCart = create<TUseCart>()((set) => ({
  isOpen: false,
  onOpen: () => set(() => ({ isOpen: true })),
  onOpenChange: () => set(() => ({ isOpen: false })),
}));
