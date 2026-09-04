'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { companies } from '@/content/experience'
import type { Highlight } from '@/content/types'
import { formatRange } from '@/lib/dates'
import { TechTag } from '@/components/ui/primitives'

/**
 * Career timeline as an accessible disclosure set.
 *
 * Each role is a `button` controlling its own panel — `aria-expanded` and
 * `aria-controls` carry the state, so the whole timeline is operable with
 * Tab + Enter/Space and reads correctly in a screen reader's forms mode.
 * The current role starts open; the rest collapse so the progression is
 * scannable before it is read.
 *
 * Extracted from Experience.tsx so that the section shell and the charts above
 * it can stay server components — none of them needs state, and the disclosure
 * set is the only part of the section that does.
 */

function HighlightRow({ highlight }: { highlight: Highlight }) {
  return (
    <li className="border-t border-hairline py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          {highlight.name ? (
            <p className="mb-1.5 font-medium text-ink">{highlight.name}</p>
          ) : null}
          <p className="measure text-sm leading-relaxed text-muted">{highlight.body}</p>
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

export function ExperienceTimeline() {
  const allRoles = companies.flatMap((c) => c.roles.map((r) => r.id))
  const initiallyOpen = companies
    .flatMap((c) => c.roles)
    .filter((r) => r.end === null)
    .map((r) => r.id)

  const [open, setOpen] = useState<string[]>(
    initiallyOpen.length > 0 ? initiallyOpen : allRoles.slice(0, 1),
  )

  const toggle = (key: string) =>
    setOpen((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  return (
    /* Capped to the same width as the charts above it. Left uncapped the row's
       `justify-between` strands each impact figure ~800px from the sentence it
       qualifies, and the disclosure's own +/x control ends up at the far edge of
       the viewport — both of which break the association they exist to make. */
    <div className="max-w-6xl space-y-14">
      {companies.map((company) => (
        <div key={company.name}>
          {/* Company band. `company.period` stays a hand-written string rather
              than deriving from the roles: the resume prints Jun 2022 – Present
              against the company, and the Lead role's Aug 2025 start is
              inferred, so deriving this would erase a deliberate distinction. */}
          <div className="mb-8 flex flex-col gap-1 border-b border-hairline-strong pb-5 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="text-xl font-semibold text-ink">{company.name}</h3>
            <p className="font-mono text-xs text-dim">
              {company.period} · {company.location}
            </p>
          </div>

          {/* Roles, most recent first */}
          <ol className="relative">
            {company.roles.map((role, i) => {
              const isOpen = open.includes(role.id)
              const panelId = `panel-${role.id}`
              const buttonId = `${panelId}-button`
              const isLast = i === company.roles.length - 1
              const current = role.end === null

              return (
                <li key={role.id} className="relative pl-8 sm:pl-10">
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
                      current ? 'border-accent bg-accent/25' : 'border-hairline-strong bg-canvas',
                    )}
                  />

                  <div className={cn('pb-8', isLast && 'pb-0')}>
                    <h4>
                      <button
                        type="button"
                        id={buttonId}
                        onClick={() => toggle(role.id)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="group flex w-full items-start justify-between gap-4 rounded-md py-1 text-left"
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2.5">
                            <span className="font-medium text-ink transition-colors group-hover:text-accent">
                              {role.title}
                            </span>
                            {current ? (
                              <span className="rounded-full border border-accent/35 bg-accent-soft px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.1em] text-accent uppercase">
                                Current
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 block font-mono text-xs text-dim">
                            {formatRange(role.start, role.end)}
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
                        {/* Position within the role, not a slice of the prose:
                            two highlights opening on the same clause would have
                            collided, and a body is written to be read rather
                            than to identify anything. */}
                        {role.highlights.map((highlight, h) => (
                          <HighlightRow key={`${role.id}-h${h}`} highlight={highlight} />
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
  )
}
