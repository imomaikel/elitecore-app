'use client';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import { useAnimate } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

type TInfo = {
  title: string;
  content: string | undefined | null;
  copyButton?: boolean;
};
const Info = ({ content, title, copyButton }: TInfo) => {
  const [scope, animate] = useAnimate();
  if (!content) return null;

  const onCopy = () => {
    if (!copyButton) return;
    window.navigator.clipboard.writeText(content);
    toast.info('Copied!');
    animate(scope.current, { scale: [1.08, 1] }, { duration: 0.5 });
  };

  return (
    <div
      onClick={onCopy}
      className={cn(
        'flex flex-col items-center justify-center py-2 px-3 bg-secondary/75 rounded-md cursor-default relative group',
        copyButton && 'cursor-pointer',
      )}
      ref={scope}
    >
      <div className="font-semibold">{title}</div>
      <div>{content}</div>
      {copyButton && (
        <div className="absolute right-0 top-0 group-hover:text-primary" role="button">
          <HiOutlineClipboardCopy className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default Info;
