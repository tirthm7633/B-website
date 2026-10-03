import type { ReactNode } from 'react'
import type { Brand } from '../data/content'
import { brandCategoryGroups } from '../lib/brandGroups'

interface BrandCategoryGroupsProps {
  renderBrand: (brand: Brand) => ReactNode
}

// Both the Brands panel and the Catalog page render through this component
// so their grouping, spacing and tile grid can never drift apart. Every
// category shares the identical grid (2 columns on phones, 4 from tablet up —
// no category has more than 4 brands, so every group sits on one row from
// tablet up and never leaves a lone tile on a second row), so a tile is the
// same size in every group, and a category with a single brand simply fills
// the first cell, left-aligned at that same size, instead of stretching.
// Rhythm: 40-48px above and below each hairline divider, 24px between a
// label and its tiles.
export default function BrandCategoryGroups({ renderBrand }: BrandCategoryGroupsProps) {
  return (
    <div>
      {brandCategoryGroups.map(({ category, brands }, index) => (
        <section
          key={category.slug}
          aria-label={category.name}
          className={index === 0 ? '' : 'mt-10 border-t border-line pt-10 md:mt-12 md:pt-12'}
        >
          {/* Not an <h2>: index.css has an unlayered h1-h4 rule (margin 0, display font,
              weight 400) that would beat the spacing utilities and make this heavier
              than the other .eyebrow labels. role=heading keeps the semantics. */}
          <div role="heading" aria-level={2} className="eyebrow mb-6">
            {category.name}
          </div>
          {brands.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              {brands.map((brand) => renderBrand(brand))}
            </div>
          ) : (
            <p className="text-[0.6rem] tracking-[0.15em] text-muted uppercase">New brands coming soon</p>
          )}
        </section>
      ))}
    </div>
  )
}
