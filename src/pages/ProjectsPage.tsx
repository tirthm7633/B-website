import { useMemo, useState } from 'react'
import FilterBar from '../components/projects/FilterBar'
import ProjectCard from '../components/projects/ProjectCard'
import { projects, type ProjectCategory } from '../data/projects'

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function ProjectsPage() {
  const [activeCategories, setActiveCategories] = useState<ProjectCategory[]>([])
  const [activeClientTypes, setActiveClientTypes] = useState<string[]>([])
  const [activeLocations, setActiveLocations] = useState<string[]>([])

  const availableCategories = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.categories))) as ProjectCategory[],
    [],
  )
  const availableClientTypes = useMemo(() => Array.from(new Set(projects.map((p) => p.clientType))), [])
  const availableLocations = useMemo(() => Array.from(new Set(projects.map((p) => p.location))), [])

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (activeCategories.length === 0 || p.categories.some((c) => activeCategories.includes(c))) &&
          (activeClientTypes.length === 0 || activeClientTypes.includes(p.clientType)) &&
          (activeLocations.length === 0 || activeLocations.includes(p.location)),
      ),
    [activeCategories, activeClientTypes, activeLocations],
  )

  const clearAll = () => {
    setActiveCategories([])
    setActiveClientTypes([])
    setActiveLocations([])
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="px-6 pt-32 pb-10 text-center md:px-12 md:pt-40 md:pb-14">
        <span className="eyebrow">Our Work</span>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-light text-text md:text-5xl lg:text-6xl">
          Projects We&rsquo;ve Brought to Life
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
          A look at real homes and workspaces fitted out with the brands we bring together.
        </p>
      </div>

      <FilterBar
        availableCategories={availableCategories}
        availableClientTypes={availableClientTypes}
        availableLocations={availableLocations}
        activeCategories={activeCategories}
        activeClientTypes={activeClientTypes}
        activeLocations={activeLocations}
        onToggleCategory={(c) => setActiveCategories((prev) => toggleValue(prev, c))}
        onToggleClientType={(c) => setActiveClientTypes((prev) => toggleValue(prev, c))}
        onToggleLocation={(c) => setActiveLocations((prev) => toggleValue(prev, c))}
        onClearAll={clearAll}
        resultCount={filtered.length}
      />

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-12 md:py-14">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="font-display text-2xl font-light text-text">No projects match those filters.</p>
            <p className="text-sm text-muted">Try a different combination, or clear everything and start again.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-2 rounded-full border border-accent px-6 py-2.5 text-[0.7rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
