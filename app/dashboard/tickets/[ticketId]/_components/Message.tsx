import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { TicketAttachment, TicketMessage } from '@prisma/client';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { cn, relativeDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

type TMessage = {
  data: TicketMessage & {
    attachments: TicketAttachment[];
  };
  lastAuthorId: string | null;
};
const Message = ({ data, lastAuthorId }: TMessage) => {
  const { authorAvatar, attachments, authorName, content, createdAt, authorDiscordId } = data;

  const showDetails = lastAuthorId !== authorDiscordId || lastAuthorId === null;

  const unknownAttachments = attachments.filter(
    ({ contentType }) => !(contentType?.startsWith('image/') || contentType?.startsWith('video/')),
  );

  return (
    <div className={cn('flex', showDetails ? 'mt-2 hover:bg-gray-50/5 rounded-sm' : 'mt-1')}>
      <div className="flex items-center justify-center">
        {showDetails && (
          <Avatar className="mx-4">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>
              <Image
                src="https://cdn.discordapp.com/embed/avatars/3.png"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-full"
                alt="avatar"
              />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="w-full">
        {showDetails && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{authorName}</span>
            <span className="first-letter:uppercase text-muted-foreground text-[0.75rem]">
              {relativeDate(createdAt)}
            </span>
          </div>
        )}
        <div>
          <div
            className={cn(
              'w-full font-light',
              showDetails ? '' : 'pl-[72px] hover:bg-gray-50/5 rounded-sm relative group',
            )}
          >
            {!showDetails && (
              <div className="absolute left-0 w-[72px] justify-center items-center h-full text-xs text-muted-foreground hidden group-hover:flex">
                {format(createdAt, 'hh:mm')}
              </div>
            )}
            {content}
            <div>
              {unknownAttachments &&
                unknownAttachments.map((attachment) => (
                  <div key={attachment.id}>
                    <Badge>Attachment</Badge>
                    <Button variant="link" asChild>
                      <Link href={attachment.path} target="_blank">
                        <div className="flex items-center">
                          {attachment.name}
                          <FaExternalLinkAlt className="ml-2" />
                        </div>
                      </Link>
                    </Button>
                  </div>
                ))}
            </div>
          </div>
          {attachments.length >= 1 && (
            <div className={cn('w-full pl-[72px] hover:bg-gray-50/5 rounded-sm relative group', showDetails && 'pl-0')}>
              {!showDetails && (
                <div className="absolute left-0 w-[72px] justify-center items-start mt-1 h-full text-xs text-muted-foreground hidden group-hover:flex">
                  {format(createdAt, 'HH:mm')}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 w-fit items-center">
                {attachments.map((attachment) => {
                  if (attachment.contentType?.startsWith('image/')) {
                    return (
                      <Link key={attachment.id} href={attachment.path} target="_blank">
                        <Image
                          src={attachment.path}
                          width={0}
                          height={0}
                          sizes="100vw"
                          alt="attachment"
                          className="w-full h-full max-w-[350px] max-h-[350px] object-center object-cover"
                        />
                      </Link>
                    );
                  }

                  if (attachment.contentType?.startsWith('video/')) {
                    return <video key={attachment.id} src={attachment.path} controls />;
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Message.OnlyTextSkeleton = function ShowSkeleton({ width }: { width: number }) {
  return (
    <div className="flex mt-2 rounded-sm">
      <div className="w-full">
        <div>
          <div className="w-full font-light rounded-sm relative ml-[72px]">
            <Skeleton className="h-6" style={{ width: `${width}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
Message.DetailedSkeleton = function ShowSkeleton({ width }: { width: number }) {
  return (
    <div className="flex mt-2 rounded-sm">
      <div className="flex items-center justify-center w-[72px]">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <div className="w-full">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-[110px]" />
          <Skeleton className="h-[18px] w-[100px]" />
        </div>
        <div>
          <div className="w-full font-light rounded-sm relative">
            <Skeleton className="h-5 mt-1" style={{ width: `${width}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
