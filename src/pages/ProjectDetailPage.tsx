import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import ConsultationModal from '../components/ConsultationModal'
import Lightbox from '../components/projects/Lightbox'
import { CATEGORY_LABELS, projects } from '../data/projects'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const project = projects.find((p) => p.id === id)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [consultationOpen, setConsultationOpen] = useState(false)

  if (!project) return <Navigate to="/projects" replace />

  return (
    <div className="min-h-screen bg-bg pt-28 md:pt-32">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-muted uppercase transition-colors duration-300 hover:text-accent-bright"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
          </svg>
          All Projects
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-line px-3 py-1 text-[0.65rem] tracking-[0.15em] text-text uppercase">
            {project.clientType}
          </span>
          <span className="text-[0.7rem] tracking-[0.15em] text-muted uppercase">{project.location}</span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-light text-text md:text-5xl">{project.title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted md:text-base">{project.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.productsUsed.map((p) => (
            <span
              key={`${p.brand}-${p.category}`}
              className="rounded-full border border-line px-3 py-1 text-[0.6rem] tracking-[0.15em] text-muted uppercase"
            >
              {p.brand} · {p.category}
            </span>
          ))}
          {project.categories.map((c) => (
            <span
              key={c}
              className="rounded-full border border-accent/50 px-3 py-1 text-[0.6rem] tracking-[0.15em] text-accent-bright uppercase"
            >
              {CATEGORY_LABELS[c] ?? c}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setConsultationOpen(true)}
          className="mt-8 rounded-full border border-accent px-6 py-3 text-[0.7rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright"
        >
          Book a Consultation for a Similar Project
        </button>
      </div>

      {project.beforeAfter && project.beforeAfter.length > 0 && (
        <div className="mx-auto mt-14 max-w-5xl px-6 md:px-12">
          <span className="eyebrow">Before &amp; After</span>
          <div className="mt-4 flex flex-col gap-8">
            {project.beforeAfter.map((pair, i) => (
              <BeforeAfterSlider key={i} before={pair.before} after={pair.after} alt={project.title} />
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mt-14 max-w-5xl px-6 pb-24 md:px-12">
        <span className="eyebrow">Gallery</span>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {project.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square overflow-hidden rounded-sm border border-line"
            >
              <img
                src={src}
                alt={`${project.title} — photo ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={project.images}
          index={lightboxIndex}
          alt={project.title}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      <ConsultationModal
        open={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        context={{ source: 'project', projectId: project.id, projectTitle: project.title }}
      />
    </div>
  )
}
