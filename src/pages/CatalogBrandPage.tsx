import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import ConsultationModal, { type ConsultationContext } from '../components/ConsultationModal'
import { brandSlug, catalogs } from '../data/catalogs'
import { brands } from '../data/content'
import { CATEGORY_LABELS } from '../data/projects'

export default function CatalogBrandPage() {
  const { brandSlug: slugParam } = useParams<{ brandSlug: string }>()
  const brand = brands.find((b) => brandSlug(b.name) === slugParam)
  const brandCatalogs = brand ? catalogs.filter((c) => c.brand === brand.name) : []
  const [activeContext, setActiveContext] = useState<ConsultationContext | null>(null)

  if (!brand || brandCatalogs.length === 0) return <Navigate to="/catalog" replace />

  return (
    <div className="min-h-screen bg-bg pt-28 md:pt-32">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-muted uppercase transition-colors duration-300 hover:text-accent-bright"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
          </svg>
          All Catalogs
        </Link>

        <div className="mt-6 flex items-center gap-5">
          <BrandLogo
            src={brand.logo}
            alt={`${brand.name} logo`}
            fallbackLabel={brand.name}
            plate={brand.plate}
            className="h-16 w-32 shrink-0 md:h-20 md:w-40"
          />
          <h1 className="font-display text-3xl font-light text-text md:text-4xl">{brand.name}</h1>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-2 md:px-12 lg:grid-cols-3">
        {brandCatalogs.map((catalog) => (
          <button
            key={catalog.id}
            type="button"
            onClick={() =>
              setActiveContext({
                source: 'catalog',
                catalogId: catalog.id,
                catalogTitle: catalog.title,
                brand: catalog.brand,
                filePath: catalog.filePath,
                primaryCategory: catalog.categories[0],
              })
            }
            className="group flex flex-col overflow-hidden rounded-sm border border-line text-left transition-colors duration-300 hover:border-accent"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={catalog.coverImage}
                alt={catalog.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <h3 className="font-display text-lg font-light text-text">{catalog.title}</h3>
              <div className="flex flex-wrap gap-2">
                {catalog.categories.map((c) => (
                  <span key={c} className="rounded-full border border-line px-3 py-1 text-[0.6rem] tracking-[0.15em] text-muted uppercase">
                    {CATEGORY_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
              <span className="mt-auto text-[0.65rem] tracking-[0.15em] text-accent-bright uppercase">{catalog.fileSize} · PDF</span>
            </div>
          </button>
        ))}
      </div>

      {activeContext && (
        <ConsultationModal open={activeContext !== null} onClose={() => setActiveContext(null)} context={activeContext} />
      )}
    </div>
  )
}
