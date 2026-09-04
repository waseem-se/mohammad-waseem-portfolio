import { principles } from '@/content/philosophy'
import { Section, SectionHeader } from '@/components/ui/primitives'
import { Reveal } from '@/components/ui/Reveal'

export function Philosophy() {
  return (
    <Section id="philosophy">
      <SectionHeader
        id="philosophy-title"
        index="02"
        eyebrow="Principles"
        title="How I Think About AI Systems"
        lede="Four constraints I design against. They are the reason the systems below have validation layers and fallback paths rather than just prompts."
      />

      {/* Four across at `2xl` assumes `principles.length === 4`. The `gap-px`
          seams over `bg-hairline` are column-count agnostic, but a ragged
          trailing cell shows through as a tinted block rather than as nothing —
          the same trap MetricsStrip documents. Revisit if a principle is added
          or removed. */}
      <ul className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2 2xl:grid-cols-4">
        {principles.map((principle, i) => (
          <Reveal as="li" key={principle.title} delay={i * 70} className="bg-canvas">
            <div className="h-full bg-surface p-7 md:p-8">
              <div className="mb-5 flex items-baseline gap-3">
                <span className="font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg leading-snug font-semibold text-ink">{principle.title}</h3>
              </div>
              <p className="measure text-sm leading-relaxed text-muted">{principle.body}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
