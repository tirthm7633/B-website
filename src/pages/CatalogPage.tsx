import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { brands } from '../data/content'
import { brandSlug, catalogs } from '../data/catalogs'

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

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 pb-24 md:grid-cols-3 md:gap-6 md:px-12 lg:grid-cols-4">
        {brands.map((brand) => {
          const count = catalogs.filter((c) => c.brand === brand.name).length
          const available = count > 0

          const card = (
            <div
              className={`flex h-full flex-col items-center gap-3 rounded-sm border border-line p-5 transition-colors duration-300 ${
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
              <span className="text-center text-[0.7rem] tracking-[0.15em] text-text uppercase">{brand.name}</span>
              <span className="text-center text-[0.6rem] tracking-[0.15em] text-muted uppercase">
                {available ? `${count} catalog${count > 1 ? 's' : ''}` : 'Coming soon'}
              </span>
            </div>
          )

          return available ? (
            <Link key={brand.name} to={`/catalog/${brandSlug(brand.name)}`}>
              {card}
            </Link>
          ) : (
            <div key={brand.name} aria-disabled="true" title="No catalogs uploaded yet">
              {card}
            </div>
          )
        })}
      </div>
    </div>
  )
}
