import { create } from 'zustand';

type TUseDialog = {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
  authUrl: string;
  setAuthUrl: (url: string) => void;
};
export const useDialog = create<TUseDialog>()((set) => ({
  isOpen: false,
  onOpen: () => set(() => ({ isOpen: true })),
  onOpenChange: () => set(() => ({ isOpen: false })),
  authUrl: '',
  setAuthUrl: (data) => set(() => ({ authUrl: data })),
}));
