'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { companies } from '@/content/experience'
import type { Highlight } from '@/content/types'
import { Section, SectionHeader, TechTag } from '@/components/ui/primitives'

/**
 * Career timeline as an accessible disclosure set.
 *
 * Each role is a `button` controlling its own panel — `aria-expanded` and
 * `aria-controls` carry the state, so the whole timeline is operable with
 * Tab + Enter/Space and reads correctly in a screen reader's forms mode.
 * The current role starts open; the rest collapse so the progression is
 * scannable before it is read.
 */

function HighlightRow({ highlight }: { highlight: Highlight }) {
  return (
    <li className="border-t border-hairline py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          {highlight.name ? (
            <p className="mb-1.5 font-medium text-ink">{highlight.name}</p>
          ) : null}
          <p className="text-sm leading-relaxed text-muted">{highlight.body}</p>
          {highlight.tech ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {highlight.tech.map((t) => (
                <li key={t}>
                  <TechTag subtle>{t}</TechTag>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {highlight.impact ? (
          <p className="shrink-0 sm:w-36 sm:text-right">
            <span className="font-mono text-xl font-semibold text-accent tabular-nums">
              {highlight.impact.value}
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-dim">
              {highlight.impact.label}
            </span>
          </p>
        ) : null}
      </div>
    </li>
  )
}

export function Experience() {
  const allRoles = companies.flatMap((c) => c.roles.map((r) => `${c.name}::${r.title}`))
  const initiallyOpen = companies
    .flatMap((c) => c.roles.map((r) => ({ key: `${c.name}::${r.title}`, current: r.current })))
    .filter((r) => r.current)
    .map((r) => r.key)

  const [open, setOpen] = useState<string[]>(
    initiallyOpen.length > 0 ? initiallyOpen : allRoles.slice(0, 1),
  )

  const toggle = (key: string) =>
    setOpen((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  return (
    <Section id="experience">
      <SectionHeader
        id="experience-title"
        index="03"
        eyebrow="Experience"
        title="Career Timeline"
        lede="Five years across two companies, moving from .NET backend systems into production GenAI engineering."
      />

      <div className="space-y-14">
        {companies.map((company) => (
          <div key={company.name}>
            {/* Company band */}
            <div className="mb-8 flex flex-col gap-1 border-b border-hairline-strong pb-5 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="text-xl font-semibold text-ink">{company.name}</h3>
              <p className="font-mono text-xs text-dim">
                {company.period} · {company.location}
              </p>
            </div>

            {/* Roles, most recent first */}
            <ol className="relative">
              {company.roles.map((role, i) => {
                const key = `${company.name}::${role.title}`
                const isOpen = open.includes(key)
                const panelId = `panel-${key.replace(/\W+/g, '-').toLowerCase()}`
                const buttonId = `${panelId}-button`
                const isLast = i === company.roles.length - 1

                return (
                  <li key={key} className="relative pl-8 sm:pl-10">
                    {/* Rail */}
                    {!isLast ? (
                      <span
                        aria-hidden
                        className="absolute top-3 left-[5px] h-full w-px bg-hairline-strong sm:left-[7px]"
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute top-[9px] left-0 size-3 rounded-full border-2 sm:left-0.5',
                        role.current
                          ? 'border-accent bg-accent/25'
                          : 'border-hairline-strong bg-canvas',
                      )}
                    />

                    <div className={cn('pb-8', isLast && 'pb-0')}>
                      <h4>
                        <button
                          type="button"
                          id={buttonId}
                          onClick={() => toggle(key)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className="group flex w-full items-start justify-between gap-4 rounded-md py-1 text-left"
                        >
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2.5">
                              <span className="font-medium text-ink transition-colors group-hover:text-accent">
                                {role.title}
                              </span>
                              {role.current ? (
                                <span className="rounded-full border border-accent/35 bg-accent-soft px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.1em] text-accent uppercase">
                                  Current
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-1 block font-mono text-xs text-dim">
                              {role.period}
                            </span>
                          </span>

                          <span
                            aria-hidden
                            className={cn(
                              'mt-1.5 shrink-0 text-dim transition-transform duration-300',
                              isOpen && 'rotate-45',
                            )}
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
                        </button>
                      </h4>

                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!isOpen}
                        className="mt-5"
                      >
                        <ul>
                          {role.highlights.map((highlight) => (
                            <HighlightRow key={highlight.body.slice(0, 40)} highlight={highlight} />
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </Section>
  )
}
