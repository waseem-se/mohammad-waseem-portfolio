import { skillGroups } from '@/content/skills'
import { Section, SectionHeader, TechTag } from '@/components/ui/primitives'
import { Reveal } from '@/components/ui/Reveal'

export function Skills() {
  return (
    <Section id="skills">
      <SectionHeader
        id="skills-title"
        index="06"
        eyebrow="Skills"
        title="Technical Surface"
        lede="Grouped by where each sits in a system. No proficiency percentages — the projects above are the evidence."
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => (
          <Reveal as="li" key={group.name} delay={i * 60}>
            <div className="h-full rounded-xl border border-hairline bg-surface/50 p-6">
              <div className="mb-5 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">{group.name}</h3>
                <span className="font-mono text-[0.6875rem] text-dim">
                  {String(group.items.length).padStart(2, '0')}
                </span>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li key={item}>
                    <TechTag>{item}</TechTag>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
