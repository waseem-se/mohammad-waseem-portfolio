import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { kindLabel } from '@/lib/flow'
import type { ChartTone, FlowKind } from '@/content/types'
import type { ShapeSegment } from '@/lib/charts'

/**
 * Chart primitives.
 *
 * Charts are data, in the same sense diagrams are: the figures live in
 * `content/`, and nothing here computes a number it was not handed. Unlike
 * FlowDiagram, this is not one renderer for every chart — a ranked bar list, a
 * Gantt, a grouped bar pair and a presence matrix are genuinely different
 * geometries, and forcing them through one component produces prop soup.
 *
 * What *is* centralised is the contract every chart on this site owes its
 * reader: a stated unit, a stated caveat, a legend whose colour is never the
 * only cue, and a real table for anyone who cannot see the bars. `caveat` and
 * `table` are required props, so that contract cannot be forgotten — it has to
 * be actively filled in.
 *
 * Bars are CSS, not SVG. SVG <text> does not wrap, and a viewBox scales text
 * with the box, which at this site's range of container widths (288px to
 * ~2300px now that the shell is the viewport) would mean 5px labels on a phone
 * and 40px ones on a monitor. The same reasoning FlowDiagram gives for semantic
 * HTML applies harder here, because a bar chart is mostly labels and numbers.
 */

/**
 * Spelled out rather than templated, for the reason kindStyles in
 * FlowDiagram.tsx gives: Tailwind's scanner only sees literal strings.
 *
 * Fills and swatches only — never text. `node-guard` measures 4.11:1 and
 * `node-retrieval` 4.48:1 on `raised`, which clears the 3:1 non-text floor a
 * bar needs and misses the 4.5:1 AA floor a label needs.
 *
 * Keyed by `FlowKind`, so it covers `llm` — which `ChartTone` excludes because
 * it resolves to the same value as `compute`. Only SequenceStrip may reach for
 * that entry, and only because a cell has a second channel (fill versus ring)
 * to carry the distinction. Anything measured by length must stay on
 * `ChartTone`: two same-coloured bars have nothing left to tell them apart.
 */
const kindFill: Record<FlowKind, string> = {
  input: 'bg-node-input',
  compute: 'bg-node-compute',
  retrieval: 'bg-node-retrieval',
  store: 'bg-node-store',
  llm: 'bg-node-llm',
  guard: 'bg-node-guard',
  output: 'bg-node-output',
  human: 'bg-node-human',
}

/* -------------------------------------------------------------------------- */
/* Frame                                                                      */
/* -------------------------------------------------------------------------- */

type BodyMax = 'max-w-3xl' | 'max-w-4xl' | 'max-w-6xl'

/** Body measure -> grid template, so the two cannot drift apart. */
const frameGrid: Record<BodyMax, string> = {
  'max-w-3xl': '@5xl:grid-cols-[minmax(0,48rem)_minmax(0,18rem)]',
  'max-w-4xl': '@5xl:grid-cols-[minmax(0,56rem)_minmax(0,18rem)]',
  'max-w-6xl': '@5xl:grid-cols-[minmax(0,72rem)_minmax(0,18rem)]',
}

export type ChartLegendItem = {
  /** Repeated verbatim on every mark in the series, so colour is never alone. */
  code: string
  label: string
  tone: ChartTone
}

export function ChartFrame({
  title,
  unit,
  caveat,
  legend,
  table,
  children,
  className,
  bodyMax = 'max-w-4xl',
}: {
  title: string
  /** What one unit of bar length means. Rendered under the title. */
  unit: string
  /** Required. Every chart here states what its numbers do not mean. */
  caveat: string
  legend?: ChartLegendItem[]
  /** Required. Build it with ChartTable. */
  table: ReactNode
  children: ReactNode
  className?: string
  /**
   * Measure cap for the plot. Charts obey a measure exactly as prose does: past
   * a point extra width stops being resolution and starts being a bar you
   * cannot scan back to its own label.
   */
  bodyMax?: BodyMax
}) {
  return (
    <figure
      className={cn(
        '@container rounded-xl border border-hairline bg-surface p-6 md:p-7',
        className,
      )}
    >
      {/* Past @5xl the apparatus moves into a right rail rather than stretching
          the plot, so the bars keep a scannable length on a wide monitor.

          The first track is sized to the body's own measure rather than `1fr`.
          With `1fr` the column swallows every spare pixel and pins the rail to
          the far edge of the figure, which on a 1760px shell leaves ~500px of
          nothing between a chart and the note explaining it — they stop reading
          as one object. Sized this way the leftover lands outside both, which is
          the same thing the measure does to a paragraph. */}
      <div className={cn('@5xl:grid @5xl:gap-10', frameGrid[bodyMax])}>
        <div className={cn('min-w-0', bodyMax)}>
          <figcaption>
            <h4 className="text-sm font-semibold text-ink">{title}</h4>
            <p className="mono-label mt-1.5">{unit}</p>
          </figcaption>

          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-8 min-w-0 @5xl:mt-0">
          {legend && legend.length > 0 ? <ChartLegend items={legend} /> : null}

          <p
            className={cn(
              'text-xs leading-relaxed text-dim',
              legend && legend.length > 0 && 'mt-5 border-t border-hairline pt-5',
            )}
          >
            {caveat}
          </p>
        </div>
      </div>

      {/* The bars above are aria-hidden; this is what a screen reader reads. */}
      <div className="sr-only">{table}</div>
    </figure>
  )
}

