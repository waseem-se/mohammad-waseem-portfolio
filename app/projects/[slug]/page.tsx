import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projects, getProject } from '@/content/projects'
import { profile, seo } from '@/content/profile'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FlowDiagram } from '@/components/diagram/FlowDiagram'
import { Chip, TechTag, ActionLink } from '@/components/ui/primitives'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/icons'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}

  const title = `${project.name} — ${project.category}`
  const description = project.summary

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}/` },
    openGraph: {
      type: 'article',
      title: `${title} | ${profile.name}`,
      description,
      url: `${seo.siteUrl}/projects/${project.slug}/`,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

/** Numbered section wrapper, matching the home page's rhythm. */
function DetailSection({
  index,
  title,
  children,
}: {
  index: string
  title: string
  children: React.ReactNode
}) {
  const id = title.toLowerCase().replace(/\W+/g, '-')
  return (
    <section aria-labelledby={id} className="border-t border-hairline py-12 md:py-16">
      <div className="mono-label mb-6 flex items-center gap-3">
        <span className="text-accent">{index}</span>
        <span aria-hidden className="h-px w-8 bg-hairline-strong" />
        <span>{title}</span>
      </div>
      <h2 id={id} className="sr-only">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const index = projects.findIndex((p) => p.slug === slug)
  const next = projects[(index + 1) % projects.length]

  return (
    <>
      <SiteHeader homeAnchors={false} />

      <main id="main">
        <article>
          {/* Header */}
          <header className="relative">
            <div aria-hidden className="grid-field pointer-events-none absolute inset-0 -z-10" />
            <div className="shell pt-10 pb-14 md:pt-14 md:pb-20">
              <Link
                href="/#projects"
                className="mono-label inline-flex items-center gap-2 transition-colors hover:text-ink"
              >
                <ArrowLeftIcon className="size-3.5" />
                All projects
              </Link>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Chip tone={project.personal ? 'default' : 'accent'}>{project.category}</Chip>
                {project.personal ? <Chip>Personal Project</Chip> : null}
              </div>

              <h1 className="mt-6 max-w-4xl text-[length:var(--text-section)] leading-[1.08] font-semibold tracking-[-0.02em]">
                {project.name}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                {project.summary}
              </p>

              {project.impact.length > 0 || project.outcomes.length > 0 ? (
                <div className="mt-10 border-t border-hairline pt-8">
                  {project.impact.length > 0 ? (
                    <dl className="flex flex-wrap gap-x-14 gap-y-6">
                      {project.impact.map((item) => (
                        <div key={item.label}>
                          <dt className="sr-only">{item.label}</dt>
                          <dd>
                            <span className="block font-mono text-4xl font-semibold tracking-tight text-accent tabular-nums">
                              {item.value}
                            </span>
                            <span className="mt-2 block max-w-[20rem] text-sm leading-snug text-muted">
                              {item.label}
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {project.outcomes.length > 0 ? (
                    <ul
                      className={project.impact.length > 0 ? 'mt-8 space-y-2.5' : 'space-y-2.5'}
                    >
                      {project.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex max-w-2xl gap-3 leading-relaxed text-ink"
                        >
                          <span
                            aria-hidden
                            className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-accent"
                          />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          </header>

          <div className="shell">
            <DetailSection index="01" title="Problem">
              <p className="max-w-3xl text-lg leading-relaxed text-ink">{project.problem}</p>
            </DetailSection>

            <DetailSection index="02" title="Architecture">
              {/* Branching diagrams get the wider track; linear ones stay narrow
                  so the solution copy keeps a readable measure beside them. */}
              <div
                className={
                  project.architecture.lanes?.length
                    ? 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14'
                    : 'grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16'
                }
              >
                <div className="rounded-xl border border-hairline bg-surface p-6 md:p-8">
                  <FlowDiagram graph={project.architecture} title={project.name} />
                </div>
                <div className="lg:pt-2">
                  <h3 className="mono-label mb-4">Solution</h3>
                  <p className="text-base leading-relaxed text-muted">{project.solution}</p>
                </div>
              </div>
            </DetailSection>

            <DetailSection index="03" title="Engineering Decisions">
              <ul className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
                {/* The fill has to be opaque: `gap-px` over `bg-hairline` draws
                    the seams by letting the parent show through the gaps, so a
                    translucent cell bleeds the hairline across the whole card
                    and collapses the seam to a fraction of its weight. */}
                {project.decisions.map((decision, i) => (
                  <li key={decision.heading} className="bg-surface p-6 md:p-7">
                    <div className="mb-4 flex items-baseline gap-3">
                      <span className="font-mono text-xs text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="leading-snug font-medium text-ink">{decision.heading}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted">{decision.body}</p>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection index="04" title="Challenges">
              <ul className="max-w-3xl divide-y divide-hairline">
                {project.challenges.map((challenge) => (
                  <li key={challenge.heading} className="py-6 first:pt-0 last:pb-0">
                    <h3 className="mb-2 font-medium text-ink">{challenge.heading}</h3>
                    <p className="text-sm leading-relaxed text-muted">{challenge.body}</p>
                  </li>
                ))}
              </ul>
            </DetailSection>

            {project.details && project.details.length > 0 ? (
              <DetailSection index="05" title="Technical Detail">
                <div className="max-w-3xl space-y-3">
                  {project.details.map((detail) => (
                    <details
                      key={detail.heading}
                      className="group rounded-lg border border-hairline bg-surface px-5"
                    >
                      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink marker:content-none">
                        {detail.heading}
                        <span
                          aria-hidden
                          className="text-dim transition-transform duration-200 group-open:rotate-45"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          >
                            <path d="M8 3v10M3 8h10" />
                          </svg>
                        </span>
                      </summary>
                      <p className="pb-5 text-sm leading-relaxed text-muted">{detail.body}</p>
                    </details>
                  ))}
                </div>
              </DetailSection>
            ) : null}

            <DetailSection index={project.details?.length ? '06' : '05'} title="Technology">
              <ul className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <li key={t}>
                    <TechTag>{t}</TechTag>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection index={project.details?.length ? '07' : '06'} title="Key Takeaway">
              <p className="max-w-3xl border-l-2 border-accent/50 pl-6 text-lg leading-relaxed text-ink">
                {project.takeaway}
              </p>
            </DetailSection>
          </div>

          {/* Next project */}
          <nav
            aria-label="Project navigation"
            className="border-t border-hairline bg-surface py-12"
          >
            <div className="shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mono-label mb-2">Next project</p>
                <Link
                  href={`/projects/${next?.slug ?? ''}`}
                  className="text-xl font-semibold text-ink transition-colors hover:text-accent"
                >
                  {next?.name}
                </Link>
              </div>
              <ActionLink href="/#projects">
                All projects
                <ArrowRightIcon className="size-4" />
              </ActionLink>
            </div>
          </nav>
        </article>
      </main>

      <SiteFooter />
    </>
  )
}
