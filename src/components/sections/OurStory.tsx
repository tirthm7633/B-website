import { ourStory } from '../../data/content'
import Reveal from '../Reveal'
import SmartImage from '../SmartImage'

/**
 * PLACEHOLDER CONTENT — the story text lives in content.ts (`ourStory`) and is invented
 * until the real founding details are supplied.
 *
 * Editorial and quiet: lots of air, a large serif pull-quote heading, a serif lead and a
 * lighter supporting paragraph, beside one image. Two columns from desktop (1024px) up; on
 * tablet and phones it stacks, text first, then the image.
 */
export default function OurStory() {
  return (
    <section id="our-story" className="border-t border-line px-6 py-32 md:px-12 md:py-40">
      <div className="grid grid-cols-1 items-center gap-16 md:gap-20 lg:grid-cols-[1.1fr_1fr] lg:gap-28">
        <Reveal className="flex flex-col gap-8">
          <div className="eyebrow flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {ourStory.eyebrow}
          </div>
          <div role="heading" aria-level={2} className="font-display text-4xl leading-[1.1] font-light text-text md:text-5xl lg:text-6xl">
            {ourStory.heading}
          </div>
          <div className="flex max-w-xl flex-col gap-6">
            <p className="font-display text-xl leading-relaxed font-light text-text/85 md:text-2xl">{ourStory.lead}</p>
            <p className="text-base leading-relaxed font-light text-muted">{ourStory.body}</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="relative">
            <div className="pointer-events-none absolute -right-4 -bottom-4 h-full w-full border border-accent/50 md:-right-6 md:-bottom-6" />
            <div className="relative aspect-[4/3] overflow-hidden">
              <SmartImage
                src={ourStory.image.src}
                alt={ourStory.image.alt}
                objectPosition={ourStory.image.objectPosition}
                className="h-full w-full"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
