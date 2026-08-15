import Image from 'next/image'
import { about, profile } from '@/content/profile'
import { education, accomplishments } from '@/content/experience'
import { Section, SectionHeader } from '@/components/ui/primitives'
import { Reveal } from '@/components/ui/Reveal'

export function About() {
  return (
    <Section id="about">
      <SectionHeader
        id="about-title"
        index="01"
        eyebrow="About"
        title="About Me"
        lede={about.lead}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-16">
        <Reveal>
          <div className="space-y-5">
            {about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-base leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </div>

          <p className="mt-8 border-l-2 border-accent/50 pl-5 text-lg leading-snug font-medium text-ink">
            {about.emphasis}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="space-y-8">
            {/* Photo slot. Renders nothing until a real photograph is supplied. */}
            {profile.photo ? (
              <div className="relative aspect-4/5 w-40 overflow-hidden rounded-xl border border-hairline">
                <Image
                  src={profile.photo.src}
                  alt={profile.photo.alt}
                  fill
                  loading="lazy"
                  sizes="160px"
                  className="object-cover grayscale"
                />
              </div>
            ) : null}

            <div>
              <h3 className="mono-label mb-4">Education</h3>
              <p className="text-sm font-medium text-ink">{education.school}</p>
              <p className="mt-1 text-sm text-muted">{education.degree}</p>
              <p className="mt-2 font-mono text-xs text-dim">
                {education.period} · {education.location}
              </p>
            </div>

            <div>
              <h3 className="mono-label mb-4">Leadership</h3>
              <ul className="space-y-3">
                {accomplishments.map((item) => (
                  <li key={item.slice(0, 24)} className="text-sm leading-relaxed text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mono-label mb-4">Based in</h3>
              <p className="text-sm text-muted">{profile.location}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
