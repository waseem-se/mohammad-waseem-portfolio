import type { Company, FlowGraph, FlowKind, FlowNode, ImpactKind, Project } from '@/content/types'

/**
 * Derived chart data.
 *
 * Nothing here invents a figure: every function reduces content that is already
 * on the site. They live in `lib/` rather than `content/` because they are
 * arithmetic over content, not content — which is also why none of them
 * normalises a string. Editing what a technology is *called* is a content
 * decision and belongs in content/projects.ts.
 */

/* -------------------------------------------------------------------------- */
/* Architecture graphs                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Nodes, including the ones inside lane branches.
 *
 * `graph.nodes.length` alone understates a branching graph: the Adaptive RAG
 * architecture declares five nodes and carries four more inside its single lane
 * group.
 */
export function countNodes(graph: FlowGraph): number {
  const inLanes = (graph.lanes ?? []).reduce(
    (total, lane) => total + lane.branches.reduce((n, branch) => n + branch.nodes.length, 0),
    0,
  )
  return graph.nodes.length + inLanes
}

/* -------------------------------------------------------------------------- */
/* Architecture shape                                                         */
/* -------------------------------------------------------------------------- */

export type ShapeCell = { id: string; label: string; kind: FlowKind }

/**
 * One position along the pipeline: either a single stage, or the point where it
 * fans out into parallel branches and re-converges.
 */
export type ShapeSegment =
  | { type: 'stage'; cell: ShapeCell }
  | { type: 'fork'; branches: { label: string; cells: ShapeCell[] }[] }

export type ArchitectureShape = {
  segments: ShapeSegment[]
  /** Total cells across every segment. Equals countNodes(graph) — see below. */
  stages: number
  /** Parallel paths at the widest point. 1 means a single chain. */
  paths: number
}

const cellOf = (node: FlowNode): ShapeCell => ({
  id: node.id,
  label: node.label,
  kind: node.kind,
})

/**
 * The graph as an ordered sequence, with its fan-out kept as a fan-out.
 *
 * Order comes from `graph.edges`, not from the order `graph.nodes` happens to be
 * authored in. Drawing the topology is the entire point of the strip this feeds,
 * so reading positions off an array would mean the chart agreed with the diagram
 * only by the content file's good manners.
 *
 * Lanes are descended into rather than counted. The predecessor of this function
 * reported `graph.edges.length`, which is 3 for Adaptive RAG and would have
 * ranked the only non-linear architecture on the site as its simplest — a lane's
 * connections are implied by the group, not declared as edges.
 */
export function architectureShape(graph: FlowGraph): ArchitectureShape {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]))
  const next = new Map<string, string>()
  for (const edge of graph.edges) {
    /* First edge out wins. A node with two outgoing edges is a fan-out that was
       not declared as a lane, and there is no honest single sequence for it; the
       unvisited sweep at the end still renders whatever this walk skips. */
    if (!next.has(edge.from)) next.set(edge.from, edge.to)
  }

  const lanes = new Map((graph.lanes ?? []).map((lane) => [lane.from, lane]))

  /* `lane.to` counts as having an inbound link even though no edge declares it.
     Without this, Adaptive RAG's `gemini` looks like a second entry point,
     because the lane group supplies its only inbound connection. */
  const incoming = new Set<string>(graph.edges.map((edge) => edge.to))
  for (const lane of graph.lanes ?? []) if (lane.to) incoming.add(lane.to)

  /* Laterally attached nodes hang off a stage rather than following it, so they
     are never a walk position — they are emitted beside their host below. */
  const attached = new Map<string, FlowNode[]>()
  for (const node of graph.nodes) {
    if (!node.attachedTo) continue
    const hosted = attached.get(node.attachedTo)
    if (hosted) hosted.push(node)
    else attached.set(node.attachedTo, [node])
    incoming.add(node.id)
  }

  const roots = graph.nodes.filter((node) => !incoming.has(node.id))
  const start = roots.find((node) => node.kind === 'input') ?? roots[0] ?? graph.nodes[0]

  const segments: ShapeSegment[] = []
  const visited = new Set<string>()

  const emit = (node: FlowNode) => {
    visited.add(node.id)
    segments.push({ type: 'stage', cell: cellOf(node) })
    /* Counted, so `stages` stays equal to countNodes. If content ever adds an
       attached node, whether a queried store is really a "stage" is the same
       question `describe()` in FlowDiagram settles for the diagram's prose, and
       should be settled the same way here. */
    for (const aside of attached.get(node.id) ?? []) {
      visited.add(aside.id)
      segments.push({ type: 'stage', cell: cellOf(aside) })
    }
  }

  let current = start
  /* Bidirectional edges and any cycle would otherwise walk forever. */
  while (current && !visited.has(current.id)) {
    emit(current)

    const lane = lanes.get(current.id)
    if (lane) {
      for (const branch of lane.branches) {
        for (const node of branch.nodes) visited.add(node.id)
      }
      segments.push({
        type: 'fork',
        branches: lane.branches.map((branch) => ({
          label: branch.label,
          cells: branch.nodes.map(cellOf),
        })),
      })
      if (!lane.to) break
      current = byId.get(lane.to) as FlowNode
      continue
    }

    const to = next.get(current.id)
    if (!to) break
    current = byId.get(to) as FlowNode
  }

  /* A malformed graph loses a node's *position*, never the node. This is what
     keeps `stages` in step with countNodes, which is the independent count. */
  for (const node of graph.nodes) {
    if (!visited.has(node.id)) emit(node)
  }

  const stages = segments.reduce(
    (total, segment) =>
      total +
      (segment.type === 'stage'
        ? 1
        : segment.branches.reduce((n, branch) => n + branch.cells.length, 0)),
    0,
  )

  const paths = (graph.lanes ?? []).reduce((widest, lane) => Math.max(widest, lane.branches.length), 1)

  return { segments, stages, paths }
}

