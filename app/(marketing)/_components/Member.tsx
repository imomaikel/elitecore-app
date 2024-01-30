import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { FaUser } from 'react-icons/fa';
import { Staff } from '@prisma/client';
import { format } from 'date-fns';

type TMember = {
  member: Staff & { days: number };
};
const Member = ({ member }: TMember) => {
  return (
    <div className="px-6 py-1 bg-white/5 h-min rounded-md flex space-x-3 relative hover:scale-110 transition-transform cursor-default">
      <div>
        <Avatar>
          <AvatarImage alt="avatar" src={member.avatarUrl} />
          <AvatarFallback>
            <FaUser className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <div className="font-semibold">{member.username}</div>
          <div className="text-muted-foreground text-sm">{member.role}</div>
        </div>
        <div>
          <div>
            Since <span>{format(member.joinedAt, 'LL/dd/y')}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            That&apos;s over <span>{member.days.toLocaleString('de-DE')}</span> days
          </div>
        </div>
      </div>
      <div className="absolute w-full h-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900 rounded-md -z-10 blur-[50px] opacity-50" />
    </div>
  );
};

export default Member;
