import { Link } from 'react-router-dom'
import type { Project } from '../../data/projects'

export default function ProjectCard({ project }: { project: Project }) {
  const brandTags = Array.from(new Set(project.productsUsed.map((p) => p.brand))).slice(0, 3)

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-line transition-colors duration-300 hover:border-accent"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.images[0]}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-line bg-bg/80 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-text uppercase backdrop-blur-sm">
          {project.clientType}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-xl font-light text-text">{project.title}</h3>
          <p className="mt-1 text-[0.7rem] tracking-[0.15em] text-muted uppercase">{project.location}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          {brandTags.map((brand) => (
            <span key={brand} className="rounded-full border border-line px-3 py-1 text-[0.6rem] tracking-[0.15em] text-muted uppercase">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
