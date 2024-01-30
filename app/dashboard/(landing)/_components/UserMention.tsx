import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { unknownAvatar } from '@/constans';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/shared/components/ui/skeleton';

type TUserMention = {
  className?: string;
  avatarUrl: string;
  username: string;
  text?: string;
};
const UserMention = ({ className, avatarUrl, username, text }: TUserMention) => {
  return (
    <div className={cn('flex flex-row space-x-4 items-center w-[260px] px-2 py-1 rounded-md', className)}>
      <Avatar>
        <AvatarImage alt="avatar" src={avatarUrl} />
        <AvatarFallback>
          <Image src={unknownAvatar} fill alt="avatar" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col overflow-hidden">
        <span className="font-semibold truncate">{username}</span>
        {text && <span className="text-muted-foreground truncate">{text}</span>}
      </div>
    </div>
  );
};

UserMention.BigSkeleton = function ShowSkeleton() {
  return UserMention._Skeleton(true);
};
UserMention.SmallSkeleton = function ShowSkeleton() {
  return UserMention._Skeleton(false);
};

UserMention._Skeleton = function ShowSkeleton(withText: boolean) {
  return (
    <div className="flex flex-row space-x-4 items-center w-[260px] px-2 py-1 rounded-md">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex flex-col overflow-hidden">
        <Skeleton className="h-6 w-[125px]" />
        {withText && <Skeleton className="h-6 w-[160px] mt-1" />}
      </div>
    </div>
  );
};

export default UserMention;
