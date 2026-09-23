import { contact, footer, site } from '../data/content'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg px-6 py-14 md:px-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo className="h-11" />
          <p className="mt-4 font-tagline text-3xl text-accent">{site.tagline}</p>
        </div>

        <div>
          <h3 className="eyebrow text-[0.6rem]">Quick Links</h3>
          <ul className="mt-4 space-y-2">
            {footer.quickLinks.map((link) => (
              <li key={link.href}>
                {/* Absolute path (not a bare "#hash"): Footer now renders
                    on every page (see App.tsx), and a bare hash would just
                    tack onto the current URL instead of navigating home
                    first when clicked from e.g. /projects. */}
                <a
                  href={`/${link.href}`}
                  className="text-[0.7rem] tracking-[0.15em] text-muted uppercase transition-colors hover:text-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-[0.6rem]">Visit Us</h3>
          <p className="mt-4 text-sm font-light text-muted">
            {contact.address.line1}
            <br />
            {contact.address.line2}
          </p>
          <a href={contact.phoneHref} className="mt-3 block text-sm text-text hover:text-accent">
            {contact.phoneDisplay}
          </a>
          <a
            href={contact.instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-sm text-text hover:text-accent"
          >
            {contact.instagramHandle}
          </a>
        </div>
      </div>

      <div className="mt-12 flex flex-col justify-between gap-2 border-t border-line pt-6 text-[0.65rem] tracking-wide text-muted uppercase md:flex-row">
        <span>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</span>
        <span>{site.tagline}</span>
      </div>
    </footer>
  )
}
