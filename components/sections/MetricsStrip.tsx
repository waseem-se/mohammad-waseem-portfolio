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
    <div className="border-l border-hairline px-4 py-5 first:border-l-0 sm:px-5 md:py-6">
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
    <section aria-label="Measured engineering outcomes" className="border-y border-hairline bg-surface/40">
      <div className="shell">
        <div
          ref={ref}
          className="grid grid-cols-2 divide-y divide-hairline sm:grid-cols-4 lg:grid-cols-7 lg:divide-y-0"
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
