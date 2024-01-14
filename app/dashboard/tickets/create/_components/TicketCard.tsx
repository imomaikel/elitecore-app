import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { errorToast } from '@/shared/lib/utils';
import CreateDialog from './CreateDialog';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TTicketCard = {
  name: string;
  description: string;
  index: number;
  image?: string | null | undefined;
  coordinateInput: boolean;
  limit: number;
  mapSelection: boolean;
  steamRequired: boolean;
  id: string;
  createConfirmation: string | null;
};
const TicketCard = ({
  name,
  description,
  index,
  image,
  coordinateInput,
  limit,
  mapSelection,
  steamRequired,
  id,
  createConfirmation,
}: TTicketCard) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate: createTicket, isLoading } = trpc.createTicket.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Ticket created!');
      } else {
        errorToast(response.message);
      }
    },
    onError: () => errorToast(),
  });

  const onClick = () => {
    if (coordinateInput || mapSelection || createConfirmation) {
      setIsDialogOpen(true);
      return;
    }
    createTicket({ categoryId: id });
  };

  return (
    <>
      <motion.div
        initial={{
          x: 100,
          opacity: 0,
        }}
        whileInView={{
          x: 0,
          opacity: 1,
        }}
        transition={{
          delay: 0.1 * index,
        }}
        viewport={{
          once: true,
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {(coordinateInput || mapSelection || steamRequired) && (
              <div>
                <p className="font-semibold">Requirements for this ticket</p>
                <ul className="space-y-2">
                  {coordinateInput && (
                    <li className="flex text-sm items-center">
                      <MdKeyboardDoubleArrowRight />
                      In-game coordinates associated with your ticket
                    </li>
                  )}
                  {mapSelection && (
                    <li className="flex text-sm items-center">
                      <MdKeyboardDoubleArrowRight />
                      In-game map related to your ticket
                    </li>
                  )}
                  {steamRequired && (
                    <li className="flex text-sm items-center">
                      <MdKeyboardDoubleArrowRight />
                      In-game account connected with Steam
                    </li>
                  )}
                </ul>
              </div>
            )}
            {image && (
              <div className="relative w-full mt-4">
                <Image
                  src={image}
                  width={0}
                  height={0}
                  alt="ticket"
                  sizes="100vw"
                  className="w-full h-full rounded-lg"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-x-1 text-sm">
              Limit
              <Badge className="py-0">{limit}</Badge>
            </div>
            <Button className="w-32" disabled={isLoading} onClick={onClick}>
              Create
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      {(coordinateInput || mapSelection || createConfirmation) && (
        <CreateDialog
          categoryId={id}
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          coordinateInput={coordinateInput}
          createConfirmation={createConfirmation}
          mapSelection={mapSelection}
        />
      )}
    </>
  );
};

export default TicketCard;
