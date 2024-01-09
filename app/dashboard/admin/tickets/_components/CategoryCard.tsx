import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

type TCategoryCard = {
  name: string;
  id: string;
  onDelete: () => void;
  isDeleting: boolean;
};
const CategoryCard = ({ id, name, onDelete, isDeleting }: TCategoryCard) => {
  return (
    <div className="bg-white/5 max-w-sm p-4 space-y-2 rounded-lg">
      <div className="text-xl font-medium w-full truncate">{name}</div>
      <div className="grid grid-cols-2 gap-x-6">
        <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
          Delete
        </Button>
        <Button asChild disabled={isDeleting}>
          <Link href={`/dashboard/admin/tickets/category/${id}`}>Edit</Link>
        </Button>
      </div>
    </div>
  );
};

export default CategoryCard;
