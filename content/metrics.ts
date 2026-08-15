import type { Metric } from './types'

/**
 * Credibility strip. Every figure is quoted from the resume — `source` records
 * which bullet, so the strip can be audited against the PDF without guesswork.
 */
export const metrics: Metric[] = [
  {
    value: '5+',
    label: 'Years Experience',
    source: 'Professional Summary — "5+ years of experience"',
  },
  {
    value: '75%',
    label: 'Reduction in Unsafe LLM Outputs',
    source: 'Lead SWE — LLM evaluation and guardrail framework',
  },
  {
    value: '40%',
    label: 'Reduction in Jira Resolution Time',
    source: 'Lead SWE — RAG-powered Jira support assistant',
  },
  {
    value: '30%',
    label: 'Reduction in LLM Token Usage',
    source: 'Lead SWE — prompt and retrieval optimizations',
  },
  {
    value: '70%',
    label: 'Reduction in Processing Time',
    source: 'SDE 2 — scheduled Python automation pipelines',
  },
  {
    value: '95%',
    label: 'Migration Accuracy',
    source: 'SDE 1 — Roslyn-based WCF-to-WebAPI code generator',
  },
  {
    value: '20+',
    label: 'Engineers Mentored / Interviewed',
    source: 'Accomplishments — "Interviewed, trained, and mentored 20+ engineers"',
  },
]