function ChartLegend({ items }: { items: ChartLegendItem[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
      {items.map((item) => (
        <li key={item.code} className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden className={cn('size-2.5 shrink-0 rounded-sm', kindFill[item.tone])} />
          <span className="min-w-0 text-xs text-muted">
            <span className="font-mono text-[0.6875rem] tracking-[0.08em] text-dim">
              {item.code}
            </span>
            <span className="mx-1.5 text-dim">·</span>
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* -------------------------------------------------------------------------- */
/* Table fallback                                                             */
/* -------------------------------------------------------------------------- */

export type ChartTableRow = {
  /**
   * Stable row identity, supplied by the caller rather than read off a cell.
   *
   * This used to key off the first cell, which is the row header — and two
   * roles on this site are both titled 'Software Development Engineer 1', at
   * two different companies. A display label is a thing chosen for the reader;
   * it is not identity, and nothing stops content from repeating one.
   */
  key: string
  /** First cell becomes the row header. */
  cells: (string | number)[]
}

export function ChartTable({
  caption,
  columns,
  rows,
}: {
  caption: string
  columns: string[]
  rows: ChartTableRow[]
}) {
  /* The type forces a key; it cannot force a *unique* one. Same reasoning as
     roleSeriesById in content/experience.ts: on a statically exported site this
     runs during `next build`, so a repeat of the duplicate-key bug fails the
     build rather than reaching a reader as a console warning nobody sees. */
  const seen = new Set<string>()
  for (const row of rows) {
    if (seen.has(row.key)) {
      throw new Error(`ChartTable "${caption}" has two rows keyed "${row.key}".`)
    }
    seen.add(row.key)
  }

  return (
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          /* Cells key by position: the column count is fixed by `columns`, so
             an index here is real identity rather than a stand-in for one. */
          <tr key={row.key}>
            {row.cells.map((cell, i) =>
              i === 0 ? (
                <th key={i} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={i}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* -------------------------------------------------------------------------- */
/* Bars                                                                       */
/* -------------------------------------------------------------------------- */

export type BarDatum = {
  /**
   * Stable identity, for the reason ChartTableRow gives: a label is written for
   * the reader, and two of them can say the same thing.
   */
  key: string
  label: string
  /** The number the length encodes. */
  value: number
  /** Rendered verbatim beside the bar, so a '%' or a prefix survives. */
  display: string
  /** Second line under the label — the role, the tier, whatever qualifies it. */
  note?: string
  tone: ChartTone
}

export function BarChart({
  data,
  max,
  className,
}: {
  data: BarDatum[]
  /**
   * Required, and explicit at the call site rather than derived here. Deriving
   * a max inside the component is how two groups rendered side by side silently
   * end up on two different scales — which is the failure this whole file is
   * arranged to prevent.
   */
  max: number
  className?: string
}) {
  return (
    <ul className={cn('divide-y divide-hairline', className)}>
      {data.map((datum) => (
        <li
          key={datum.key}
          className="grid grid-cols-1 gap-x-5 gap-y-1.5 py-2.5 first:pt-0 last:pb-0 @2xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] @2xl:items-center @2xl:gap-y-0"
        >
          <div className="min-w-0">
            <p className="text-sm leading-snug text-ink">{datum.label}</p>
            {datum.note ? (
              <p className="mt-0.5 font-mono text-[0.6875rem] tracking-[0.08em] text-dim">
                {datum.note}
              </p>
            ) : null}
          </div>

          {/* Decorative: the value is direct-labelled beside it and the whole
              chart is restated as a table. */}
          <div
            aria-hidden
            className="relative h-2.5 w-full overflow-hidden rounded-full bg-raised"
          >
            <div
              className={cn(
                'h-full rounded-full',
                /* A floor so a small non-zero value still reads as a bar — but
                   never for zero. A bar of length zero is a claim, and the
                   wrong one; impactData drops unparseable figures for the same
                   reason rather than charting them at the origin. */
                datum.value > 0 && 'min-w-[3px]',
                kindFill[datum.tone],
              )}
              /* `max` is caller-supplied, so a degenerate 0 must not become a
                 NaN width. */
              style={{ width: max > 0 ? `${(datum.value / max) * 100}%` : '0%' }}
            />
          </div>

          <p className="font-mono text-sm font-semibold text-ink tabular-nums @2xl:w-16 @2xl:text-right">
            {datum.display}
          </p>
        </li>
      ))}
    </ul>
  )
}

/** The 0-to-max caption that stands in for an axis. No gridlines: every bar is
    already direct-labelled, so ticks would only add ink. */
export function ChartScale({ max, unit }: { max: number; unit: string }) {
  return (
    <p className="mono-label mt-5">
      Scale: 0 — {max} {unit}
    </p>
  )
}

/* -------------------------------------------------------------------------- */
/* Presence matrix                                                            */
/* -------------------------------------------------------------------------- */

export type MatrixColumn = { id: string; short: string; full: string }
export type MatrixRow = { label: string; present: boolean[]; count: number }

/**
 * A row of filled/empty cells, one per column.
 *
 * Used where the denominator is small enough that a bar would mislead: five
 * cells make "3 of 5" literal, and keep *which* three, which a bar throws away.
 * Filled-versus-empty is itself the non-colour encoding.
 */
export function UnitMatrix({
  columns,
  rows,
  tone,
  className,
}: {
  columns: MatrixColumn[]
  rows: MatrixRow[]
  tone: ChartTone
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      {/* Columns are keyed by position rather than labelled above the cells.
          Rotated headers over a 16px cell are unreadable at any width worth
          supporting, and a horizontal label is wider than the cell it names.
          The key below carries the same mapping as plain text, which also
          survives a 320px screen and a screen reader. */}
      <div
        aria-hidden
        className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-hairline pb-2.5"
      >
        <span className="mono-label">Technology</span>
        <span className="flex items-baseline gap-3">
          <span className="flex gap-1">
            {columns.map((column, i) => (
              <span
                key={column.id}
                className="w-4 text-center font-mono text-[0.625rem] text-dim tabular-nums @4xl:w-5"
              >
                {i + 1}
              </span>
            ))}
          </span>
          <span className="w-14 shrink-0" />
        </span>
      </div>

      <ul>
        {/* `label` is identity here, unlike in BarChart and ChartTable: rows come
            from techRecurrence, which accumulates them in a Map keyed by the
            technology name, so a duplicate label cannot be constructed. */}
        {rows.map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b border-hairline py-2.5 last:border-b-0"
          >
            <p className="min-w-0 text-sm leading-snug text-ink">{row.label}</p>
            <div className="flex items-center gap-3">
              <span aria-hidden className="flex gap-1">
                {row.present.map((present, i) => (
                  <span
                    key={columns[i]?.id ?? i}
                    className={cn(
                      'size-4 rounded-sm @4xl:size-5',
                      present ? kindFill[tone] : 'border border-hairline bg-raised',
                    )}
                  />
                ))}
              </span>
              {/* The count as literal text, not only as filled cells. With a
                  denominator of five, "3 of 5" is the honest statement and the
                  cells are the illustration of it — not the other way round. */}
              <span className="w-14 shrink-0 font-mono text-xs text-dim tabular-nums">
                {row.count} of {columns.length}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <ol className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
        {columns.map((column, i) => (
          <li key={column.id} className="font-mono text-[0.6875rem] text-dim">
            <span className="tabular-nums">{i + 1}</span>
            <span className="mx-1.5">·</span>
            {column.full}
          </li>
        ))}
      </ol>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Sequence strip                                                             */
/* -------------------------------------------------------------------------- */

/**
 * One cell per stage, in pipeline order, coloured by what the stage does.
 *
 * A sparkline of a graph rather than a measurement of one. It replaced a pair of
 * bars counting nodes and edges, which spanned 4 to 10 across five projects —
 * almost no variance to draw, and two words of graph-theory vocabulary standing
 * between the reader and the thing itself. The same argument UnitMatrix makes
 * about small denominators: with counts this size the honest geometry is a
 * discrete unit, not a length.
 *
 * No axis, and no ChartScale beside it. Every cell is one stage and the total is
 * direct-labelled by the caller, so a `0 — max` caption would be inventing a
 * scale the geometry does not have.
 */
export function SequenceStrip({
  segments,
  className,
}: {
  segments: ShapeSegment[]
  className?: string
}) {
  return (
    /* Decorative. The chart's table carries the sequence as prose — see
       `sequenceSentence` in ProjectFootprint. */
    <div aria-hidden className={cn('flex min-w-0 flex-wrap items-center gap-1.5', className)}>
      {segments.map((segment, i) =>
        segment.type === 'stage' ? (
          <Cell key={`${segment.cell.id}-${i}`} kind={segment.cell.kind} />
        ) : (
          <Fork key={`fork-${i}`} branches={segment.branches} />
        ),
      )}
    </div>
  )
}

function Cell({ kind }: { kind: FlowKind }) {
  /* `llm` shares `compute`'s hue, so its outline — not its colour — separates
     them, which is the same thing FlowDiagram does and keeps the distinction
     available to a reader who cannot use colour at all.
     Dashed and tinted rather than an empty ring: at this size a hollow cell
     read as a *gap* in the pipeline, which is the one thing it must not say. */
  const isModel = kind === 'llm'
  return (
    <span
      className={cn(
        'size-5 shrink-0 rounded-sm @2xl:size-6',
        isModel ? 'border-2 border-dashed border-node-llm bg-node-llm/20' : kindFill[kind],
      )}
    />
  )
}

/**
 * The point where the pipeline fans out and re-converges.
 *
 * Dashed border, matching the branch cards in FlowDiagram — the reader has
 * likely already seen the full diagram on the project page, and the two should
 * agree about what a branch looks like. Branch labels are the routing
 * *conditions*, which is the most interesting thing about the only branching
 * architecture here, so they render wherever there is room and drop out below
 * `@lg` rather than forcing the strip to wrap mid-fork.
 */
function Fork({ branches }: { branches: { label: string; cells: { id: string; kind: FlowKind }[] }[] }) {
  return (
    /* One grid rather than a stack of rows, so the label column lands in the
       same place on every branch. Stacked rows left the labels ragged, because
       the branches do not all hold the same number of stages.

       Single column until the labels appear, and not merely a wider one: a
       hidden label is `display: none`, so it leaves the grid entirely rather
       than holding its cell. In two columns that let three branches reflow into
       two rows — the strip drawing a fan-out it does not have, at exactly the
       widths where the reader has least context to catch it. */
    <span className="grid min-w-0 grid-cols-1 items-center gap-x-3 gap-y-1 rounded-md border border-dashed border-hairline px-2 py-1.5 @lg:grid-cols-[auto_auto]">
      {branches.map((branch) => (
        <Fragment key={branch.label}>
          <span className="flex min-w-0 items-center gap-1.5">
            {branch.cells.map((cell) => (
              <Cell key={cell.id} kind={cell.kind} />
            ))}
          </span>
          <span className="hidden font-mono text-[0.625rem] tracking-[0.08em] whitespace-nowrap text-dim uppercase @lg:inline">
            {branch.label}
          </span>
        </Fragment>
      ))}
    </span>
  )
}

/**
 * The key for a set of strips, rendered once beneath them all.
 *
 * Strip-local rather than ChartFrame's `legend` prop, following UnitMatrix's own
 * column key above. That prop is typed `ChartTone`, which cannot express `llm`
 * at all — and widening it would let a bar chart pick a fill it has no way to
 * disambiguate. This keeps the exception where the second channel exists.
 */
export function SequenceKey({ kinds, className }: { kinds: FlowKind[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-2', className)}>
      {kinds.map((kind) => (
        <li key={kind} className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={cn(
              'size-2.5 shrink-0 rounded-sm',
              kind === 'llm' ? 'border-[1.5px] border-dashed border-node-llm bg-node-llm/20' : kindFill[kind],
            )}
          />
          <span className="text-xs text-muted">{kindLabel[kind]}</span>
        </li>
      ))}
    </ul>
  )
}
