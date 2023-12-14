'use client';
import { Button } from '@/shared/components/ui/button';
import { ImSpinner9 } from 'react-icons/im';

type TActionButton = {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'link' | 'ghost';
  onClick?: () => void;
  size?: 'sm' | 'lg' | 'icon';
  className?: string;
};
const ActionButton = ({ disabled, children, variant, onClick, className, size }: TActionButton) => {
  if (disabled) {
    return (
      <Button disabled variant={variant} className={className} size={size}>
        <ImSpinner9 className="animate-spin mr-2" />
        Loading
      </Button>
    );
  }

  return (
    <Button variant={variant} onClick={onClick} className={className} size={size}>
      {children}
    </Button>
  );
};

export default ActionButton;
