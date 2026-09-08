import { Section, SectionHeader } from '@/components/ui/primitives'
import { CareerChart } from '@/components/sections/CareerChart'
import { ExperienceTimeline } from '@/components/sections/ExperienceTimeline'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Experience, in two passes over the same data: the shape of the career, and
 * then the detail behind each role.
 *
 * There was a third pass — a bar chart of the impact figures — sitting between
 * them. It went because those figures already appear twice elsewhere: once in
 * MetricsStrip at the top of the page, and again in context on the role that
 * produced each one, in the disclosures below. Ranking them against each other
 * was never a comparison that meant anything either, since a fall in token
 * usage and a fall in processing time are unrelated quantities.
 *
 * A server component. Only the disclosure set below needs state, and it holds
 * its own — which is why it lives in ExperienceTimeline.tsx rather than forcing
 * this shell and the chart across the client boundary with it.
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
          runs straight into the chart's h4 title. */}
      <h3 className="mono-label mb-5">Overview</h3>

      <Reveal className="mb-14">
        <CareerChart />
      </Reveal>

      <ExperienceTimeline />
    </Section>
  )
}
