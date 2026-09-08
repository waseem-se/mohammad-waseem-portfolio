import { cn } from '@/lib/cn'
import { kindLabel } from '@/lib/flow'
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

/** A store hanging off a stage, paired with whether the stage reads it back. */
type Aside = { node: FlowNode; bidirectional?: boolean }

/**
 * Unlike the hero SVG, which derives its property names from `node.kind`, this
 * has to spell every class out: Tailwind's scanner only sees literal strings, so
 * a template literal would generate nothing. The table is pure name lookup
 * though — the values themselves live in globals.css.
 */
const kindStyles: Record<FlowKind, { dot: string; border: string }> = {
  input: { dot: 'bg-node-input', border: 'border-node-input-line' },
  compute: { dot: 'bg-node-compute', border: 'border-node-compute-line' },
  retrieval: { dot: 'bg-node-retrieval', border: 'border-node-retrieval-line' },
  store: { dot: 'bg-node-store', border: 'border-node-store-line' },
  /* `llm` shares `compute`'s hue, so its outline style — not its colour — is
     what separates them. See `isModel` in Node below. */
  llm: { dot: 'bg-node-llm', border: 'border-node-llm-line' },
  guard: { dot: 'bg-node-guard', border: 'border-node-guard-line' },
  output: { dot: 'bg-node-output', border: 'border-node-output-line' },
  human: { dot: 'bg-node-human', border: 'border-node-human-line' },
}

