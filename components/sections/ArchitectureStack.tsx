'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { archLayers } from '@/content/architecture'
import { Section, SectionHeader } from '@/components/ui/primitives'

/**
 * The end-to-end stack, as a vertical tablist.
 *
 * Implemented against the WAI-ARIA tabs pattern: one tab stop for the whole
 * list, arrow keys move selection, Home/End jump to the ends. Selecting a layer
 * updates a single detail panel rather than expanding rows, so the shape of the
 * stack stays visible while you read about a layer.
 *
 * Below `lg` the detail panel moves beneath the stack; the interaction model is
 * unchanged, so there is no second implementation to keep in sync.
 */
export function ArchitectureStack() {
  const [selected, setSelected] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const focusTab = (index: number) => {
    const next = (index + archLayers.length) % archLayers.length
    setSelected(next)
    tabRefs.current[next]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        focusTab(selected + 1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        focusTab(selected - 1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(0)
        break
      case 'End':
        event.preventDefault()
        focusTab(archLayers.length - 1)
        break
    }
  }

  const active = archLayers[selected]

  return (
    <Section id="architecture">
      <SectionHeader
        id="architecture-title"
        index="05"
        eyebrow="Architecture"
        title="AI Systems Architecture"
        lede="The layers a production AI feature actually passes through. Select one to see what it is responsible for — and what breaks when it is missing."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
        {/* Stack */}
        <div
          role="tablist"
          aria-label="AI systems architecture layers"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="overflow-hidden rounded-xl border border-hairline-strong"
        >
          {archLayers.map((layer, i) => {
            const isSelected = i === selected
            return (
              <button
                key={layer.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`arch-tab-${layer.id}`}
                aria-selected={isSelected}
                aria-controls="arch-panel"
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setSelected(i)}
                className={cn(
                  'flex w-full min-h-14 items-center gap-4 border-b border-hairline px-4 py-3.5 text-left transition-colors duration-200 last:border-b-0 sm:px-5',
                  isSelected
                    ? 'bg-accent-soft'
                    : 'bg-surface hover:bg-raised',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'h-8 w-0.5 shrink-0 rounded-full transition-colors',
                    isSelected ? 'bg-accent' : 'bg-hairline-strong',
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-sm font-medium transition-colors',
                      isSelected ? 'text-ink' : 'text-muted',
                    )}
                  >
                    {layer.name}
                  </span>
                  {/* Wraps rather than truncates: the longest tech string
                      overruns the tab on a 320px screen, and the ` · `
                      separators give it clean break points. */}
                  <span className="mt-0.5 block font-mono text-[0.6875rem] leading-snug text-dim">
                    {layer.tech}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Detail */}
        <div
          role="tabpanel"
          id="arch-panel"
          aria-labelledby={active ? `arch-tab-${active.id}` : undefined}
          tabIndex={0}
          className="rounded-xl border border-hairline bg-surface p-7 md:p-9 lg:sticky lg:top-24 lg:self-start"
        >
          {active ? (
            <>
              <p className="mono-label mb-5">
                Layer {String(selected + 1).padStart(2, '0')} / {archLayers.length}
              </p>
              <h3 className="text-2xl font-semibold text-ink">{active.name}</h3>
              <p className="mt-2 font-mono text-xs text-accent">{active.tech}</p>
              <p className="measure mt-6 text-base leading-relaxed text-ink">{active.role}</p>
              <p className="measure mt-4 text-sm leading-relaxed text-muted">{active.detail}</p>
            </>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
