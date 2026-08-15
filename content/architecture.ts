import type { ArchLayer, FlowGraph } from './types'

/**
 * The pipeline rendered in the hero. Shared by the SVG showpiece (wide screens)
 * and the standard FlowDiagram (narrow screens) so the labels have one source.
 */
export const heroFlow: FlowGraph = {
  nodes: [
    { id: 'query', label: 'User Query', kind: 'input' },
    { id: 'router', label: 'Intent / Router', kind: 'compute' },
    { id: 'agents', label: 'Agent Orchestration', kind: 'compute' },
    { id: 'retrieval', label: 'Retrieval', kind: 'compute' },
    { id: 'vectordb', label: 'Vector DB', kind: 'store' },
    { id: 'llm', label: 'LLM', kind: 'llm' },
    { id: 'guardrails', label: 'Validation / Guardrails', kind: 'guard' },
    { id: 'response', label: 'Structured Response', kind: 'output' },
  ],
  edges: [
    { from: 'query', to: 'router' },
    { from: 'router', to: 'agents' },
    { from: 'agents', to: 'retrieval' },
    { from: 'retrieval', to: 'vectordb', bidirectional: true },
    { from: 'vectordb', to: 'llm' },
    { from: 'llm', to: 'guardrails' },
    { from: 'guardrails', to: 'response' },
  ],
}

/**
 * The end-to-end stack, top (closest to the user) to bottom (cross-cutting).
 * Every layer names only technologies that appear on the resume.
 */
export const archLayers: ArchLayer[] = [
  {
    id: 'application',
    name: 'Application',
    tech: 'React',
    role: 'Where model output becomes something a person can act on.',
    detail:
      'The client consumes structured contracts — visualization JSON, navigation JSON, streamed tokens — rather than free-form text it has to interpret. Keeping the contract typed is what lets the interface stay deterministic while the layer beneath it is probabilistic.',
  },
  {
    id: 'api',
    name: 'API',
    tech: 'FastAPI · ASP.NET Core',
    role: 'The service boundary, and where streaming responses originate.',
    detail:
      'Async FastAPI services handle LLM-backed request paths, including token-level streaming over NDJSON so a client can render progressively instead of waiting for a complete response. ASP.NET Core covers the .NET side of the estate; strongly-typed event contracts keep both consistent across streaming and REST interfaces.',
  },
  {
    id: 'orchestration',
    name: 'Orchestration',
    tech: 'LangGraph · Multi-Agent',
    role: 'Decides which components run, in what order, under what conditions.',
    detail:
      'Non-trivial AI features are not one model call. Orchestration decomposes a request across specialised agents and routes conditionally on runtime state — including deciding that retrieval was insufficient and a different path is needed.',
  },
  {
    id: 'retrieval',
    name: 'Retrieval',
    tech: 'Qdrant · FAISS',
    role: 'Grounds generation in real source material.',
    detail:
      'Qdrant for served vector search with payload filtering, FAISS for in-process similarity over a bounded index. The choice between them is a deployment decision: a separate service versus a library inside the request path.',
  },
  {
    id: 'embeddings',
    name: 'Embeddings',
    tech: 'SentenceTransformers · Vector Search',
    role: 'Turns text into the geometry retrieval searches over.',
    detail:
      'Local embedding pipelines (all-MiniLM-L6-v2, 384-dim) keep indexing cost independent of an API, with cosine similarity as the distance measure. The index has to be refreshed as the underlying corpus changes or retrieval quality decays quietly.',
  },
  {
    id: 'llm',
    name: 'LLM',
    tech: 'Gemini · Gemini Flash',
    role: 'The generation step — deliberately not the whole system.',
    detail:
      'Model selection is a latency and cost decision made per task: a fast model for high-volume drafting, a heavier one where reasoning quality dominates. Prompt and retrieval optimisation at this boundary reduced token usage by 30% without degrading output fidelity.',
  },
  {
    id: 'validation',
    name: 'Validation',
    tech: 'Pydantic v2 · Guardrails',
    role: 'Treats model output as untrusted input.',
    detail:
      'Responses are validated against schemas before anything downstream consumes them, and safety checks — toxicity, jailbreak, factuality — gate release. Structured output is a contract; a response that does not satisfy it is rejected or regenerated rather than passed along.',
  },
  {
    id: 'evaluation',
    name: 'Evaluation & Delivery',
    tech: 'Docker · GitHub Actions · CI/CD',
    role: 'Makes changes to an AI system measurable and repeatable.',
    detail:
      'The same checks that gate live responses score prompt and model changes offline, so a change can be evaluated before it ships. Containerised services and CI/CD pipelines make that loop routine rather than manual.',
  },
]
