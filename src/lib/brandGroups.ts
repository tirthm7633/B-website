import { brands, categories, type Brand, type Category } from '../data/content'

export interface BrandCategoryGroup {
  category: Category
  brands: Brand[]
}

// One group per category, in the order `categories` is declared in
// content.ts (Sanitaryware, Tiles, Kitchen, Wellness, Furniture) — empty
// categories are kept so the UI can show a "coming soon" line for them.
// Brands within a group keep the order of the `brands` array.
export const brandCategoryGroups: BrandCategoryGroup[] = categories.map((category) => ({
  category,
  brands: brands.filter((brand) => brand.category === category.name),
}))
