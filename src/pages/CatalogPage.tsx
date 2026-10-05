import { Link } from 'react-router-dom'
import BrandCategoryGroups from '../components/BrandCategoryGroups'
import BrandLogo from '../components/BrandLogo'
import { brandSlug, catalogs } from '../data/catalogs'
import type { Brand } from '../data/content'

function BrandTile({ brand }: { brand: Brand }) {
  const count = catalogs.filter((c) => c.brand === brand.name).length
  const available = count > 0

  const card = (
    <div
      className={`flex h-full flex-col items-center gap-3 rounded-sm border border-line p-4 transition-colors lg:p-5 duration-300 ${
        available ? 'hover:border-accent hover:text-accent-bright' : 'opacity-40'
      }`}
    >
      <BrandLogo
        src={brand.logo}
        alt={`${brand.name} logo`}
        fallbackLabel={brand.name}
        plate={brand.plate}
        className="h-20 w-full"
      />
      <span className="text-center text-[0.7rem] leading-snug tracking-[0.15em] text-text uppercase">{brand.name}</span>
      <span className="mt-auto text-center text-[0.6rem] tracking-[0.15em] text-muted uppercase">
        {available ? `${count} catalog${count > 1 ? 's' : ''}` : 'Coming soon'}
      </span>
    </div>
  )

  return available ? (
    <Link to={`/catalog/${brandSlug(brand.name)}`}>{card}</Link>
  ) : (
    <div aria-disabled="true" title="No catalogs uploaded yet">
      {card}
    </div>
  )
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-bg pt-28 md:pt-32">
      <div className="px-6 pb-10 pt-4 text-center md:px-12 md:pb-14">
        <span className="eyebrow">Resources</span>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-light text-text md:text-5xl lg:text-6xl">
          Download Our Catalogs
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
          Browse product catalogs from the brands we bring together — pick a brand to see what&rsquo;s available.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-24 md:px-12">
        <BrandCategoryGroups anchorPrefix="catalog-" renderBrand={(brand) => <BrandTile key={brand.name} brand={brand} />} />
      </div>
    </div>
  )
}
