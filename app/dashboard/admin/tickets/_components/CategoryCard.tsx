import { HiMiniPlus, HiMiniMinus } from 'react-icons/hi2';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

type TCategoryCard = {
  name: string;
  id: string;
  onDelete: () => void;
  isDisabled: boolean;
  position: number;
  onPositionChange: (method: 'INCREMENT' | 'DECREMENT') => void;
};
const CategoryCard = ({ id, name, onDelete, isDisabled, position, onPositionChange }: TCategoryCard) => {
  return (
    <div className="bg-white/5 max-w-sm p-4 space-y-2 rounded-lg relative">
      <div className="text-xl font-medium w-full truncate">{name}</div>
      <div className="grid grid-cols-2 gap-x-6">
        <Button variant="destructive" onClick={onDelete} disabled={isDisabled}>
          Delete
        </Button>
        <Button disabled={isDisabled}>
          <Link href={`/dashboard/admin/tickets/category/${id}`}>Edit</Link>
        </Button>
      </div>
      <div className="absolute top-0 right-0 flex items-center text-sm">
        <span>Position</span>
        <span className="w-4 text-center">{position}</span>
        <div
          className="hover:text-primary transition-colors cursor-pointer"
          onClick={() => !isDisabled && onPositionChange('INCREMENT')}
        >
          <HiMiniPlus className="h-6 w-6" />
        </div>
        <div
          className="hover:text-primary transition-colors cursor-pointer"
          onClick={() => !isDisabled && onPositionChange('DECREMENT')}
        >
          <HiMiniMinus className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
