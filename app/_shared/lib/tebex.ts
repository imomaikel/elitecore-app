'use server';
import { SetWebstoreIdentifier, GetCategories, GetCategory, Category } from 'tebex_headless';

export const shopGetCategories = async (): Promise<Category[] | []> => {
  SetWebstoreIdentifier(process.env.TEBEX_WEBSTORE_IDENTIFIER!);
  let categories = null;
  try {
    categories = (await GetCategories(true)).filter((entry) => entry.packages.length >= 1);
  } catch (error) {
    console.log('Could not fetch categories', error);
  }
  return categories ?? [];
};

export const shopGetCategory = async (categoryId: number): Promise<Category | null> => {
  SetWebstoreIdentifier(process.env.TEBEX_WEBSTORE_IDENTIFIER!);
  let category = null;
  try {
    category = await GetCategory(categoryId, true);
  } catch (error) {
    console.log('Could not fetch category', error);
  }
  return category ?? null;
};