function Node({
  node,
  compact,
  attached,
}: {
  node: FlowNode
  compact?: boolean
  /* Stores this node queries. They get their own box in the gutter once the
     container is wide enough; below that they fold in here, because a store
     drawn under its host with nowhere to put the connector reads as the next
     stage in the chain — the one thing `attachedTo` exists to prevent. */
  attached?: Aside[]
}) {
  const style = kindStyles[node.kind]
  /* The one probabilistic stage in any of these graphs. Drawn provisional —
     dashed outline, hollow dot — because the site's whole argument is that
     model output is a contract to be validated rather than a result to be
     trusted. It also means the distinction survives without colour, which
     `llm` needs: it shares `compute`'s hue. */
  const isModel = node.kind === 'llm'
  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border bg-raised transition-colors',
        style.border,
        isModel && 'border-dashed',
        compact ? 'px-3 py-2' : 'px-4 py-3',
      )}
    >
      <span
        className={cn(
          'shrink-0 rounded-full',
          isModel ? 'size-2 border-[1.5px] border-node-llm' : cn('size-1.5', style.dot),
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        {/* No `break-words`: mid-word breaks turn "Retrieval" into "Retrie val".
            Container queries below keep the box wide enough for whole words. */}
        <span
          className={cn(
            'block font-mono leading-tight text-ink',
            compact ? 'text-[0.6875rem]' : 'text-xs md:text-[0.8125rem]',
          )}
        >
          {node.label}
        </span>
        {node.note && !compact ? (
          <span className="mt-1 block text-[0.6875rem] leading-tight text-dim">{node.note}</span>
        ) : null}
        {attached?.length ? (
          <span className="mt-1 block font-mono text-[0.625rem] leading-tight text-dim @2xl:hidden">
            {attached
              .map((store) => `${store.bidirectional ? '\u21c4' : '\u2192'} ${store.node.label}`)
              .join('   ')}
          </span>
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
 * Horizontal connector to a laterally attached node — a store a stage queries,
 * not a stage the request passes through. Chevrons point both ways when the
 * edge is bidirectional, which is what stops the pair reading as a step.
 */
function LateralConnector({ bidirectional }: { bidirectional?: boolean }) {
  return (
    /* `top-1/2` + `-translate-y-1/2` rather than the parent's `items-center`:
       the static position of an absolutely positioned flex child is not treated
       the same way across engines, and centring a 6px glyph on a 1px bar that
       way needed a magic offset that left the chevrons floating above the line. */
    <span className="relative h-px w-6 shrink-0 self-center bg-hairline-strong" aria-hidden>
      {/* `border-t border-r` corners at the top right, so the glyph points
          up-right at 0deg: +45deg aims it east, +225deg west. The old -45/135deg
          pair aimed them north and south — invisible while this connector was a
          stub joined to nothing, plainly wrong once it spans two boxes. */}
      <span className="absolute top-1/2 -right-px size-1.5 -translate-y-1/2 rotate-45 border-t border-r border-hairline-strong" />
      {bidirectional ? (
        <span className="absolute top-1/2 -left-px size-1.5 -translate-y-1/2 rotate-[225deg] border-t border-r border-hairline-strong" />
      ) : null}
    </span>
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
  /* Attached nodes are lookups, not stages. Left in the step list they would
     read as "Retrieval to Vector DB, then Retrieval to LLM" — which states the
     architecture wrongly to exactly the readers who cannot see the diagram. */
  const attached = new Set(graph.nodes.filter((n) => n.attachedTo).map((n) => n.id))

  const steps = graph.edges
    .filter((e) => !attached.has(e.from) && !attached.has(e.to))
    .map((e) => `${byId.get(e.from) ?? e.from} to ${byId.get(e.to) ?? e.to}`)

  const asideText = graph.nodes
    .filter((n) => n.attachedTo)
    .map((n) => {
      const host = byId.get(n.attachedTo as string) ?? n.attachedTo
      const edge = graph.edges.find((e) => e.from === n.attachedTo && e.to === n.id)
      return edge?.bidirectional
        ? `${host} queries ${n.label} and reads the result back.`
        : `${host} writes to ${n.label}.`
    })

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

  return [`Flow: ${steps.join(', then ')}.`, ...asideText, ...laneText].join(' ')
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

  /* Laterally attached nodes hang off their host instead of taking a position
     in the chain. Without this they get spliced into the sequence like any
     other node, which turns a store the host queries into a stage the request
     flows through — the narrow-screen diagram would then contradict the SVG. */
  const attachedToHost = new Map<string, FlowNode[]>()
  for (const node of graph.nodes) {
    if (!node.attachedTo) continue
    const list = attachedToHost.get(node.attachedTo) ?? []
    list.push(node)
    attachedToHost.set(node.attachedTo, list)
  }

  const sequence: (
    | { type: 'node'; node: FlowNode; edgeLabel?: string; aside: Aside[] }
    | { type: 'lanes'; branches: { label: string; nodes: FlowNode[] }[] }
  )[] = []

  const emitted = new Set<string>()

  for (const node of graph.nodes) {
    if (emitted.has(node.id) || node.attachedTo) continue

    const incoming = graph.edges.find((e) => e.to === node.id && !attachedToHost.has(e.to))
    sequence.push({
      type: 'node',
      node,
      edgeLabel: incoming?.label,
      /* Resolved here rather than in the render: both the gutter box and the
         folded sub-line need it, and looking the edge up twice invites them to
         disagree about the same relationship. */
      aside: (attachedToHost.get(node.id) ?? []).map((store) => ({
        node: store,
        bidirectional: graph.edges.find((e) => e.from === node.id && e.to === store.id)
          ?.bidirectional,
      })),
    })
    emitted.add(node.id)

    const lane = laneByFrom.get(node.id)
    if (lane) {
      sequence.push({ type: 'lanes', branches: lane.branches })
    }
  }

  const hasLanes = (graph.lanes?.length ?? 0) > 0
  const hasAsides = attachedToHost.size > 0

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
          'grid w-full',
          /* A graph with a lateral store gets a right-hand gutter for it, so the
             store sits level with the stage that queries it. Above the threshold
             the block is a fixed 28rem + 12rem and `w-fit` lets the figure centre
             it; below, it collapses to the plain 28rem column and the stores fold
             into their hosts. Branching graphs need room to lay lanes side by
             side instead. */
          hasAsides
            ? 'max-w-md @2xl:w-fit @2xl:max-w-none'
            : hasLanes
              ? 'max-w-2xl'
              : 'max-w-md',
        )}
      >
        {sequence.map((item, i) => (
          <div
            key={item.type === 'node' ? item.node.id : `lanes-${i}`}
            /* Every row repeats the same column template, which is the invariant
               the diagram rests on: the main column is the same width whether or
               not this particular row has anything in the gutter, so the spine
               cannot wander. Sizing the host with `flex-1` instead would recentre
               it row by row. */
            className={cn('grid w-full grid-cols-1', hasAsides && '@2xl:grid-cols-[28rem_12rem]')}
          >
            {/* The spine. Connectors belong in this column rather than in a row
                of their own, so they centre on the main column and not on the
                wider box the gutter opens up. */}
            <div className="flex min-w-0 flex-col items-center">
              {i > 0 ? (
                <Connector
                  label={item.type === 'node' ? item.edgeLabel : undefined}
                  compact={compact}
                />
              ) : null}
              {item.type === 'node' ? (
                <Node node={item.node} compact={compact} attached={item.aside} />
              ) : (
                <Lanes branches={item.branches} />
              )}
            </div>

            {/* The gutter. Offset by the incoming connector's own height so the
                lateral line meets the middle of the host box rather than the
                middle of the row, without measuring anything. */}
            {item.type === 'node' && item.aside.length > 0 ? (
              <div
                className={cn(
                  'hidden @2xl:flex @2xl:flex-col @2xl:justify-center @2xl:gap-2',
                  i > 0 && (compact ? '@2xl:pt-4' : '@2xl:pt-6'),
                )}
              >
                {item.aside.map((store) => (
                  <div key={store.node.id} className="flex items-center">
                    <LateralConnector bidirectional={store.bidirectional} />
                    <span className="min-w-0 flex-1">
                      <Node node={store.node} compact />
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </figure>
  )
}
