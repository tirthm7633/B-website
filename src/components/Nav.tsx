import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { nav as navLinks } from '../data/content'
import BrandsPanel from './BrandsPanel'
import EnquirePopover from './EnquirePopover'
import Logo from './Logo'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [brandsOpen, setBrandsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > window.innerHeight * 0.7)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => {
    setOpen(false)
    const overlay = overlayRef.current
    if (!overlay) return
    gsap.to(overlay, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: () => gsap.set(overlay, { display: 'none' }),
    })
  }

  const toggle = () => {
    if (open) {
      closeMenu()
      return
    }
    setOpen(true)
    const overlay = overlayRef.current
    const links = linksRef.current?.querySelectorAll('a, button') ?? []
    if (!overlay) return
    gsap.set(overlay, { display: 'flex' })
    gsap.fromTo(overlay, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power4.inOut' })
    gsap.fromTo(links, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, delay: 0.3, ease: 'power2.out' })
  }

  const openBrandsFromMenu = () => {
    closeMenu()
    setBrandsOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-gradient-to-b from-black/55 to-transparent transition-opacity duration-700 ${
          scrolled ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <header
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-colors duration-700 md:px-12 ${
          scrolled ? 'bg-bg/85 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <a href="#top" aria-label="Buildcon House — home">
          <Logo className="h-11 md:h-[52px] lg:h-[60px]" />
        </a>

        <div className="flex items-center gap-6 lg:gap-8">
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[0.7rem] tracking-[0.2em] text-muted uppercase transition-colors duration-300 hover:text-accent-bright"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <EnquirePopover />

          <button
            type="button"
            onClick={() => setBrandsOpen(true)}
            className="hidden text-[0.7rem] tracking-[0.2em] text-muted uppercase transition-colors duration-300 hover:text-accent-bright lg:inline"
          >
            Brands
          </button>

          <button
            type="button"
            onClick={toggle}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <span className={`h-px w-6 bg-text transition-transform duration-300 ${open ? 'translate-y-[3.5px] rotate-45' : ''}`} />
            <span className={`h-px w-6 bg-text transition-transform duration-300 ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={overlayRef}
        className="fixed inset-0 z-40 hidden flex-col items-center justify-center gap-7 bg-bg"
        style={{ clipPath: 'inset(0 0 100% 0)' }}
      >
        <div ref={linksRef} className="flex flex-col items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="font-display text-5xl font-light text-text transition-colors duration-300 hover:text-accent-bright md:text-7xl"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={openBrandsFromMenu}
            className="font-display text-5xl font-light text-text transition-colors duration-300 hover:text-accent-bright md:text-7xl"
          >
            Brands
          </button>
        </div>
      </div>

      <BrandsPanel open={brandsOpen} onClose={() => setBrandsOpen(false)} />
    </>
  )
}
