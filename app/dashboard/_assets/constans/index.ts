import { MdLibraryBooks, MdMiscellaneousServices } from 'react-icons/md';
import { FaPeopleRoof, FaDiscord } from 'react-icons/fa6';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { MdOutlineLeaderboard } from 'react-icons/md';
import { IoTicketOutline } from 'react-icons/io5';
import { LuCalendarClock } from 'react-icons/lu';
import { TbDeviceRemote } from 'react-icons/tb';
import { FaInfoCircle } from 'react-icons/fa';
import { RiAdminFill } from 'react-icons/ri';
import { FaBook } from 'react-icons/fa6';
export const unknownAvatar = '/logo.png';
import { IoAdd } from 'react-icons/io5';
import { IconType } from 'react-icons';

type TPanelTabs = {
  categoryName: string;
  Icon: IconType;
  tabs: {
    tabName: string;
    Icon: IconType;
    path: string;
  }[];
}[];
export const panelTabs: TPanelTabs = [
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
        tabName: 'Tickets',
        Icon: IoTicketOutline,
        path: '/dashboard/admin/tickets',
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
        tabName: 'Countdown',
        Icon: LuCalendarClock,
        path: '/dashboard/admin/countdown ',
      },
      {
        tabName: 'Leader Board',
        Icon: MdOutlineLeaderboard,
        path: '/dashboard/admin/leaderboard',
      },
      {
        tabName: 'Miscellaneous',
        Icon: MdMiscellaneousServices,
        path: '/dashboard/admin/misc',
      },
      {
        tabName: 'Logs',
        Icon: FaBook,
        path: '/dashboard/admin/logs',
      },
    ],
  },
  {
    categoryName: 'Tickets',
    Icon: IoTicketOutline,
    tabs: [
      {
        tabName: 'New ticket',
        Icon: IoAdd,
        path: '/dashboard/tickets/create',
      },
      {
        tabName: 'Logs',
        Icon: MdLibraryBooks,
        path: '/dashboard/tickets',
      },
    ],
  },
  {
    categoryName: 'Tribe',
    Icon: FaPeopleRoof,
    tabs: [
      {
        tabName: 'Info',
        Icon: FaInfoCircle,
        path: '/dashboard/tribe',
      },
      {
        tabName: 'Logs',
        Icon: FaBook,
        path: '/dashboard/tribe/logs',
      },
      // TODO
      // {
      //   tabName: 'Raids',
      //   Icon: GiPointySword,
      //   path: '/dashboard/tribe/raids',
      // },
    ],
  },
];

export const CURRENCIES = ['AUD', 'BRL', 'CAD', 'DKK', 'EUR', 'NOK', 'NZD', 'PLN', 'GBP', 'SEK', 'USD'] as const;
export type TCurrency = {
  code: (typeof CURRENCIES)[number];
  rate: number;
};
export const LOCALE_CODES = [
  {
    code: 'AUD',
    locale: 'ar-SA',
  },
  {
    code: 'BRL',
    locale: 'pt-BR',
  },
  {
    code: 'CAD',
    locale: 'en-CA',
  },
  {
    code: 'DKK',
    locale: 'da-DK',
  },
  {
    code: 'EUR',
    locale: undefined,
  },
  {
    code: 'NOK',
    locale: 'nb-NO',
  },
  {
    code: 'NZD',
    locale: 'en-NZ',
  },
  {
    code: 'PLN',
    locale: 'pl-PL',
  },
  {
    code: 'GBP',
    locale: 'en-GB',
  },
  {
    code: 'SEK',
    locale: 'sv-SE',
  },
  {
    code: 'USD',
    locale: 'en-US',
  },
];

export const schemaList = [
  'webapp.player',
  'arkshop',
  'arkshopasax1000',
  'gog_stats_ark',
  'tribes.wtribes_events',
  'tribes.wtribes_log',
  'tribes.wtribes_playerdata',
  'tribes.wtribes_playerids',
  'tribes.wtribes_tribedata',
  'tribes.wtribes_tribelog_webhooks',
];
