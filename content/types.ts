/**
 * Shared content contracts.
 *
 * Every fact rendered on this site originates in `content/` and is traceable to
 * the resume (`public/Mohammad_Waseem_Resume.pdf`). Strings that express design
 * *rationale* rather than resume fact are marked with a `REVIEW:` comment.
 */

/**
 * Visual role of a node, used to pick its dot, outline colour, and — for `llm`
 * — its outline *style*.
 *
 * `retrieval` is separate from `compute` on purpose. Lumping them together gave
 * routing, orchestration, and retrieval one shared colour, which flattened the
 * distinction the site spends its Principles section drawing.
 */
export type FlowKind =
  | 'input'
  | 'compute'
  | 'retrieval'
  | 'store'
  | 'llm'
  | 'guard'
  | 'output'
  | 'human'

/**
 * Series colour for a chart, drawn from the diagram palette so charts and
 * diagrams cannot drift apart and every fill is already contrast-checked
 * against `raised`.
 *
 * `llm` is excluded deliberately: it resolves to the same value as `compute`,
 * so offering it would let two series in one chart pick the same colour. The
 * diagram renderers can afford the collision because they also draw `llm` with
 * a dashed outline; a flat bar has no second channel to fall back on.
 *
 * These are fills and legend swatches only, never text. `node-guard` measures
 * 4.11:1 and `node-retrieval` 4.48:1 on `raised` — past the 3:1 non-text floor
 * a bar needs, short of the 4.5:1 AA floor a label needs.
 */
export type ChartTone = Exclude<FlowKind, 'llm'>

export type FlowNode = {
  id: string
  label: string
  kind: FlowKind
  /** Optional short caption rendered under the label on wide viewports. */
  note?: string
  /**
   * Id of the node this one hangs off laterally rather than following in the
   * sequence — a store queried by a step, not a stage the request passes
   * through. Renderers draw it beside its host; it never occupies a position
   * in the main chain.
   */
  attachedTo?: string
}

export type FlowEdge = {
  from: string
  to: string
  /** Rendered as a small monospace annotation beside the connector. */
  label?: string
  /** Bidirectional connectors get arrowheads at both ends. */
  bidirectional?: boolean
}

/**
 * A diagram is stored as data, not markup. One renderer (`components/diagram/
 * FlowDiagram.tsx`) draws every diagram on the site, which is what makes the
 * mobile vertical-flow requirement a render mode instead of a second asset.
 *
 * `lanes` describes parallel branches that fan out from a single node and
 * re-converge; the renderer lays them out side by side above `md` and stacks
 * them below it.
 */
export type FlowGraph = {
  nodes: FlowNode[]
  edges: FlowEdge[]
  lanes?: FlowLane[]
}

export type FlowLane = {
  /** Node id the lanes fan out from. */
  from: string
  /** Node id the lanes converge back into, if any. */
  to?: string
  branches: { label: string; nodes: FlowNode[] }[]
}

export type Metric = {
  value: string
  label: string
  /** Where in the resume this figure comes from. Not rendered; kept for audit. */
  source: string
}

export type Role = {
  /**
   * Stable key, independent of the title string — two roles share the title
   * "Software Development Engineer 1". Also the series key for the charts.
   */
  id: string
  title: string
  /** Inclusive first month, ISO `YYYY-MM`. */
  start: string
  /** Inclusive last month, ISO `YYYY-MM`; `null` means still held. */
  end: string | null
  location?: string
  highlights: Highlight[]
}

export type Highlight = {
  /** Short bolded lead-in, e.g. a system name. */
  name?: string
  body: string
  /** Rendered as an emphasised figure beside the bullet. */
  impact?: { value: string; label: string; kind: ImpactKind }
  tech?: string[]
}

/**
 * What a percentage actually measures.
 *
 * Only `reduction` figures may share a bar axis. An accuracy figure is a *level*
 * or a *change in* a level, not a fall against a baseline; drawing it beside a
 * reduction on one 0-100% axis makes "95% accurate" read as a larger achievement
 * than "75% fewer unsafe outputs", which it is not — they are not the same
 * quantity. components/sections/ImpactChart.tsx splits on this rather than
 * mixing them and apologising in a caption.
 */
export type ImpactKind = 'reduction' | 'accuracy'

export type Education = {
  school: string
  degree: string
  /** Inclusive first month, ISO `YYYY-MM`. */
  start: string
  /** Inclusive last month, ISO `YYYY-MM`. */
  end: string
  location: string
}

export type Company = {
  name: string
  period: string
  location: string
  roles: Role[]
}

export type ProjectSection = {
  heading: string
  body: string
}

export type Project = {
  slug: string
  name: string
  shortName: string
  category: string
  /** Distinguishes personal work from work shipped at an employer. */
  personal?: boolean
  /** One-line summary used on the home-page card. */
  summary: string
  problem: string
  solution: string
  architecture: FlowGraph
  decisions: ProjectSection[]
  challenges: ProjectSection[]
  /**
   * Quantified results only — these render in the large-figure treatment, so a
   * non-numeric string here would read as a measurement that was never taken.
   * Qualitative results belong in `outcomes`.
   */
  impact: { value: string; label: string }[]
  /** Capability statements for work the resume does not quantify. */
  outcomes: string[]
  tech: string[]
  takeaway: string
  /** Optional deeper notes, rendered inside collapsed <details>. */
  details?: ProjectSection[]
}

export type SkillGroup = {
  name: string
  items: string[]
}

export type LeetCodeTopic = {
  name: string
  count: number
}

export type LeetCodeTopicGroup = {
  /** Difficulty tier as LeetCode labels it: Advanced / Intermediate / Fundamental. */
  name: string
  topics: LeetCodeTopic[]
}

export type ArchLayer = {
  id: string
  name: string
  tech: string
  role: string
  detail: string
}

export type Principle = {
  title: string
  body: string
}
