import { cn } from '@/lib/cn'
import type { ChartTone } from '@/content/types'
import { formatDuration, formatMonth, formatRange, monthIndex, monthSpan } from '@/lib/dates'

/**
 * A time axis with one band per span.
 *
 * The hardest thing here is 320px: a horizontal time axis wants width, and a
 * phone has none to spare. The answer is one layout with two label placements
 * rather than a second component — below `@3xl` the label stacks *above* a
 * full-width track, so every pixel of a narrow screen is axis, and the band
 * geometry is byte-identical either way.
 *
 * The year rail is progressive enhancement. Ten year labels in 280px is 28px
 * each, too tight for "2017" at mono 11px, so it appears only at `@2xl` and a
 * single caption states the window below that. Nothing is lost: every band
 * already carries its exact dates as text on its own row.
 */

const toneFill: Record<ChartTone, string> = {
  input: 'bg-node-input',
  compute: 'bg-node-compute',
  retrieval: 'bg-node-retrieval',
  store: 'bg-node-store',
  guard: 'bg-node-guard',
  output: 'bg-node-output',
  human: 'bg-node-human',
}

export type TimelineBand = {
  label: string
  note?: string
  /** Inclusive, ISO `YYYY-MM`. */
  start: string
  /** Inclusive, ISO `YYYY-MM`; `null` means running to `asOf`. */
  end: string | null
  /**
   * `null` renders the band dashed and unfilled rather than tinted — a
   * difference of form, not hue, so it survives greyscale and colour blindness.
   * Same device FlowDiagram uses to separate `llm` from `compute`.
   */
  tone: ChartTone | null
  code: string
}

export function TimelineChart({
  bands,
  asOf,
  className,
}: {
  bands: TimelineBand[]
  /**
   * The month an open-ended band is drawn to. Hand-maintained — never `new
   * Date()`, which on a statically exported site bakes in the build date.
   */
  asOf: string
  className?: string
}) {
  const starts = bands.map((band) => monthIndex(band.start))
  const ends = bands.map((band) => monthIndex(band.end ?? asOf))
  const windowStart = Math.min(...starts)
  const windowEnd = Math.max(...ends, monthIndex(asOf))
  const span = windowEnd - windowStart + 1

  const firstYear = Math.floor(windowStart / 12)
  const lastYear = Math.floor(windowEnd / 12)
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i)

  return (
    <div className={cn('@container min-w-0', className)}>
      <ul>
        {bands.map((band) => {
          const start = monthIndex(band.start)
          const end = monthIndex(band.end ?? asOf)
          const left = ((start - windowStart) / span) * 100
          const width = ((end - start + 1) / span) * 100
          const months = monthSpan(band.start, band.end ?? asOf)

          return (
            <li
              key={band.code}
              className="grid grid-cols-1 gap-y-1.5 border-b border-hairline py-3 last:border-b-0 @3xl:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)] @3xl:items-center @3xl:gap-x-6 @3xl:gap-y-0"
            >
              <div className="min-w-0">
                <p className="text-sm leading-snug font-medium text-ink">{band.label}</p>
                {band.note ? <p className="mt-0.5 text-xs text-muted">{band.note}</p> : null}
                <p className="mt-0.5 font-mono text-[0.6875rem] text-dim">
                  {formatRange(band.start, band.end)} · {formatDuration(months)}
                </p>
              </div>

              {/* Decorative: the dates and duration are already text above, and
                  the whole chart is restated as a table by the frame. */}
              <div aria-hidden className="relative h-3 w-full rounded-full bg-raised">
                <div
                  className={cn(
                    'absolute inset-y-0 min-w-[6px] rounded-full',
                    band.tone
                      ? toneFill[band.tone]
                      : 'border border-dashed border-hairline-strong bg-transparent',
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      {/* Year rail. Hidden where the labels would collide; the caption below
          carries the same information as prose at every width.

          It repeats the rows' grid template rather than offsetting itself by a
          margin. The label column is `minmax(11rem, 15rem)`, so a margin would
          have to guess which end it resolved to — and at any width where it
          guessed wrong every tick would name the wrong month. An empty first
          cell cannot drift. */}
      <div aria-hidden className="mt-4 hidden @2xl:block">
        <div className="@3xl:grid @3xl:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)] @3xl:gap-x-6">
          <div className="hidden @3xl:block" />
          <div className="relative h-4 border-t border-hairline pt-2.5">
            {years.map((year) => {
              const at = ((year * 12 - windowStart) / span) * 100
              if (at < 0 || at > 100) return null
              return (
                <span
                  key={year}
                  className="absolute top-2.5 -translate-x-1/2 font-mono text-[0.625rem] text-dim tabular-nums"
                  style={{ left: `${at}%` }}
                >
                  {year}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <p className="mono-label mt-4 @2xl:mt-2">
        {formatMonth(`${Math.floor(windowStart / 12)}-${String((windowStart % 12) + 1).padStart(2, '0')}`)}
        {' — '}
        {formatMonth(asOf)}
      </p>
    </div>
  )
}
