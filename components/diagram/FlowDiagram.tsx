import { cn } from '@/lib/cn'
import type { FlowGraph, FlowKind, FlowNode } from '@/content/types'

/**
 * The single diagram renderer for the whole site.
 *
 * Diagrams are stored as node/edge data in `content/`, so the vertical mobile
 * flow required by the brief is a layout of the same data rather than a second
 * hand-drawn asset. This is a server component — it renders semantic HTML with
 * CSS connectors rather than an SVG canvas, which means the diagram is real
 * text: selectable, translatable, searchable, and readable by a screen reader
 * without a parallel description.
 */

const kindStyles: Record<FlowKind, { dot: string; border: string; label: string }> = {
  input: { dot: 'bg-muted', border: 'border-hairline-strong', label: 'text-ink' },
  compute: { dot: 'bg-accent', border: 'border-accent/30', label: 'text-ink' },
  store: { dot: 'bg-accent-alt', border: 'border-accent-alt/30', label: 'text-ink' },
  llm: { dot: 'bg-accent', border: 'border-accent/40', label: 'text-ink' },
  guard: { dot: 'bg-amber-400/80', border: 'border-amber-400/25', label: 'text-ink' },
  output: { dot: 'bg-emerald-400/80', border: 'border-emerald-400/25', label: 'text-ink' },
  human: { dot: 'bg-rose-400/80', border: 'border-rose-400/25', label: 'text-ink' },
}

const kindLabel: Record<FlowKind, string> = {
  input: 'input',
  compute: 'process',
  store: 'data store',
  llm: 'model',
  guard: 'validation',
  output: 'output',
  human: 'human review',
}

function Node({ node, compact }: { node: FlowNode; compact?: boolean }) {
  const style = kindStyles[node.kind]
  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border bg-raised/80 transition-colors',
        style.border,
        compact ? 'px-3 py-2' : 'px-4 py-3',
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', style.dot)} aria-hidden />
      <span className="min-w-0 flex-1">
        {/* No `break-words`: mid-word breaks turn "Retrieval" into "Retrie val".
            Container queries below keep the box wide enough for whole words. */}
        <span
          className={cn(
            'block font-mono leading-tight',
            style.label,
            compact ? 'text-[0.6875rem]' : 'text-xs md:text-[0.8125rem]',
          )}
        >
          {node.label}
        </span>
        {node.note && !compact ? (
          <span className="mt-1 block text-[0.6875rem] leading-tight text-dim">{node.note}</span>
        ) : null}
      </span>
      <span className="sr-only"> ({kindLabel[node.kind]})</span>
    </div>
  )
}

