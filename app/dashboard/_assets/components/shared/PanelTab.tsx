import { cn, importantNotification } from '@/shared/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePathname } from 'next/navigation';
import { panelTabs } from '@/constans';
import Link from 'next/link';

const PanelTab = () => {
  const { user } = useCurrentUser();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-y-2">
      {panelTabs
        .filter((tab) => {
          if (tab.categoryName !== 'Admin') return true;
          if (!(user?.role === 'ADMIN' || user?.role === 'MANAGER')) return false;
          return true;
        })
        .map((category, index) => (
          <div key={`${category.categoryName}${index}`} className="mt-4">
            <div className="flex text-xl items-center">
              <div>{<category.Icon className="w-8 h-8 mr-3" />}</div>
              <div>{category.categoryName}</div>
            </div>
            {category.tabs.map((tab, tabIndex) => {
              let active = pathname.startsWith(tab.path);
              if (pathname.startsWith('/dashboard/tickets')) {
                active = pathname === tab.path;
              } else if (pathname.startsWith('/dashboard/tribe')) {
                active = pathname === tab.path;
              }
              const notify = importantNotification(tab.path, true);

              return (
                <Link href={tab.path} key={`${tab.tabName}${tabIndex}`}>
                  <div
                    className={cn(
                      `flex text-md w-[90%] items-center my-2 ml-auto
transition-colors hover:bg-muted p-2 cursor-pointer
rounded-md group relative after:w-1 after:h-full after:bg-red-500
after:absolute after:right-0  after:rounded-tr after:rounded-br
after:opacity-0 after:hover:opacity-100 after:transition-opacity`,
                      active && 'bg-muted',
                    )}
                  >
                    <div className="absolute text-xs text-destructive top-0 right-2">{notify}</div>
                    <div className="group-hover:text-primary transition-colors">
                      {<tab.Icon className="w-6 h-6 mr-3" />}
                    </div>
                    <div className="group-hover:translate-x-2 transition-transform whitespace-nowrap pr-2 truncate group-hover:underline font-medium">
                      {tab.tabName}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
    </div>
  );
};

export default PanelTab;
