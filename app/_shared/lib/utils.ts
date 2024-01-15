import { DefaultErrorData } from '@trpc/server/dist/error/formatter';
import { type ClassValue, clsx } from 'clsx';
import { formatRelative } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import en from 'date-fns/locale/en-US';
import { Maybe } from '@trpc/server';
import { toast } from 'sonner';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const errorToast = (errorCode?: undefined | Maybe<DefaultErrorData> | string) => {
  let message = 'Something went wrong!';

  if (typeof errorCode === 'string') {
    message = errorCode;
  } else if (errorCode?.code) {
    message = errorCode.code;
  }

  toast.error(message);
};

// https://github.com/date-fns/date-fns/issues/1218#issuecomment-599182307
/* eslint-disable */
const formatRelativeLocale = {
  lastWeek: "'Last' eeee 'at' p",
  yesterday: "'Yesterday at' p",
  today: "'Today at' p",
  tomorrow: "'Tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: 'Pp',
} as const;
type relative = keyof typeof formatRelativeLocale;
/* eslint-enable */

export const relativeDate = (date: Date, baseDate?: Date) => {
  const relative = formatRelative(date, baseDate ?? new Date(), {
    locale: { ...en, formatRelative: (token: relative) => formatRelativeLocale[token] },
  });
  return relative;
};
