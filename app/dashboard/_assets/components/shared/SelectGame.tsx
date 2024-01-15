'use client';
import {
  Dialog,
  DialogContentWithoutClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useTebex } from '@/hooks/use-tebex';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SelectGame = () => {
  const { showItemType, setShowItem } = useTebex();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(showItemType === 'none');

  useEffect(() => setIsMounted(true), []);
  useEffect(() => {
    if (showItemType === 'none') return;
    setIsOpen(false);
  }, [showItemType]);

  const selectItem = (type: 'ase' | 'asa' | 'all') => {
    const message =
      type === 'asa' ? 'Selected ARK: Ascended!' : type === 'ase' ? 'Selected ARK: Evolved!' : 'Selected both games!';
    toast.success(message);
    setShowItem(type);
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen}>
      <DialogContentWithoutClose>
        <div className="absolute w-full h-full -z-10 blur-[100px] bg-gradient-to-r from-yellow-600 to-red-600 opacity-20" />
        <DialogHeader>
          <DialogTitle>Select your game</DialogTitle>
          <DialogDescription className="flex flex-col">
            <span>This will limit shop products only to the game that you selected.</span>
            <span>It can be changed anytime.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col relative">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => selectItem('ase')}>ARK: Evolved</Button>
            <Button onClick={() => selectItem('asa')}>ARK: Ascended</Button>
          </div>
          <div className="flex items-center justify-center mt-2">
            <Button className="w-1/2" onClick={() => selectItem('all')}>
              Both
            </Button>
          </div>
        </div>
      </DialogContentWithoutClose>
    </Dialog>
  );
};

export default SelectGame;
