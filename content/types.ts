/**
 * Shared content contracts.
 *
 * Every fact rendered on this site originates in `content/` and is traceable to
 * the resume (`public/Mohammad_Waseem_Resume.pdf`). Strings that express design
 * *rationale* rather than resume fact are marked with a `REVIEW:` comment.
 */

/** Visual role of a node, used only to pick its stroke/label treatment. */
export type FlowKind =
  | 'input'
  | 'compute'
  | 'store'
  | 'llm'
  | 'guard'
  | 'output'
  | 'human'

export type FlowNode = {
  id: string
  label: string
  kind: FlowKind
  /** Optional short caption rendered under the label on wide viewports. */
  note?: string
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
  title: string
  period: string
  location?: string
  /** Marks the role currently held. */
  current?: boolean
  highlights: Highlight[]
}

export type Highlight = {
  /** Short bolded lead-in, e.g. a system name. */
  name?: string
  body: string
  /** Rendered as an emphasised figure beside the bullet. */
  impact?: { value: string; label: string }
  tech?: string[]
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
