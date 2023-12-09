'use client';
import { ImSpinner9 } from 'react-icons/im';
import { cn } from '@/shared/lib/utils';

type TLoader = {
  className?: string;
};
const Loader = ({ className }: TLoader) => {
  return (
    <div className={cn('flex items-center gap-x-2 font-medium select-none relative', className)}>
      <ImSpinner9 className="w-6 h-6 animate-spin" />
      <span className="tracking-tighter">Loading...</span>
    </div>
  );
};

export default Loader;
