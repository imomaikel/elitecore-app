import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { useTebex } from '@/hooks/use-tebex';

const ItemControl = () => {
  const { setShowItem, showItemType } = useTebex();

  const isAse = showItemType === 'ase' || showItemType === 'all';
  const isAsa = showItemType === 'asa' || showItemType === 'all';

  const onItemsChange = (type: 'ase' | 'asa') => {
    if (type === 'asa') {
      if (isAsa && isAse) {
        setShowItem('ase');
      } else if (!isAsa && !isAse) {
        setShowItem('asa');
      } else if (isAsa && !isAse) {
        setShowItem('ase');
      } else {
        setShowItem('all');
      }
    } else if (type === 'ase') {
      if (isAsa && isAse) {
        setShowItem('asa');
      } else if (!isAsa && !isAse) {
        setShowItem('ase');
      } else if (!isAsa && isAse) {
        setShowItem('asa');
      } else {
        setShowItem('all');
      }
    }
  };

  return (
    <div className="flex flex-col space-y-3 mt-3">
      <div className="flex flex-col space-y-1">
        <Label htmlFor="ase">Show ARK: Evolved Items (ASE)</Label>
        <Switch id="ase" checked={isAse} onCheckedChange={() => onItemsChange('ase')} />
      </div>
      <div className="flex flex-col space-y-1">
        <Label htmlFor="asa">Show ARK: Ascended Items (ASA)</Label>
        <Switch id="asa" checked={isAsa} onCheckedChange={() => onItemsChange('asa')} />
      </div>
    </div>
  );
};

export default ItemControl;
