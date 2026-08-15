import type { Company } from './types'

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
        title: 'Lead Software Engineer',
        period: 'Aug 2025 – Present',
        current: true,
        highlights: [
          {
            name: 'Intelligent Data Analytics Orchestrator (IDAO)',
            body: 'Engineered a multi-agent, RAG-driven system that generates schema-validated SQL queries, analytical summaries, and frontend-ready visualization JSON from natural language inputs.',
            tech: ['Multi-Agent', 'RAG', 'SQL Generation', 'Schema Validation'],
          },
          {
            name: 'LLM Evaluation & Guardrail Framework',
            body: 'Architected an automated evaluation and guardrail framework incorporating toxicity detection, jailbreak mitigation, and factuality validation.',
            impact: { value: '75%', label: 'fewer unsafe outputs' },
            tech: ['Toxicity Detection', 'Jailbreak Mitigation', 'Factuality Validation'],
          },
          {
            name: 'RAG Jira Support Assistant',
            body: 'Built a RAG-powered support assistant integrating FastAPI webhooks, Qdrant semantic retrieval, and Gemini Flash to auto-surface similar historical tickets and suggested RCA.',
            impact: { value: '40%', label: 'faster ticket resolution' },
            tech: ['FastAPI', 'Qdrant', 'Gemini Flash', 'RAG'],
          },
          {
            body: 'Engineered prompt and retrieval optimizations that reduced LLM token usage, significantly lowering inference costs without degrading output fidelity.',
            impact: { value: '30%', label: 'lower token usage' },
            tech: ['Prompt Optimization', 'Retrieval Tuning'],
          },
          {
            body: 'Worked across multiple vector retrieval and storage architectures — Qdrant and FAISS for dedicated vector search, ClickHouse vector similarity and PostgreSQL with pgvector where embeddings sit alongside existing relational data — selecting per system rather than standardising on a single store.',
            tech: ['Qdrant', 'FAISS', 'ClickHouse', 'pgvector', 'Vector Search'],
          },
        ],
      },
      {
        title: 'Software Development Engineer 2',
        period: 'Aug 2023 – Jul 2025',
        highlights: [
          {
            name: 'SmartNav',
            body: 'Engineered an intent-based semantic report routing system using embedding-driven FAISS retrieval to dynamically resolve user intent into structured navigation JSON.',
            tech: ['FAISS', 'Embeddings', 'Semantic Retrieval'],
          },
          {
            body: 'Replaced manual training data updates with scheduled Python automation pipelines, enabling continuous vector refresh in Qdrant and automated accuracy reporting.',
            impact: { value: '70%', label: 'less processing time' },
            tech: ['Python', 'Qdrant', 'Automation Pipelines'],
          },
          {
            body: 'Designed strongly-typed event contracts to enforce schema validation across LLM streaming and REST interfaces, preventing runtime schema drift.',
            tech: ['Schema Validation', 'Token-Level Streaming', 'REST'],
          },
        ],
      },
      {
        title: 'Software Development Engineer 1',
        period: 'Jun 2022 – Jul 2023',
        highlights: [
          {
            body: 'Architected API-based backend systems using .NET 7.',
            impact: { value: '20%', label: 'shorter development cycle' },
            tech: ['.NET 7', 'REST APIs'],
          },
          {
            body: 'Built a Roslyn-based code generator to automate WCF-to-WebAPI migration, cutting manual effort by 50%.',
            impact: { value: '95%', label: 'migration accuracy' },
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
        title: 'Software Development Engineer 1',
        period: 'Aug 2021 – May 2022',
        highlights: [
          {
            body: 'Developed backend modules in C# and ASP.NET for financial analysis systems.',
            impact: { value: '18%', label: 'better predictive accuracy' },
            tech: ['C#', 'ASP.NET'],
          },
          {
            body: 'Automated reporting workflows using batch processing and SSRS.',
            impact: { value: '35%', label: 'less reporting time' },
            tech: ['Batch Processing', 'SSRS'],
          },
        ],
      },
    ],
  },
]

export const education = {
  school: 'Kamla Nehru Institute of Technology',
  degree: 'Bachelor of Technology in Information Technology',
  period: 'Aug 2017 – May 2021',
  location: 'Sultanpur, Uttar Pradesh',
}

export const accomplishments = [
  'Interviewed, trained, and mentored 20+ engineers, contributing to improved onboarding efficiency and technical capability across teams.',
]
