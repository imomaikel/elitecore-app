import { DefaultErrorData } from '@trpc/server/dist/error/formatter';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
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
