import type { Company, FlowGraph, ImpactKind, Project } from '@/content/types'

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

/**
 * Edges, including every connection a lane implies.
 *
 * `graph.edges.length` reports 3 for Adaptive RAG, which would rank the only
 * non-linear architecture on the site as its simplest. A lane group draws one
 * fan-out edge per branch, one convergence edge per branch when `lane.to` is
 * set, and `n - 1` links inside each branch.
 */
export function countEdges(graph: FlowGraph): number {
  const inLanes = (graph.lanes ?? []).reduce((total, lane) => {
    const fanOut = lane.branches.length
    const converge = lane.to ? lane.branches.length : 0
    const within = lane.branches.reduce((n, branch) => n + Math.max(0, branch.nodes.length - 1), 0)
    return total + fanOut + converge + within
  }, 0)
  return graph.edges.length + inLanes
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
      for (const highlight of role.highlights) {
        const impact = highlight.impact
        if (!impact) continue

        const match = impact.value.match(/(\d+(?:\.\d+)?)/)
        if (!match?.[1]) continue

        out.push({
          value: Number(match[1]),
          display: impact.value,
          label: impact.label,
          roleId: role.id,
          kind: impact.kind,
        })
      }
    }
  }

  return out
}