/** Every kind the shape uses, in `order`. Drives a key listing only what is drawn. */
export function shapeKinds(shapes: ArchitectureShape[], order: FlowKind[]): FlowKind[] {
  const present = new Set<FlowKind>()
  for (const shape of shapes) {
    for (const segment of shape.segments) {
      if (segment.type === 'stage') present.add(segment.cell.kind)
      else for (const branch of segment.branches) for (const cell of branch.cells) present.add(cell.kind)
    }
  }
  return order.filter((kind) => present.has(kind))
}

/* -------------------------------------------------------------------------- */
/* Technology recurrence                                                      */
/* -------------------------------------------------------------------------- */

export type TechRecurrence = {
  name: string
  /** One flag per project, in the order `projects` was given. */
  present: boolean[]
  count: number
}

/**
 * How many of `projects` list each technology, keeping which ones.
 *
 * Names are compared verbatim, so 'Gemini Flash' and 'Google Gemini' stay two
 * rows, as do 'Semantic Search', 'Vector Search' and 'Embeddings'. Folding them
 * together here would be a lib quietly editing content; if they should merge,
 * that is an explicit alias map in content/projects.ts.
 */
export function techRecurrence(projects: Project[], minCount = 2): TechRecurrence[] {
  const rows = new Map<string, boolean[]>()

  projects.forEach((project, i) => {
    for (const name of project.tech) {
      let present = rows.get(name)
      if (!present) {
        present = new Array<boolean>(projects.length).fill(false)
        rows.set(name, present)
      }
      present[i] = true
    }
  })

  return [...rows.entries()]
    .map(([name, present]) => ({ name, present, count: present.filter(Boolean).length }))
    .filter((row) => row.count >= minCount)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/** Technologies appearing in exactly one project — stated, never charted. */
export function techSingletonCount(projects: Project[]): number {
  const seen = new Map<string, number>()
  for (const project of projects) {
    for (const name of project.tech) seen.set(name, (seen.get(name) ?? 0) + 1)
  }
  return [...seen.values()].filter((n) => n === 1).length
}

/* -------------------------------------------------------------------------- */
/* Impact figures                                                             */
/* -------------------------------------------------------------------------- */

export type ImpactDatum = {
  /**
   * Stable identity for the charts that render this figure.
   *
   * `label` cannot serve: it is a sentence fragment authored per highlight —
   * 'Less processing time', 'Less reporting time' — and two roles reporting the
   * same kind of win would write the same one. The role plus the highlight's
   * position within that role is unique by construction.
   */
  id: string
  /** The number the bar length encodes. */
  value: number
  /** Rendered verbatim, so the '%' survives. */
  display: string
  label: string
  roleId: string
  kind: ImpactKind
}

/**
 * Every `impact` in `companies`, flattened with the role that produced it.
 *
 * A figure without a parseable leading number is dropped rather than charted at
 * zero — a bar of length zero is a claim, and the wrong one.
 */
export function impactData(companies: Company[]): ImpactDatum[] {
  const out: ImpactDatum[] = []

  for (const company of companies) {
    for (const role of company.roles) {
      role.highlights.forEach((highlight, i) => {
        const impact = highlight.impact
        if (!impact) return

        const match = impact.value.match(/(\d+(?:\.\d+)?)/)
        if (!match?.[1]) return

        out.push({
          /* Indexed within the role, not within `out`: dropping an unparseable
             figure then shifts no other row's key. */
          id: `${role.id}-h${i}`,
          value: Number(match[1]),
          display: impact.value,
          label: impact.label,
          roleId: role.id,
          kind: impact.kind,
        })
      })
    }
  }

  return out
}
