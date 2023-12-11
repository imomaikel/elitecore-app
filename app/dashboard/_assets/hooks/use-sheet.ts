import { create } from 'zustand';

type TUseSheet = {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
};
export const useSheet = create<TUseSheet>()((set) => ({
  isOpen: false,
  onOpen: () => set(() => ({ isOpen: true })),
  onOpenChange: () => set(() => ({ isOpen: false })),
}));
