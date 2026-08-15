import Link from 'next/link'
import { projects } from '@/content/projects'
import { FlowPreview } from '@/components/diagram/FlowDiagram'
import { Chip, Section, SectionHeader, TechTag } from '@/components/ui/primitives'
import { Reveal } from '@/components/ui/Reveal'
import { ArrowRightIcon } from '@/components/ui/icons'

export function Projects() {
  return (
    <Section id="projects">
      <SectionHeader
        id="projects-title"
        index="04"
        eyebrow="Projects"
        title="Featured Projects"
        lede="Systems built end to end — retrieval, orchestration, generation, and the validation layers that make the output safe to depend on."
      />

      <ul className="space-y-5">
        {projects.map((project, i) => (
          <Reveal as="li" key={project.slug} delay={i * 60}>
            <article className="group relative rounded-xl border border-hairline bg-surface transition-colors duration-300 hover:border-hairline-strong">
              <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
                <div className="min-w-0">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <Chip tone={project.personal ? 'default' : 'accent'}>{project.category}</Chip>
                    {project.personal ? <Chip>Personal Project</Chip> : null}
                  </div>

                  <h3 className="text-xl leading-tight font-semibold text-ink md:text-2xl">
                    {/*
                      Stretched link: the whole card is the hit target, while the
                      accessible name stays the project title alone.
                    */}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:text-accent focus-visible:outline-none"
                    >
                      {project.name}
                    </Link>
                  </h3>

                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                    {project.summary}
                  </p>

                  {project.impact.length > 0 ? (
                    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                      {project.impact.map((item) => (
                        <div key={item.label}>
                          <dt className="sr-only">{item.label}</dt>
                          <dd>
                            <span className="block font-mono text-2xl font-semibold text-accent tabular-nums">
                              {item.value}
                            </span>
                            <span className="mt-1 block max-w-[18rem] text-xs leading-snug text-dim">
                              {item.label}
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {/* Qualitative results, for work the resume does not quantify. */}
                  {project.outcomes.length > 0 ? (
                    <ul className="mt-6 space-y-2">
                      {project.outcomes.map((outcome) => (
                        <li key={outcome} className="flex gap-3 text-sm leading-snug text-muted">
                          <span
                            aria-hidden
                            className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-accent"
                          />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {project.tech.slice(0, 6).map((t) => (
                      <li key={t}>
                        <TechTag subtle>{t}</TechTag>
                      </li>
                    ))}
                    {project.tech.length > 6 ? (
                      <li>
                        <TechTag subtle>+{project.tech.length - 6}</TechTag>
                      </li>
                    ) : null}
                  </ul>

                  <p className="mt-7 inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors group-hover:text-accent">
                    View case study
                    <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </p>
                </div>

                {/* Architecture preview */}
                <div className="min-w-0 lg:border-l lg:border-hairline lg:pl-10">
                  <p className="mono-label mb-4">Architecture</p>
                  <FlowPreview graph={project.architecture} />
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
