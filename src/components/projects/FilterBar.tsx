import { useEffect, useState } from 'react'
import { CATEGORY_LABELS, type ProjectCategory } from '../../data/projects'

interface FilterBarProps {
  availableCategories: ProjectCategory[]
  availableClientTypes: string[]
  availableLocations: string[]
  activeCategories: ProjectCategory[]
  activeClientTypes: string[]
  activeLocations: string[]
  onToggleCategory: (value: ProjectCategory) => void
  onToggleClientType: (value: string) => void
  onToggleLocation: (value: string) => void
  onClearAll: () => void
  resultCount: number
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-[0.65rem] tracking-[0.15em] uppercase transition-colors duration-300 ${
        active ? 'border-accent-bright bg-accent-bright/10 text-accent-bright' : 'border-line text-muted hover:border-accent hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

export default function FilterBar({
  availableCategories,
  availableClientTypes,
  availableLocations,
  activeCategories,
  activeClientTypes,
  activeLocations,
  onToggleCategory,
  onToggleClientType,
  onToggleLocation,
  onClearAll,
  resultCount,
}: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const activeCount = activeCategories.length + activeClientTypes.length + activeLocations.length

  useEffect(() => {
    if (!sheetOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

  useEffect(() => {
    if (!sheetOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen])

  const groups = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[0.6rem] tracking-[0.2em] text-muted uppercase">Category</span>
        <Pill active={activeCategories.length === 0} onClick={() => activeCategories.forEach(onToggleCategory)}>
          All
        </Pill>
        {availableCategories.map((c) => (
          <Pill key={c} active={activeCategories.includes(c)} onClick={() => onToggleCategory(c)}>
            {CATEGORY_LABELS[c] ?? c}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[0.6rem] tracking-[0.2em] text-muted uppercase">Client Type</span>
        <Pill active={activeClientTypes.length === 0} onClick={() => activeClientTypes.forEach(onToggleClientType)}>
          All
        </Pill>
        {availableClientTypes.map((c) => (
          <Pill key={c} active={activeClientTypes.includes(c)} onClick={() => onToggleClientType(c)}>
            {c}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[0.6rem] tracking-[0.2em] text-muted uppercase">Location</span>
        <Pill active={activeLocations.length === 0} onClick={() => activeLocations.forEach(onToggleLocation)}>
          All
        </Pill>
        {availableLocations.map((c) => (
          <Pill key={c} active={activeLocations.includes(c)} onClick={() => onToggleLocation(c)}>
            {c}
          </Pill>
        ))}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop / tablet: sticky inline bar */}
      <div
        className="sticky top-[88px] z-30 mx-auto hidden w-full max-w-6xl flex-col gap-3 border-b border-line bg-bg/90 px-6 py-5 backdrop-blur-md md:top-[104px] md:flex md:px-12"
        aria-label="Filter projects"
      >
        {groups}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="self-start text-[0.65rem] tracking-[0.15em] text-accent-bright uppercase transition-colors duration-300 hover:text-text"
          >
            Clear filters ({activeCount})
          </button>
        )}
      </div>

      {/* Mobile: trigger button + slide-up sheet */}
      <div className="sticky top-[76px] z-30 flex items-center justify-between border-b border-line bg-bg/90 px-6 py-4 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.65rem] tracking-[0.2em] text-text uppercase"
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
        <span className="text-[0.65rem] tracking-[0.15em] text-muted uppercase">{resultCount} projects</span>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => setSheetOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter projects"
            className="relative max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface px-6 pb-8 pt-5"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <div className="mb-4 flex items-center justify-between">
              <span className="eyebrow">Filters</span>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close filters" className="text-text">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-5">{groups}</div>
            <div className="mt-6 flex items-center gap-4">
              {activeCount > 0 && (
                <button type="button" onClick={onClearAll} className="text-[0.7rem] tracking-[0.15em] text-accent-bright uppercase">
                  Clear filters ({activeCount})
                </button>
              )}
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="ml-auto rounded-full border border-accent px-6 py-2.5 text-[0.7rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright"
              >
                Show {resultCount} projects
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