/** Vertical connector between two stacked nodes. */
function Connector({ label, compact }: { label?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col items-center',
        compact ? 'h-4' : 'h-6',
      )}
      aria-hidden
    >
      <span className="h-full w-px bg-hairline-strong" />
      <span className="absolute bottom-0 size-1 -translate-y-px rotate-45 border-r border-b border-hairline-strong" />
      {label ? (
        <span className="absolute left-[calc(50%+0.75rem)] top-1/2 -translate-y-1/2 font-mono text-[0.625rem] whitespace-nowrap text-dim">
          {label}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Renders a lane group: branches fan out side by side above `md`, and stack
 * vertically below it. Each branch keeps its own label so the condition that
 * selects it stays visible in both layouts.
 */
function Lanes({ branches }: { branches: { label: string; nodes: FlowNode[] }[] }) {
  return (
    <div className="w-full">
      {/*
        Container queries, not viewport breakpoints: this diagram is rendered
        into a narrow card on a project page and into a full-width column
        elsewhere, so what matters is how much room the *container* has, not how
        wide the window is. Below the threshold the branches stack, which is
        also the mobile vertical-flow behaviour.
      */}
      <div
        className={cn(
          'grid w-full gap-3',
          branches.length === 2 ? '@md:grid-cols-2' : '@xl:grid-cols-3',
        )}
      >
        {branches.map((branch) => (
          <div
            key={branch.label}
            className="flex flex-col items-center rounded-lg border border-dashed border-hairline p-3"
          >
            <span className="mb-3 font-mono text-[0.625rem] tracking-[0.1em] text-dim uppercase">
              {branch.label}
            </span>
            <div className="flex w-full flex-col items-center">
              {branch.nodes.map((node, i) => (
                <div key={node.id} className="flex w-full flex-col items-center">
                  {i > 0 ? <Connector compact /> : null}
                  <Node node={node} compact />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Builds the plain-language description used as the diagram's accessible text,
 * so a screen reader gets the flow as a sentence rather than a list of boxes.
 */
function describe(graph: FlowGraph): string {
  const byId = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const steps = graph.edges.map((e) => `${byId.get(e.from) ?? e.from} to ${byId.get(e.to) ?? e.to}`)

  const laneText = (graph.lanes ?? []).map((lane) => {
    const from = byId.get(lane.from) ?? lane.from
    const branches = lane.branches
      .map((b) => `${b.label}: ${b.nodes.map((n) => n.label).join(' then ')}`)
      .join('; ')
    const to = lane.to ? byId.get(lane.to) ?? lane.to : null
    return `From ${from}, one of ${lane.branches.length} branches runs — ${branches}.${
      to ? ` All branches converge on ${to}.` : ''
    }`
  })

  return [`Flow: ${steps.join(', then ')}.`, ...laneText].join(' ')
}

export function FlowDiagram({
  graph,
  className,
  compact,
  title,
}: {
  graph: FlowGraph
  className?: string
  compact?: boolean
  title: string
}) {
  // Walk the nodes in order, splicing lane groups in where they fan out.
  const laneByFrom = new Map((graph.lanes ?? []).map((l) => [l.from, l]))

  const sequence: (
    | { type: 'node'; node: FlowNode; edgeLabel?: string }
    | { type: 'lanes'; branches: { label: string; nodes: FlowNode[] }[] }
  )[] = []

  const emitted = new Set<string>()

  for (const node of graph.nodes) {
    if (emitted.has(node.id)) continue

    const incoming = graph.edges.find((e) => e.to === node.id)
    sequence.push({ type: 'node', node, edgeLabel: incoming?.label })
    emitted.add(node.id)

    const lane = laneByFrom.get(node.id)
    if (lane) {
      sequence.push({ type: 'lanes', branches: lane.branches })
    }
  }

  const hasLanes = (graph.lanes?.length ?? 0) > 0

  return (
    <figure
      className={cn('@container flex flex-col items-center', className)}
      role="group"
      aria-label={`${title} architecture diagram`}
    >
      <p className="sr-only">{describe(graph)}</p>
      <div
        aria-hidden
        className={cn(
          'flex w-full flex-col items-center',
          // Branching graphs need room to lay lanes side by side.
          hasLanes ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        {sequence.map((item, i) => (
          <div
            key={item.type === 'node' ? item.node.id : `lanes-${i}`}
            className="flex w-full flex-col items-center"
          >
            {i > 0 ? (
              <Connector
                label={item.type === 'node' ? item.edgeLabel : undefined}
                compact={compact}
              />
            ) : null}
            {item.type === 'node' ? (
              <Node node={item.node} compact={compact} />
            ) : (
              <Lanes branches={item.branches} />
            )}
          </div>
        ))}
      </div>
    </figure>
  )
}

/**
 * Condensed preview for project cards: the flow as a single wrapping chain of
 * monospace labels. Same data, no boxes — enough to signal shape at a glance
 * without competing with the card's text.
 */
export function FlowPreview({ graph }: { graph: FlowGraph }) {
  const labels = graph.nodes.map((n) => n.label)
  return (
    <div aria-hidden className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
      {labels.map((label, i) => (
        <span key={label} className="flex items-center gap-1.5">
          {i > 0 ? <span className="font-mono text-[0.625rem] text-dim">→</span> : null}
          <span className="rounded border border-hairline bg-raised/60 px-1.5 py-0.5 font-mono text-[0.625rem] text-muted">
            {label}
          </span>
        </span>
      ))}
    </div>
  )
}
