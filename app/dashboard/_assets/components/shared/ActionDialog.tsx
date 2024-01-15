'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { ReactNode } from 'react';

type TActionDialog = {
  isOpen: boolean;
  onOpenChange: () => void;
  title: string;
  description: string | ReactNode;
  onProceed: () => void;
  proceedLabel?: string;
};
const ActionDialog = ({
  isOpen,
  onOpenChange,
  description,
  title,
  onProceed,
  proceedLabel = 'Continue',
}: TActionDialog) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onOpenChange}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onProceed}>{proceedLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ActionDialog;
