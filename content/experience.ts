import type { ChartTone, Company, Education } from './types'

/**
 * Career timeline.
 *
 * Date note: the resume prints "Jun 2022 – Present" against the *company*, and
 * gives no explicit range for the Lead role. Since SDE 2 ends Jul 2025, the Lead
 * role is dated Aug 2025 – Present so the progression reads without overlap.
 * The company band below still carries the resume's Jun 2022 – Present.
 */
export const companies: Company[] = [
  {
    name: 'Surya Financial Technology Pvt. Ltd.',
    period: 'Jun 2022 – Present',
    location: 'Bangalore, Karnataka',
    roles: [
      {
        id: 'sft-lead',
        title: 'Lead Software Engineer',
        start: '2025-08',
        end: null,
        highlights: [
          {
            name: 'Intelligent Data Analytics Orchestrator (IDAO)',
            body: 'Engineered a multi-agent, RAG-driven system that generates schema-validated SQL queries, analytical summaries, and frontend-ready visualization JSON from natural language inputs.',
            tech: ['Multi-Agent', 'RAG', 'SQL Generation', 'Schema Validation'],
          },
          {
            name: 'LLM Evaluation & Guardrail Framework',
            body: 'Architected an automated evaluation and guardrail framework incorporating toxicity detection, jailbreak mitigation, and factuality validation.',
            impact: { value: '75%', label: 'fewer unsafe outputs', kind: 'reduction' },
            tech: ['Toxicity Detection', 'Jailbreak Mitigation', 'Factuality Validation'],
          },
          {
            name: 'RAG Jira Support Assistant',
            body: 'Built a RAG-powered support assistant integrating FastAPI webhooks, Qdrant semantic retrieval, and Gemini Flash to auto-surface similar historical tickets and suggested RCA.',
            impact: { value: '40%', label: 'faster ticket resolution', kind: 'reduction' },
            tech: ['FastAPI', 'Qdrant', 'Gemini Flash', 'RAG'],
          },
          {
            body: 'Engineered prompt and retrieval optimizations that reduced LLM token usage, significantly lowering inference costs without degrading output fidelity.',
            impact: { value: '30%', label: 'lower token usage', kind: 'reduction' },
            tech: ['Prompt Optimization', 'Retrieval Tuning'],
          },
          {
            body: 'Worked across multiple vector retrieval and storage architectures — Qdrant and FAISS for dedicated vector search, ClickHouse vector similarity and PostgreSQL with pgvector where embeddings sit alongside existing relational data — selecting per system rather than standardising on a single store.',
            tech: ['Qdrant', 'FAISS', 'ClickHouse', 'pgvector', 'Vector Search'],
          },
        ],
      },
      {
        id: 'sft-sde2',
        title: 'Software Development Engineer 2',
        start: '2023-08',
        end: '2025-07',
        highlights: [
          {
            name: 'SmartNav',
            body: 'Engineered an intent-based semantic report routing system using embedding-driven FAISS retrieval to dynamically resolve user intent into structured navigation JSON.',
            tech: ['FAISS', 'Embeddings', 'Semantic Retrieval'],
          },
          {
            body: 'Replaced manual training data updates with scheduled Python automation pipelines, enabling continuous vector refresh in Qdrant and automated accuracy reporting.',
            impact: { value: '70%', label: 'less processing time', kind: 'reduction' },
            tech: ['Python', 'Qdrant', 'Automation Pipelines'],
          },
          {
            body: 'Designed strongly-typed event contracts to enforce schema validation across LLM streaming and REST interfaces, preventing runtime schema drift.',
            tech: ['Schema Validation', 'Token-Level Streaming', 'REST'],
          },
        ],
      },
      {
        id: 'sft-sde1',
        title: 'Software Development Engineer 1',
        start: '2022-06',
        end: '2023-07',
        highlights: [
          {
            body: 'Architected API-based backend systems using .NET 7.',
            impact: { value: '20%', label: 'shorter development cycle', kind: 'reduction' },
            tech: ['.NET 7', 'REST APIs'],
          },
          {
            body: 'Built a Roslyn-based code generator to automate WCF-to-WebAPI migration, cutting manual effort by 50%.',
            impact: { value: '95%', label: 'migration accuracy', kind: 'accuracy' },
            tech: ['Roslyn', 'C#', 'Code Generation'],
          },
        ],
      },
    ],
  },
  {
    name: 'Surya Software Systems Pvt. Ltd.',
    period: 'Aug 2021 – May 2022',
    location: 'Bangalore, Karnataka',
    roles: [
      {
        id: 'sss-sde1',
        title: 'Software Development Engineer 1',
        start: '2021-08',
        end: '2022-05',
        highlights: [
          {
            body: 'Developed backend modules in C# and ASP.NET for financial analysis systems.',
            impact: { value: '18%', label: 'better predictive accuracy', kind: 'accuracy' },
            tech: ['C#', 'ASP.NET'],
          },
          {
            body: 'Automated reporting workflows using batch processing and SSRS.',
            impact: { value: '35%', label: 'less reporting time', kind: 'reduction' },
            tech: ['Batch Processing', 'SSRS'],
          },
        ],
      },
    ],
  },
]

