import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { contact, seo, site } from '../data/content'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function SEO() {
  const { pathname } = useLocation()

  // The page's own address, so every page names itself (not the homepage) as canonical and as the
  // shared link.
  useEffect(() => {
    const url = `${site.url}${pathname}`
    upsertCanonical(url)
    upsertMeta('property', 'og:url', url)
  }, [pathname])

  useEffect(() => {
    document.title = seo.title
    upsertMeta('name', 'description', seo.description)
    upsertMeta('property', 'og:title', seo.title)
    upsertMeta('property', 'og:description', seo.description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', site.name)
    upsertMeta('property', 'og:image', `${site.url}${seo.ogImage}`)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seo.title)
    upsertMeta('name', 'twitter:description', seo.description)
    upsertMeta('name', 'twitter:image', `${site.url}${seo.ogImage}`)

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: site.legalName,
      description: seo.description,
      url: site.url,
      image: `${site.url}${seo.ogImage}`,
      logo: `${site.url}${site.logo.src}`,
      telephone: contact.phoneHref.replace('tel:', ''),
      ...(contact.email ? { email: contact.email } : {}),
      address: {
        '@type': 'PostalAddress',
        streetAddress: contact.address.full,
        addressLocality: 'Rajkot',
        addressRegion: 'Gujarat',
        postalCode: '360005',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: contact.geo.lat,
        longitude: contact.geo.lng,
      },
      openingHoursSpecification: contact.hours.flatMap((h) =>
        h.schema ? [{ '@type': 'OpeningHoursSpecification', ...h.schema }] : [],
      ),
      sameAs: [contact.instagramHref],
    }

    let script = document.querySelector<HTMLScriptElement>('script#local-business-schema')
    if (!script) {
      script = document.createElement('script')
      script.id = 'local-business-schema'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)
  }, [])

  return null
}
