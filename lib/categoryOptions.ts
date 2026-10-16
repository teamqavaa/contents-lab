// lib/categoryOptions.ts — catégories racines + sous-catégories à plat pour un <select>
import type { CatalogCategory } from '@/actions/catalog';

export function flattenCategories(categories: CatalogCategory[], prefix = ''): { id: string; label: string }[] {
  return categories.flatMap((category) => [
    { id: category.id, label: `${prefix}${category.name}` },
    ...flattenCategories(category.subcategories || [], `${prefix}${category.name} › `),
  ]);
}