export const education: Education = {
  school: 'Kamla Nehru Institute of Technology',
  degree: 'Bachelor of Technology in Information Technology',
  start: '2017-08',
  end: '2021-05',
  location: 'Sultanpur, Uttar Pradesh',
}

/**
 * The month the "Present" end of the career timeline is drawn to.
 *
 * Deliberately not `new Date()`. This site is `output: 'export'`, so a
 * build-time date bakes the build date into the HTML: the current role's band
 * would silently lengthen on every rebuild and silently stall on a stale
 * deploy, with nothing on the page admitting to either. Hand-maintained exactly
 * like `leetcode.capturedOn`, and rendered on the page as the right-hand axis
 * tick and again in the chart's caveat — so a stale figure is visible as stale
 * rather than merely wrong.
 */
export const timelineAsOf = '2026-09'

/**
 * Fixed series identity for the impact and timeline charts, in career order.
 *
 * Never indexed by array position at render time and never cycled: a new role
 * has to be appended here explicitly, which is what guarantees no existing role
 * ever changes colour when one is added. The current role takes `compute` —
 * the accent — matching the "Current" chip on the timeline below it.
 */
export const roleSeries = [
  {
    id: 'sss-sde1',
    code: 'SDE1 · SSS',
    label: 'SDE 1 · Surya Software Systems',
    tone: 'input',
  },
  {
    id: 'sft-sde1',
    code: 'SDE1 · SFT',
    label: 'SDE 1 · Surya Financial Technology',
    tone: 'retrieval',
  },
  {
    id: 'sft-sde2',
    code: 'SDE2 · SFT',
    label: 'SDE 2 · Surya Financial Technology',
    tone: 'guard',
  },
  {
    id: 'sft-lead',
    code: 'LEAD · SFT',
    label: 'Lead · Surya Financial Technology',
    tone: 'compute',
  },
] as const satisfies readonly {
  id: string
  code: string
  label: string
  tone: ChartTone
}[]

export type RoleSeries = (typeof roleSeries)[number]

/**
 * Series lookup for a role id, checked in both directions at module load.
 *
 * The check is the point. Without it a role whose id nobody added to
 * `roleSeries` would fall through to a default colour and render as a bar that
 * looks deliberate and is not — the quietest possible way for a chart to lie.
 * `output: 'export'` means module load happens during `next build`, so a
 * mismatch fails the build rather than reaching a page.
 */
const roleSeriesById: ReadonlyMap<string, RoleSeries> = (() => {
  const map = new Map<string, RoleSeries>(roleSeries.map((series) => [series.id, series]))
  const roleIds = companies.flatMap((company) => company.roles.map((role) => role.id))

  for (const id of roleIds) {
    if (!map.has(id)) {
      throw new Error(`roleSeries has no entry for role "${id}" — charts would mis-colour it.`)
    }
  }
  for (const series of roleSeries) {
    if (!roleIds.includes(series.id)) {
      throw new Error(`roleSeries has an entry for "${series.id}", which is not a role.`)
    }
  }

  return map
})()

/** Non-optional accessor — presence is guaranteed by the check above. */
export function roleSeriesFor(id: string): RoleSeries {
  const series = roleSeriesById.get(id)
  if (!series) throw new Error(`No chart series for role "${id}".`)
  return series
}

export const accomplishments = [
  'Interviewed, trained, and mentored 20+ engineers, contributing to improved onboarding efficiency and technical capability across teams.',
]
