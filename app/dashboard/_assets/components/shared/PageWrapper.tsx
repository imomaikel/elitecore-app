'use client';
import { Separator } from '@/shared/components/ui/separator';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

type TPageWrapper = {
  title: string | React.ReactNode;
  children: React.ReactNode;
  pageName: string;
  showGoBack?: boolean;
  className?: string;
};
const PageWrapper = ({ children, title, showGoBack, pageName, className }: TPageWrapper) => {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="flex items-center flex-col lg:flex-row">
        <h1 className="text-2xl font-bold flex">
          {pageName} - {title}
        </h1>
        {showGoBack && (
          <div
            className="items-center text-muted-foreground ml-4 opacity-50 hover:opacity-100 transition-opacity hover:underline cursor-pointer flex"
            role="button"
            onClick={() => router.back()}
          >
            Go back
            <IoArrowBackOutline className="ml-1" />
          </div>
        )}
      </div>
      <Separator className="mt-4 mb-2" />
      <div className={className}>{children}</div>
    </div>
  );
};

export default PageWrapper;
