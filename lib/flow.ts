import type { FlowKind } from '@/content/types'

/**
 * What a node kind is *called*, in plain English.
 *
 * Shared rather than local to the renderer because two things now name kinds
 * for a reader: FlowDiagram's screen-reader text, and the sequence strip in
 * components/chart/Chart.tsx together with its accessible table. If those two
 * drift, the same architecture gets described with two vocabularies — a
 * `compute` node reading "process" in the diagram and "compute" in the chart
 * that summarises it.
 *
 * Deliberately not the kind name verbatim: `compute`, `llm` and `guard` are
 * implementation vocabulary. The reader is told what the stage does.
 */
export const kindLabel: Record<FlowKind, string> = {
  input: 'input',
  compute: 'process',
  retrieval: 'retrieval',
  store: 'data store',
  llm: 'model',
  guard: 'validation',
  output: 'output',
  human: 'human review',
}
