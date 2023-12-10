'use server';
import { NextAuthUser } from '../../../next-auth';
import prisma from './prisma';
import {
  CreateBasket,
  SetWebstoreIdentifier,
  GetCategories,
  GetCategory,
  Category,
  SetPrivateKey,
  AddPackageToBasket,
  GetBasketAuthUrl,
  Basket,
} from 'tebex_headless';

export const shopGetCategories = async (): Promise<Category[] | []> => {
  SetWebstoreIdentifier(process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER!);
  let categories = null;
  try {
    categories = (await GetCategories(true)).filter((entry) => entry.packages.length >= 1);
  } catch (error) {
    console.log('Could not fetch categories', error);
  }
  return categories ?? [];
};

export const shopGetCategory = async (categoryId: number): Promise<Category | null> => {
  SetWebstoreIdentifier(process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER!);
  let category = null;
  try {
    category = await GetCategory(categoryId, true);
  } catch (error) {
    console.log('Could not fetch category', error);
  }
  return category ?? null;
};

type TCreateBasket = {
  userId: string;
  paymentSuccessPath: string;
  paymentCancelPath: string;
  ipAddress: string;
  basketAuthRedirectUrl: string;
};
const createBasket = async ({
  paymentSuccessPath,
  paymentCancelPath,
  ipAddress,
  userId,
  basketAuthRedirectUrl,
}: TCreateBasket): Promise<{
  status: 'success' | 'error';
  authUrl?: string;
}> => {
  try {
    SetWebstoreIdentifier(process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER!);
    SetPrivateKey(process.env.TEBEX_WEBSTORE_PRIVATE_KEY!);
    const newBasket = await CreateBasket(paymentSuccessPath, paymentCancelPath, ipAddress);

    const basketAuthUrl = await GetBasketAuthUrl(newBasket.ident, basketAuthRedirectUrl);

    if (!basketAuthUrl || !basketAuthUrl[0]) {
      return {
        status: 'error',
      };
    }

    const authUrl = basketAuthUrl[0].url;

    await prisma.user.update({
      where: { id: userId },
      data: {
        basketIdent: newBasket.ident,
        basketAuthUrl: authUrl,
      },
    });
    return {
      status: 'success',
      authUrl: authUrl,
    };
  } catch (error: any) {
    console.log('Create basket - error', error?.response?.data?.detail ?? error);
    return {
      status: 'error',
    };
  }
};

type TAddProductToBasket = {
  userId: string;
  productId: number;
};
const addProductToBasket = async ({
  userId,
  productId,
}: TAddProductToBasket): Promise<{
  status: 'success' | 'error';
  message?: 'Unauthorized' | 'Basket does not exist' | 'Basket not authorized' | 'Internal error' | 'Unknown error';
  extraMessage?: string | Basket;
}> => {
  const userData = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!userData?.id) {
    return { status: 'error', message: 'Unauthorized' };
  }
  if (!userData.basketIdent) {
    return { status: 'error', message: 'Basket does not exist' };
  }

  try {
    const addedProduct = await AddPackageToBasket(userData.basketIdent, productId, 1, 'single');
    return {
      status: 'success',
      extraMessage: addedProduct,
    };
  } catch (error: any) {
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (detail === 'User must login before adding packages to basket') {
        return { status: 'error', message: 'Basket not authorized' };
      } else {
        return { status: 'error', message: 'Unknown error', extraMessage: error.response.data.detail };
      }
    } else {
      console.log('Add product - error', error);
      return { status: 'error', message: 'Internal error' };
    }
  }
};

type TAddProduct = {
  ipAddress: string | undefined;
  user: NextAuthUser;
  productId: number;
};
export const addProduct = async ({
  ipAddress,
  user,
  productId,
}: TAddProduct): Promise<{
  status: 'error' | 'success';
  message?:
    | 'Unauthorized'
    | 'Internal error'
    | 'Could not find the basket auth url'
    | 'Basket not authorized'
    | 'Unknown error';
  extraMessage?: Basket | string;
}> => {
  if (!ipAddress || !user.id) {
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  }

  const addedProduct = await addProductToBasket({
    productId,
    userId: user.id,
  });

  if (addedProduct.status === 'success') {
    return {
      status: 'success',
      extraMessage: addedProduct.extraMessage as Basket,
    };
  } else if (addedProduct.message === 'Basket does not exist') {
    const newBasket = await createBasket({
      basketAuthRedirectUrl: process.env.TEBEX_AFTER_BASKET_AUTH!,
      ipAddress,
      paymentCancelPath: process.env.TEBEX_AFTER_PAYMENT_CANCEL!,
      paymentSuccessPath: process.env.TEBEX_AFTER_PAYMENT_SUCCESS!,
      userId: user.id,
    });
    if (newBasket.status === 'error') {
      return {
        status: 'error',
        message: 'Internal error',
      };
    } else {
      return {
        status: 'error',
        message: 'Basket not authorized',
        extraMessage: newBasket.authUrl,
      };
    }
  } else if (addedProduct.message === 'Basket not authorized') {
    const userData = await prisma.user.findFirst({
      where: { id: user.id },
      select: { basketAuthUrl: true },
    });
    if (!userData?.basketAuthUrl) {
      return {
        status: 'error',
        message: 'Could not find the basket auth url',
      };
    }
    return {
      status: 'error',
      message: 'Basket not authorized',
      extraMessage: userData.basketAuthUrl,
    };
  } else {
    return {
      status: 'error',
      message: 'Unknown error',
      extraMessage: addedProduct.extraMessage ?? addedProduct.message,
    };
  }
};
