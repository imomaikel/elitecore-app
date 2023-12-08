import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { unknownAvatar } from '@/constans';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';

type TUserMention = {
  className?: string;
  avatarURL: string;
  username: string;
  text?: string;
};
const UserMention = ({ className, avatarURL, username, text }: TUserMention) => {
  return (
    <div className={cn('flex flex-row space-x-4 items-center w-[260px] px-2 py-1 rounded-md shadows-md', className)}>
      <Avatar>
        {/* TODO SSR */}
        <AvatarImage src={avatarURL} />
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

export default UserMention;
