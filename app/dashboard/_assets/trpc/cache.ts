'use server';
import { shopGetCategories } from '../../../_shared/lib/tebex';
import { Category } from 'tebex_headless';

let categories: Category[] = [];

export const getCachedCategories = async (): Promise<Category[]> => {
  if (categories.length <= 0) {
    categories = await shopGetCategories();
  }

  return categories;
};
export const refetchCategories = async () => {
  categories = await shopGetCategories();
};
