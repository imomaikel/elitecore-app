'use server';
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
  RemovePackage,
  UpdateQuantity,
  Apply,
  Remove,
  GiftPackage,
} from 'tebex_headless';
import { NextAuthUser } from '../../../next-auth';
import prisma from './prisma';

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
  ipAddress: string;
  basketAuthRedirectUrl: string;
};
export const createBasket = async ({
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
    const newBasket = await CreateBasket(
      `${process.env.TEBEX_AFTER_PAYMENT_SUCCESS}`,
      `${process.env.TEBEX_AFTER_PAYMENT_CANCEL}`,
      undefined,
      true,
      ipAddress,
    );

    const basketAuthUrl = await GetBasketAuthUrl(
      newBasket.ident,
      `${process.env.NEXT_PUBLIC_SERVER_URL}${basketAuthRedirectUrl}`,
    );

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

type TUpdateQuantityResponse =
  | {
      status: 'success';
      data: Basket;
    }
  | {
      status: 'error';
      message: string;
    };
type TUpdateQuantity = {
  user: NextAuthUser;
  productId: number;
  quantity: number;
};
export const updateQuantity = async ({
  productId,
  user,
  quantity,
}: TUpdateQuantity): Promise<TUpdateQuantityResponse> => {
  if (!user.id || !user.basketIdent) {
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  }

  try {
    const response = await UpdateQuantity(user.basketIdent, productId, quantity);
    return {
      status: 'success',
      data: response,
    };
  } catch (error: any) {
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      return {
        status: 'error',
        message: detail,
      };
    } else {
      console.log('Update quantity - error', error);
      return { status: 'error', message: 'Internal error' };
    }
  }
};
type TGiftCardResponse =
  | {
      status: 'success';
      message: string;
      giftCard: string;
    }
  | {
      status: 'error';
      message: string;
    };
type TGiftCard = {
  user: NextAuthUser;
  giftCard: string;
};
export const applyGiftCard = async ({ giftCard, user }: TGiftCard): Promise<TGiftCardResponse> => {
  if (!user.id || !user.basketIdent) {
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  }
  SetWebstoreIdentifier(process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER!);
  try {
    const response = await Apply(user.basketIdent, 'giftcards', { card_number: giftCard });
    if (response?.message) {
      return {
        status: 'success',
        message: response.message,
        giftCard,
      };
    }
    return { status: 'error', message: 'Internal error' };
  } catch (error: any) {
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      return { status: 'error', message: detail };
    } else {
      console.log('Add gift card - error', error);
      return { status: 'error', message: 'Internal error' };
    }
  }
};

export const removeGiftCard = async ({ giftCard, user }: TGiftCard): Promise<TGiftCardResponse> => {
  if (!user.id || !user.basketIdent) {
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  }
  SetWebstoreIdentifier(process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER!);
  try {
    const response = await Remove(user.basketIdent, 'giftcards', { card_number: giftCard });
    if (response?.message) {
      return {
        status: 'success',
        message: response.message,
        giftCard,
      };
    }
    return { status: 'error', message: 'Internal error' };
  } catch (error: any) {
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      return { status: 'error', message: detail };
    } else {
      console.log('Remove gift card - error', error);
      return { status: 'error', message: 'Internal error' };
    }
  }
};
type TAddProductToBasket = {
  userId: string;
  productId: number;
  giftForUserId?: string;
};
type TAddProductToBasketResponse =
  | {
      status: 'success';
      data: Basket;
    }
  | {
      status: 'error';
      message:
        | 'Unauthorized'
        | 'Basket does not exist'
        | 'Basket not authorized'
        | 'Internal error'
        | 'Unknown error'
        | 'Basket not found';
      errorMessage?: string;
    };
const addProductToBasket = async ({
  userId,
  productId,
  giftForUserId,
}: TAddProductToBasket): Promise<TAddProductToBasketResponse> => {
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
    const addedProduct = giftForUserId
      ? await GiftPackage(userData.basketIdent, productId, giftForUserId)
      : await AddPackageToBasket(userData.basketIdent, productId, 1, 'single');
    return {
      status: 'success',
      data: addedProduct,
    };
  } catch (error: any) {
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (detail === 'User must login before adding packages to basket') {
        return { status: 'error', message: 'Basket not authorized' };
      } else if (detail === 'Basket not found') {
        return { status: 'error', message: 'Basket not found' };
      } else {
        return { status: 'error', message: 'Unknown error', errorMessage: error.response.data.detail };
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
  giftForUserId?: string;
  pathname: string;
};
type TAddProductResponse =
  | {
      status: 'success';
      data: Basket;
    }
  | {
      status: 'error';
      message:
        | 'Unauthorized'
        | 'Internal error'
        | 'Could not find the basket auth url. Please retry.'
        | 'Basket not authorized'
        | 'Unknown error';
      errorMessage?: string;
    };
export const addProduct = async ({
  ipAddress,
  user,
  productId,
  giftForUserId,
  pathname,
}: TAddProduct): Promise<TAddProductResponse> => {
  if (!ipAddress || !user.id) {
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  }

  const addedProduct = await addProductToBasket({
    productId,
    userId: user.id,
    giftForUserId: giftForUserId,
  });

  if (addedProduct.status === 'success') {
    return {
      status: 'success',
      data: addedProduct.data as Basket,
    };
  } else if (addedProduct.message === 'Basket does not exist' || addedProduct.message === 'Basket not found') {
    const newBasket = await createBasket({
      basketAuthRedirectUrl: pathname,
      ipAddress,
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
        errorMessage: newBasket.authUrl,
      };
    }
  } else if (addedProduct.message === 'Basket not authorized') {
    const userData = await prisma.user.findFirst({
      where: { id: user.id },
      select: { basketAuthUrl: true },
    });
    if (!userData?.basketAuthUrl) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          basketIdent: null,
        },
      });
      return {
        status: 'error',
        message: 'Could not find the basket auth url. Please retry.',
      };
    }
    return {
      status: 'error',
      message: 'Basket not authorized',
      errorMessage: userData.basketAuthUrl,
    };
  } else {
    return {
      status: 'error',
      message: 'Unknown error',
      errorMessage: addedProduct.errorMessage ?? addedProduct.message,
    };
  }
};

type TRemoveProduct = {
  user: NextAuthUser;
  productId: number;
};
type TRemoveProductResponse =
  | {
      status: 'error';
      message: 'Unauthorized' | 'Something went wrong' | 'Unknown error' | 'Internal error' | 'Basket does not exist';
      extraMessage?: string;
    }
  | {
      status: 'success';
      data: Basket;
    };
export const removeProduct = async ({ productId, user }: TRemoveProduct): Promise<TRemoveProductResponse> => {
  if (!user.id) {
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  }
  if (!user.basketIdent) {
    return {
      status: 'error',
      message: 'Basket does not exist',
    };
  }

  SetWebstoreIdentifier(process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER!);

  try {
    const updatedBasket = await RemovePackage(user.basketIdent, productId);
    return {
      status: 'success',
      data: updatedBasket,
    };
  } catch (error: any) {
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      return {
        status: 'error',
        message: 'Unknown error',
        extraMessage: detail,
      };
    } else {
      console.log('Remove product - error', error);
      return { status: 'error', message: 'Internal error' };
    }
  }
};
