import { useEffect } from 'react'
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

export default function SEO() {
  useEffect(() => {
    document.title = seo.title
    upsertMeta('name', 'description', seo.description)
    upsertMeta('property', 'og:title', seo.title)
    upsertMeta('property', 'og:description', seo.description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:url', site.url)
    upsertMeta('property', 'og:image', `${site.url}${seo.ogImage}`)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seo.title)
    upsertMeta('name', 'twitter:description', seo.description)

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: site.legalName,
      description: seo.description,
      url: site.url,
      telephone: contact.phoneHref.replace('tel:', ''),
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
