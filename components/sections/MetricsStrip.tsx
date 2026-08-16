'use client'

import { useEffect, useState } from 'react'
import { metrics } from '@/content/metrics'
import { useInView, usePrefersReducedMotion } from '@/lib/hooks'

/**
 * Counts a numeric figure up on first view, preserving any prefix/suffix
 * ("5+", "75%"). Renders the final value immediately under reduced motion or
 * before the strip is scrolled into view, so the text is never wrong — only
 * un-animated.
 */
function useCountUp(value: string, active: boolean) {
  // Split into prefix / number / suffix so "5+" and "75%" keep their affixes.
  // Only primitives are derived here — the match array itself would be a fresh
  // object every render and would restart the effect on each one.
  const match = value.match(/^(\D*)(\d+)(\D*)$/)
  const prefix = match?.[1] ?? ''
  const suffix = match?.[3] ?? ''
  const target = match ? Number(match[2]) : null

  // null = not animating; the literal value is rendered instead. This keeps the
  // server-rendered markup correct and means a value without digits, or a
  // viewer who never scrolls here, always sees the real figure.
  const [n, setN] = useState<number | null>(null)

  useEffect(() => {
    if (!active || target === null) return

    const duration = 900
    const start = performance.now()

    // The first frame writes 0, so there is no synchronous setState here.
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic — quick off the mark, settles rather than stopping dead.
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(eased * target))
      if (t < 1) frame = requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(frame)
  }, [active, target])

  if (target === null || n === null) return value
  return `${prefix}${n}${suffix}`
}

function MetricItem({ value, label, animate }: { value: string; label: string; animate: boolean }) {
  const display = useCountUp(value, animate)

  return (
    <div className="bg-surface px-4 py-5 last:col-span-2 sm:px-5 md:py-6 xl:last:col-span-1">
      {/* The literal value stays available to assistive tech regardless of the
          animated digits, which change many times a second. */}
      <div
        className="font-mono text-2xl font-semibold tracking-tight text-ink tabular-nums md:text-[1.75rem]"
        aria-hidden
      >
        {display}
      </div>
      <div className="sr-only">{value}</div>
      <div className="mt-2 text-xs leading-snug text-muted md:text-[0.8125rem]">{label}</div>
    </div>
  )
}

export function MetricsStrip() {
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>('0px 0px -10% 0px')
  const animate = inView && !reduced

  return (
    <section aria-label="Measured engineering outcomes" className="border-y border-hairline bg-surface">
      <div className="shell">
        {/* Hairlines are drawn as `gap-px` seams over `bg-hairline` rather than
            per-cell borders, so the rules stay correct at 2, 4 and 7 columns
            without any `first:`/`nth-child` arithmetic to get wrong per
            breakpoint. Each cell must therefore carry an opaque `bg-surface`.
            The 7-across waits for `xl`: at 1024px seven columns leave ~97px of
            content per cell, which wraps the longer labels to four lines.
            NOTE: `last:col-span-2` assumes `metrics.length === 7`. Seven tiles
            into neither 2 nor 4 columns, and the ragged empty cell would
            otherwise show through as a tinted block. Revisit if a metric is
            added or removed. */}
        <div
          ref={ref}
          className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4 xl:grid-cols-7"
        >
          {metrics.map((metric) => (
            <MetricItem
              key={metric.label}
              value={metric.value}
              label={metric.label}
              animate={animate}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
