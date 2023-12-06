'use client';
import { Button } from '@/shared/components/ui/button';
import { ImSpinner9 } from 'react-icons/im';

type TActionButton = {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'link';
  onClick?: () => void;
};
const ActionButton = ({ disabled, children, variant, onClick }: TActionButton) => {
  if (disabled) {
    return (
      <Button disabled variant={variant}>
        <ImSpinner9 className="animate-spin mr-2" />
        Loading
      </Button>
    );
  }

  return <Button onClick={onClick}>{children}</Button>;
};

export default ActionButton;
