import { FaPeopleRoof, FaDiscord } from 'react-icons/fa6';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { TbDeviceRemote } from 'react-icons/tb';
import { GiPointySword } from 'react-icons/gi';
import { RiAdminFill } from 'react-icons/ri';
import { FaBook } from 'react-icons/fa6';
export const unknownAvatar = '/logo.png';

export const panelTabs = [
  {
    categoryName: 'Admin',
    Icon: RiAdminFill,
    tabs: [
      {
        tabName: 'Discord Selection',
        Icon: FaDiscord,
        path: '/dashboard/admin/discord-selection',
      },
      {
        tabName: 'Server Control',
        Icon: TbDeviceRemote,
        path: '/dashboard/admin/server-control',
      },
      {
        tabName: 'Server Status',
        Icon: HiOutlineStatusOnline,
        path: '/dashboard/admin/server-status',
      },
      {
        tabName: 'Logs',
        Icon: FaBook,
        path: '/dashboard/admin/logs',
      },
    ],
  },
  {
    categoryName: 'Tribe',
    Icon: FaPeopleRoof,
    tabs: [
      {
        tabName: 'Logs',
        Icon: FaBook,
        path: '/dashboard/tribe/logs',
      },
      {
        tabName: 'Raids',
        Icon: GiPointySword,
        path: '/dashboard/tribe/raids',
      },
    ],
  },
];
