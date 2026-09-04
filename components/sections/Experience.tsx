import { Section, SectionHeader } from '@/components/ui/primitives'
import { CareerChart } from '@/components/sections/CareerChart'
import { ImpactChart } from '@/components/sections/ImpactChart'
import { ExperienceTimeline } from '@/components/sections/ExperienceTimeline'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Experience, in three passes over the same data: the shape of the career, the
 * outcomes it produced, and then the detail behind each role.
 *
 * A server component. Only the disclosure set below needs state, and it holds
 * its own — which is why it lives in ExperienceTimeline.tsx rather than forcing
 * this shell and the two charts across the client boundary with it.
 */
export function Experience() {
  return (
    <Section id="experience">
      <SectionHeader
        id="experience-title"
        index="03"
        eyebrow="Experience"
        title="Career Timeline"
        lede="Five years across two companies, moving from .NET backend systems into production GenAI engineering."
      />

      {/* Block label, matching the `Problem Solving` and `Footprint` blocks. It
          also keeps the heading hierarchy intact: without it the section's h2
          runs straight into the charts' h4 titles. */}
      <h3 className="mono-label mb-5">Overview</h3>

      <div className="mb-14 space-y-5">
        <Reveal>
          <CareerChart />
        </Reveal>
        <Reveal delay={60}>
          <ImpactChart />
        </Reveal>
      </div>

      <ExperienceTimeline />
    </Section>
  )
}
