'use client';
import { errorToast, relativeDate } from '@/shared/lib/utils';
import { Separator } from '@/shared/components/ui/separator';
import ActionButton from '@/components/shared/ActionButton';
import { Skeleton } from '@/shared/components/ui/skeleton';
import PageWrapper from '@/components/shared/PageWrapper';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { FaExternalLinkAlt } from 'react-icons/fa';
import Message from './_components/Message';
import Scroll from './_components/Scroll';
import Info from './_components/Info';
import { trpc } from '@/trpc';
import Link from 'next/link';

const TicketPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const router = useRouter();

  const { data: ticket, isLoading } = trpc.getTicketWithLogs.useQuery(
    { ticketId: ticketId },
    {
      enabled: !!ticketId,
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: getTranscript, isLoading: transcriptLoading } = trpc.getTranscript.useMutation();
  const onTranscript = () => {
    if (!ticket) {
      return errorToast();
    }
    getTranscript(
      {
        authorId: ticket?.authorDiscordId,
        ticketId: ticket?.id,
      },
      {
        onSuccess: ({ url }) => {
          if (!url) return errorToast();
          router.push(url);
        },
        onError: () => errorToast(),
      },
    );
  };

  if (isLoading) return <TicketPage.Skeleton />;
  if (!ticket?.id) {
    errorToast('This ticket does not exist');
    router.push('/dashboard/tickets');
    return;
  }

  const ticketCategory = ticket.TicketCategory?.name ?? '';
  const ticketAuthor = ticket.authorUsername;

  return (
    <PageWrapper pageName="Ticket" title={`${ticketCategory} (${ticketAuthor})`} showGoBack>
      <div>
        {/* Info */}
        <div className="flex gap-3 flex-wrap">
          <Info title="Author" content={ticket.authorUsername} />
          <Info title="Created at" content={relativeDate(ticket.createdAt)} />
          <Info title="Total messages" content={(ticket.messages.length ?? 0).toString()} />

          {ticket.TicketCategory?.coordinateInput && (
            <Info title="Coordinates" content={ticket.coordinates ?? 'Not specified yet'} copyButton />
          )}
          {ticket.TicketCategory?.mapSelection && (
            <Info title="Related map" content={ticket.mapName ?? 'Not specified yet'} />
          )}
          {ticket.closedAt && (
            <>
              <Info title="Closed at" content={relativeDate(ticket.closedAt)} />
              <Info title="Closed by" content={ticket.closedBy} />
            </>
          )}
          {ticket.TicketCategory?.steamRequired && (
            <>
              <Info title="Steam ID" content={ticket.authorSteamId ?? 'Unknown'} copyButton={!!ticket.authorSteamId} />
              <Info title="EOS ID" content={ticket.authorEOSId ?? 'Unknown'} copyButton={!!ticket.authorEOSId} />
            </>
          )}
        </div>
        {/* Actions */}
        <div className="my-4 flex gap-3 flex-wrap">
          {!ticket.closedAt && (
            <Button asChild variant="secondary">
              <Link href={ticket.inviteUrl} target="_blank">
                View on Discord <FaExternalLinkAlt className="ml-2" />
              </Link>
            </Button>
          )}
          {/* TODO */}
          {!ticket.closedAt && <Button variant="secondary">Close the ticket</Button>}
          <ActionButton variant="secondary" disabled={transcriptLoading} onClick={onTranscript}>
            Download transcript
          </ActionButton>
        </div>
        <div className="mb-6 flex items-center justify-center flex-col">
          <Separator className="mt-4" />
          <div className="mt-2 text-xl font-semibold">This is the beginning of the ticket</div>
        </div>
        {/* Messages */}
        <div className="flex flex-col">
          {ticket.messages.map((data, index) => (
            <Message key={data.id} data={data} lastAuthorId={ticket.messages[index - 1]?.authorDiscordId ?? null} />
          ))}
        </div>
        <div className="mb-4 flex items-center justify-center flex-col">
          <Separator className="mt-6" />
          <div className="mt-2 text-xl font-semibold">This is the end of the ticket</div>
          <p>{ticket.closedAt ? 'This ticket is closed' : 'This ticket is not closed yet'}</p>
        </div>
        <Scroll />
      </div>
    </PageWrapper>
  );
};

TicketPage.Skeleton = function ShowSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center flex-col lg:flex-row">
        <Skeleton className="w-[400px] h-8" />
      </div>
      <Separator className="my-4" />
      <div>
        <div className="flex gap-3 flex-wrap">
          <Skeleton className="h-16 w-[100px]" />
          <Skeleton className="h-16 w-[150px]" />
          <Skeleton className="h-16 w-[140px]" />
          <Skeleton className="h-16 w-[245px]" />
          <Skeleton className="h-16 w-[115px]" />
          <Skeleton className="h-16 w-[255px]" />
        </div>
        <div className="my-4 flex gap-3 flex-wrap">
          <Skeleton className="h-9 w-[160px]" />
          <Skeleton className="h-9 w-[160px]" />
          <Skeleton className="h-9 w-[160px]" />
        </div>
        <div className="mb-6 flex items-center justify-center flex-col">
          <Separator className="mt-4" />
          <Skeleton className="h-7 w-[300px] mt-2" />
        </div>
        <div className="flex flex-col">
          <Message.DetailedSkeleton />
          <Message.OnlyTextSkeleton />
          <Message.OnlyTextSkeleton />
          <Message.OnlyTextSkeleton />

          <Message.DetailedSkeleton />
          <Message.OnlyTextSkeleton />

          <Message.DetailedSkeleton />
          <Message.OnlyTextSkeleton />
          <Message.OnlyTextSkeleton />
          <Message.OnlyTextSkeleton />

          <Message.DetailedSkeleton />
          <Message.OnlyTextSkeleton />

          <Message.DetailedSkeleton />
          <Message.OnlyTextSkeleton />

          <Message.DetailedSkeleton />
          <Message.OnlyTextSkeleton />
        </div>
        <div className="mb-4 flex items-center justify-center flex-col">
          <Separator className="mt-6" />
          <Skeleton className="h-7 w-[245px] mt-2" />
          <Skeleton className="h-6 w-[190px] mt-1" />
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
