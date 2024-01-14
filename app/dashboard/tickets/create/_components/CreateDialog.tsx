import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import ActionButton from '@/components/shared/ActionButton';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { errorToast } from '@/shared/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';
import Link from 'next/link';

const COORDS_REGEX = /-?[0-9]*\s-?[0-9]*\s-?[0-9]*\s-?[0-9]*\.[0-9]+\s-?[0-9]*\.[0-9]*/g;

type TCreateDialog = {
  open: boolean;
  onClose: () => void;
  coordinateInput: boolean;
  mapSelection: boolean;
  createConfirmation: string | null;
  categoryId: string;
};
const CreateDialog = ({
  open,
  onClose,
  coordinateInput,
  createConfirmation,
  mapSelection,
  categoryId,
}: TCreateDialog) => {
  const [createdDialogOpen, setCreatedDialogOpen] = useState(false);
  const [validCoords, setValidCoords] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [coords, setCoords] = useState('');
  const [map, setMap] = useState(0);

  const matchCoords = coords.match(COORDS_REGEX);

  if (matchCoords) {
    if (!validCoords) setValidCoords(true);
  } else if (validCoords) {
    setValidCoords(false);
  }

  const { data: servers } = trpc.getServers.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: mapSelection,
  });

  const {
    mutate: createTicket,
    data: newTicket,
    isLoading,
  } = trpc.createTicket.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Ticket created!');
        onClose();
        setCreatedDialogOpen(true);
      } else {
        errorToast(response.message);
      }
    },
    onError: ({ data }) => errorToast(data?.code === 'BAD_REQUEST' ? 'Invalid inputs' : undefined),
  });

  const onCreate = () => {
    if (createConfirmation && !confirm) {
      errorToast('You did not confirm the creation!');
      return;
    }
    if (coordinateInput && coords.length <= 0) {
      errorToast('You did not enter coordinates!');
      return;
    }
    if (coordinateInput && !validCoords) {
      errorToast('Please enter valid coordinates!');
      return;
    }
    if (mapSelection && map <= 0) {
      errorToast('You did not select your map!');
      return;
    }
    toast.info('Please wait...');
    createTicket({
      categoryId,
      coordinateInput: coords.length >= 1 ? coords : undefined,
      mapSelection: map > 0 ? map : undefined,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket Creation</DialogTitle>
            {coordinateInput && mapSelection && <DialogDescription>We need some details</DialogDescription>}
          </DialogHeader>

          {coordinateInput && (
            <div>
              <Label htmlFor="coords">Enter coordinates</Label>
              <p className="text-muted-foreground text-sm">
                <span>Please follow the instructions below:</span>
                <ol className="list-decimal m-0">
                  <div className="ml-6">
                    <li>Stand at the location you want to copy your ccc-cords from.</li>
                    <li>
                      Type &quot;ccc&quot; in the tab menu and press enter. You won&apos;t see anything happen, but your
                      coordinates are now &quot;copied&quot;
                    </li>
                    <li>You can now select all and paste your cords (ctrl + a and then ctrl + v)</li>
                  </div>
                </ol>
              </p>
              <Input id="coords" className="my-1" value={coords} onChange={(e) => setCoords(e.target.value)} />
              {validCoords ? (
                <p className="text-emerald-500">Coordinates valid</p>
              ) : (
                <p className="text-destructive">Coordinates invalid</p>
              )}
            </div>
          )}
          {mapSelection && (
            <div>
              <Label>Select map</Label>
              <Select onValueChange={(value) => setMap(parseInt(value))}>
                <SelectTrigger className="py-6">
                  <SelectValue placeholder="Select your map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {servers?.map(({ customName, gameType, id, mapName }) => {
                      const label = (customName && customName?.length >= 3 ? customName : mapName).replace(/_/gi, ' ');

                      return (
                        <SelectItem key={`server-${id}`} value={id.toString()}>
                          <div className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-muted-foreground text-sm">ARK: {gameType}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          {createConfirmation && (
            <div className="flex items-center space-x-2">
              <Checkbox id="confirmation" checked={confirm} onCheckedChange={(checked) => setConfirm(!!checked)} />
              <Label htmlFor="confirmation">{createConfirmation}</Label>
            </div>
          )}
          <DialogFooter>
            <Button className="w-32" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <ActionButton className="w-32" onClick={onCreate} disabled={isLoading}>
              Create
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {newTicket && (
        <Dialog open={createdDialogOpen} onOpenChange={setCreatedDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ticket Created</DialogTitle>
              <DialogDescription>
                Your ticket has been created successfully. Now you can view and send messages through Discord or the
                Website.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full grid grid-cols-2 gap-2">
              <Button>
                <Link href={newTicket?.ticketId ? `/dashboard/tickets/${newTicket.ticketId}` : '/dashboard/tickets'}>
                  Website
                </Link>
              </Button>
              <Button>
                <Link href={newTicket?.inviteLink ?? '/dashboard/tickets'}>Discord</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CreateDialog;
