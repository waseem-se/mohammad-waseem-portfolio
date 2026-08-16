import type { Project } from './types'

/**
 * Featured projects.
 *
 * Facts (systems, technologies, metrics) come from the resume. Strings tagged
 * `REVIEW:` express *design rationale* inferred from the stated stack and
 * outcomes — they assert no metric, scale figure, team size, timeline, or
 * customer beyond the resume. Read them before publishing.
 */
export const projects: Project[] = [
  {
    slug: 'intelligent-data-analytics-orchestrator',
    name: 'Intelligent Data Analytics Orchestrator',
    shortName: 'IDAO',
    category: 'Multi-Agent RAG',
    summary:
      'Multi-agent RAG system that turns a natural language question into schema-validated SQL, an analytical summary, and visualization JSON the frontend can render directly.',
    problem:
      'Business users needed answers from a relational warehouse without writing SQL. A single-prompt text-to-SQL call is not sufficient: it has no view of the schema it is querying, no way to verify the SQL it emits is valid before execution, and no structured output the frontend can chart without a human interpreting the result.',
    solution:
      'A multi-agent pipeline decomposes the request. Intent understanding classifies what is being asked, an orchestration layer routes the work across specialised agents, retrieval grounds generation in the relevant schema context, and the generated SQL is validated against that schema before it is allowed to execute. Results are summarised analytically and emitted alongside a visualization JSON contract the frontend consumes directly.',
    architecture: {
      nodes: [
        { id: 'q', label: 'Natural Language Query', kind: 'input' },
        { id: 'intent', label: 'Intent / Task Understanding', kind: 'compute' },
        { id: 'orch', label: 'Agent Orchestration', kind: 'compute' },
        { id: 'retrieval', label: 'Retrieval', kind: 'retrieval', note: 'Schema context' },
        { id: 'sql', label: 'SQL Generation', kind: 'llm' },
        { id: 'validate', label: 'Schema Validation', kind: 'guard' },
        { id: 'exec', label: 'Execution', kind: 'compute' },
        { id: 'analytics', label: 'Analytics', kind: 'compute' },
        { id: 'viz', label: 'Visualization JSON', kind: 'output' },
      ],
      edges: [
        { from: 'q', to: 'intent' },
        { from: 'intent', to: 'orch' },
        { from: 'orch', to: 'retrieval' },
        { from: 'retrieval', to: 'sql' },
        { from: 'sql', to: 'validate' },
        { from: 'validate', to: 'exec' },
        { from: 'exec', to: 'analytics' },
        { from: 'analytics', to: 'viz' },
      ],
    },
    decisions: [
      {
        heading: 'Multiple agents over one large prompt',
        // REVIEW: rationale inferred from the multi-agent design stated on the resume.
        body: 'Intent classification, SQL generation, and analysis are separable concerns with different failure modes. Splitting them means each step has a narrow contract that can be validated on its own, and a failure is attributable to a specific stage rather than to one opaque completion.',
      },
      {
        heading: 'Validation sits before execution, not after',
        // REVIEW: rationale inferred from "schema-validated SQL queries".
        body: 'Generated SQL is checked against the schema before it reaches the database. Catching an invalid column at validation time is a cheap retry; catching it at execution time means a failed query against production data.',
      },
      {
        heading: 'Visualization emitted as JSON, not prose',
        // REVIEW: rationale inferred from "frontend-ready visualization JSON".
        body: 'The frontend receives a structured chart contract rather than a description it has to parse. That keeps rendering deterministic and moves the presentation decision into typed data the client already knows how to consume.',
      },
      {
        heading: 'Retrieval grounds generation in schema context',
        // REVIEW: rationale inferred from the RAG-driven design stated on the resume.
        body: 'Rather than putting an entire warehouse schema in the prompt, retrieval surfaces only the tables and columns relevant to the question. This keeps the prompt small and the generation focused on structures that actually exist.',
      },
    ],
    challenges: [
      {
        heading: 'Keeping generated SQL inside the schema',
        // REVIEW: challenge inferred from the schema-validation design.
        body: 'A language model will confidently reference a plausible column that does not exist. The validation stage exists specifically to make that failure non-fatal and recoverable rather than a runtime error.',
      },
      {
        heading: 'Coordinating state across agents',
        // REVIEW: challenge inferred from the multi-agent orchestration design.
        body: 'Each stage needs the output of the last in a predictable shape. Typed contracts between stages keep the orchestration layer from becoming the place where every ambiguity is resolved by hand.',
      },
      {
        heading: 'Producing a chart contract that survives arbitrary queries',
        // REVIEW: challenge inferred from the visualization JSON output.
        body: 'The visualization output has to describe results whose shape is not known ahead of time, while staying within a contract the frontend can render without special-casing.',
      },
    ],
    impact: [],
    outcomes: [
      'Natural language questions resolved into executable, schema-validated SQL.',
      'Analytical summaries and frontend-ready visualization JSON emitted as structured contracts.',
    ],
    tech: [
      'Python',
      'Multi-Agent Orchestration',
      'RAG',
      'SQL Generation',
      'Schema Validation',
      'FastAPI',
      'Pydantic v2',
    ],
    takeaway:
      'Demonstrates decomposing an ambiguous natural-language task into a staged pipeline where every boundary is a validated contract — and treating generated SQL as untrusted input that must be proven correct before it touches a database.',
  },

  {
    slug: 'llm-evaluation-guardrail-framework',
    name: 'LLM Evaluation & Guardrail Framework',
    shortName: 'Guardrails',
    category: 'AI Safety / Evaluation',
    summary:
      'Automated evaluation and guardrail layer that scores model output for toxicity, jailbreak attempts, and factuality, then accepts, rejects, or regenerates.',
    problem:
      'LLM features shipped without an automated safety layer rely on manual review, which does not scale and does not run on every response. Unsafe or unfaithful output reaching a user is a product and compliance problem, and without measurement there is no way to know whether a prompt or model change made things better or worse.',
    solution:
      'Every model output passes through an evaluation pipeline before release. Toxicity detection, jailbreak mitigation, and factuality validation each produce a signal, and a decision stage combines them into one of three outcomes: accept the response, reject it, or regenerate. Because the checks are automated they run on every response rather than on a sample, and the same pipeline doubles as the measurement harness for prompt and model changes.',
    architecture: {
      nodes: [
        { id: 'out', label: 'LLM Output', kind: 'input' },
        { id: 'pipeline', label: 'Evaluation Pipeline', kind: 'compute' },
        { id: 'tox', label: 'Toxicity', kind: 'guard' },
        { id: 'jail', label: 'Jailbreak', kind: 'guard' },
        { id: 'fact', label: 'Factuality', kind: 'guard' },
        { id: 'decision', label: 'Decision', kind: 'compute' },
        { id: 'result', label: 'Accept / Reject / Regenerate', kind: 'output' },
      ],
      edges: [
        { from: 'out', to: 'pipeline' },
        { from: 'pipeline', to: 'tox' },
        { from: 'tox', to: 'jail' },
        { from: 'jail', to: 'fact' },
        { from: 'fact', to: 'decision' },
        { from: 'decision', to: 'result' },
      ],
    },
    decisions: [
      {
        heading: 'Three distinct checks, not one safety score',
        // REVIEW: rationale inferred from the three named checks on the resume.
        body: 'Toxicity, jailbreak attempts, and factual drift are different failures with different responses. Collapsing them into a single number would discard the information needed to decide between rejecting a response and regenerating it.',
      },
      {
        heading: 'Regenerate as a first-class outcome',
        // REVIEW: rationale inferred from the Accept / Reject / Regenerate decision stage.
        body: 'A binary accept/reject turns every recoverable failure into a dead end for the user. Regeneration lets the system retry a response that failed for a fixable reason before giving up.',
      },
      {
        heading: 'Evaluation and guardrails in the same framework',
        // REVIEW: rationale inferred from "automated LLM evaluation and guardrail framework".
        body: 'The checks that gate a live response are the same ones that score a prompt change offline. Sharing one implementation means the measurement reflects what actually runs in the request path.',
      },
    ],
    challenges: [
      {
        heading: 'Latency budget',
        // REVIEW: challenge inherent to an inline guardrail layer; no figures asserted.
        body: 'Guardrails sit in the request path, so every check spends part of the response budget. The pipeline has to be strict enough to matter without making the feature feel slow.',
      },
      {
        heading: 'False positives are their own failure',
        // REVIEW: challenge inherent to safety classification.
        body: 'A guardrail that rejects legitimate responses degrades the product as surely as one that lets unsafe output through. Thresholds have to be tuned against both directions, not just the unsafe one.',
      },
      {
        heading: 'Validating factuality without a ground truth',
        // REVIEW: challenge inherent to factuality validation.
        body: 'Factuality checking has to work against retrieved context rather than an oracle, which makes it a question of faithfulness to source material rather than absolute truth.',
      },
    ],
    impact: [{ value: '75%', label: 'Reduction in unsafe outputs' }],
    outcomes: [],
    tech: [
      'Python',
      'LLM Evaluation',
      'Guardrails',
      'Toxicity Detection',
      'Jailbreak Mitigation',
      'Factuality Validation',
    ],
    takeaway:
      'Demonstrates treating model output as untrusted by default and building the measurement layer that makes AI safety an engineering property with a number attached, rather than an assurance.',
  },

  {
    slug: 'rag-jira-support-assistant',
    name: 'RAG Jira Support Assistant',
    shortName: 'Jira Assistant',
    category: 'Retrieval-Augmented Generation',
    summary:
      'FastAPI webhook service that reacts to Jira tickets, retrieves semantically similar historical tickets from Qdrant, and drafts a suggested root cause analysis with Gemini Flash.',
    problem:
      'Support engineers were re-solving problems the organisation had already solved. The knowledge existed in historical Jira tickets, but keyword search does not find a ticket that describes the same failure in different words, so prior resolutions stayed effectively invisible and time went into rediscovery.',
    solution:
      'A FastAPI webhook fires when a ticket is created. The ticket text is embedded and used to retrieve semantically similar historical tickets from Qdrant, which are passed as grounding context to Gemini Flash to draft a suggested root cause analysis. The engineer receives prior similar tickets and a starting hypothesis attached to the ticket rather than an empty queue.',
    architecture: {
      nodes: [
        { id: 'hook', label: 'Jira Webhook', kind: 'input' },
        { id: 'api', label: 'FastAPI', kind: 'compute' },
        { id: 'retrieval', label: 'Semantic Retrieval', kind: 'retrieval' },
        { id: 'qdrant', label: 'Qdrant', kind: 'store' },
        { id: 'tickets', label: 'Historical Tickets', kind: 'store' },
        { id: 'gemini', label: 'Gemini Flash', kind: 'llm' },
        { id: 'rca', label: 'Suggested RCA', kind: 'output' },
      ],
      edges: [
        { from: 'hook', to: 'api' },
        { from: 'api', to: 'retrieval' },
        { from: 'retrieval', to: 'qdrant' },
        { from: 'qdrant', to: 'tickets' },
        { from: 'tickets', to: 'gemini' },
        { from: 'gemini', to: 'rca' },
      ],
    },
    decisions: [
      {
        heading: 'Semantic retrieval over keyword search',
        // REVIEW: rationale inferred from the stated Qdrant semantic retrieval design.
        body: 'Two tickets describing the same underlying failure rarely share vocabulary. Embedding similarity matches on meaning, which is the only way historical tickets surface for a differently-worded report.',
      },
      {
        heading: 'Webhook-driven rather than an interface to visit',
        // REVIEW: rationale inferred from the FastAPI webhook integration.
        body: 'The assistant runs where the work already happens. A separate tool that engineers have to remember to open gets used inconsistently; a webhook attaches context to the ticket automatically.',
      },
      {
        heading: 'Gemini Flash for the drafting step',
        // REVIEW: rationale inferred from the stated model choice.
        body: 'The generation step summarises retrieved context into a suggested RCA. That is a latency-sensitive, high-volume task on every ticket, which favours a fast model over a heavier one.',
      },
      {
        heading: 'Suggested, not applied',
        // REVIEW: rationale inferred from the "suggested RCA" framing on the resume.
        body: 'The output is a starting point for an engineer, not an automated resolution. Framing it as a suggestion keeps a human in the decision and makes an occasional wrong hypothesis cheap.',
      },
    ],
    challenges: [
      {
        heading: 'Keeping the index current',
        // REVIEW: challenge inherent to a live retrieval corpus.
        body: 'The corpus grows continuously as tickets are filed and resolved. Retrieval quality depends on newly resolved tickets becoming searchable rather than the index reflecting a stale snapshot.',
      },
      {
        heading: 'Similar is not the same',
        // REVIEW: challenge inherent to semantic retrieval.
        body: 'Nearest-neighbour search always returns something. Retrieved tickets that merely look similar can lead a suggested RCA in the wrong direction, which is part of why the output stays advisory.',
      },
    ],
    impact: [{ value: '40%', label: 'Reduction in ticket resolution time' }],
    outcomes: [],
    tech: ['FastAPI', 'Qdrant', 'Gemini Flash', 'RAG', 'Python', 'AsyncIO', 'Semantic Search'],
    takeaway:
      'Demonstrates delivering retrieval-augmented generation into an existing workflow through an event-driven service — and choosing the integration point so the system is used by default rather than by intention.',
  },

  {
    slug: 'smartnav',
    name: 'SmartNav',
    shortName: 'SmartNav',
    category: 'Semantic Retrieval / Intent Routing',
    summary:
      'Intent-based report routing that resolves what a user is asking for into structured navigation JSON using embedding-driven FAISS retrieval.',
    problem:
      'Users knew the information they wanted but not which report contained it, or what it was named. Navigating a large catalogue of reports through menus assumes you already know the structure — which puts the burden of knowing the system on the person trying to use it.',
    solution:
      'User intent is embedded and matched against report embeddings in a FAISS index. The nearest match resolves to structured navigation JSON that the application consumes to route the user directly to the correct report, turning a menu-traversal problem into a semantic lookup.',
    architecture: {
      nodes: [
        { id: 'intent', label: 'User Intent', kind: 'input' },
        { id: 'embed', label: 'Embedding', kind: 'retrieval' },
        { id: 'faiss', label: 'FAISS', kind: 'store' },
        { id: 'retrieval', label: 'Semantic Retrieval', kind: 'retrieval' },
        { id: 'nav', label: 'Navigation JSON', kind: 'output' },
      ],
      edges: [
        { from: 'intent', to: 'embed' },
        { from: 'embed', to: 'faiss' },
        { from: 'faiss', to: 'retrieval' },
        { from: 'retrieval', to: 'nav' },
      ],
    },
    decisions: [
      {
        heading: 'FAISS for the index',
        // REVIEW: rationale inferred from the stated FAISS choice.
        body: 'Routing is a similarity search over a bounded, relatively stable set of reports. FAISS handles that in-process without introducing a separate service into the request path.',
      },
      {
        heading: 'Structured navigation JSON as the output',
        // REVIEW: rationale inferred from "structured navigation JSON" on the resume.
        body: 'Resolving intent to a typed navigation instruction rather than free text keeps the application in control of routing. The retrieval layer answers "which report", and the application decides what to do with that.',
      },
      {
        heading: 'Retrieval without generation',
        // REVIEW: rationale inferred from the embedding-retrieval-only architecture described.
        body: 'The task is selection from a known set, not composition. Skipping a generation step removes an entire class of failure and keeps the path short.',
      },
    ],
    challenges: [
      {
        heading: 'Keeping report embeddings in step with the catalogue',
        // REVIEW: challenge inherent to an embedding index over changing data.
        body: 'Reports are added and renamed over time. An index that drifts from the catalogue routes users to results that no longer match what they asked for.',
      },
      {
        heading: 'Intent phrased in the user vocabulary, not the system vocabulary',
        // REVIEW: challenge inherent to intent resolution.
        body: 'People describe what they want in business terms while reports are named in system terms. Bridging that gap is the entire value of embedding the intent rather than matching its words.',
      },
    ],
    impact: [
      {
        value: '70%',
        label: 'Reduction in processing time — scheduled automation pipelines with continuous vector refresh',
      },
    ],
    outcomes: ['User intent resolved directly into structured navigation JSON.'],
    tech: ['Python', 'FAISS', 'Embeddings', 'Semantic Search', 'Qdrant', 'Automation Pipelines'],
    takeaway:
      'Demonstrates applying semantic retrieval to a routing problem where a generation step would have added risk without adding value — choosing the smallest architecture that solves the task.',
  },

  {
    slug: 'adaptive-rag-multi-agent-assistant',
    name: 'Adaptive RAG Multi-Agent Personal Assistant',
    shortName: 'Adaptive RAG',
    category: 'Personal Project — Agentic RAG',
    personal: true,
    summary:
      'Stateful multi-agent Adaptive RAG system built on LangGraph, with conditional routing, a web-search fallback, and human-in-the-loop review to mitigate hallucinations.',
    problem:
      'A fixed retrieve-then-generate pipeline answers every question the same way. When the local corpus does not contain the answer, retrieval returns its nearest neighbours regardless, and the model generates over context that does not support a response — which is exactly the condition that produces confident hallucination.',
    solution:
      'LangGraph holds the workflow as a state machine with conditional routing. A router decides per query whether local retrieval against Qdrant is sufficient, whether to fall back to web search, or whether to escalate to a human. LangChain standardises model I/O, retriever interfaces, and state transitions between Gemini and Qdrant. Embeddings are produced locally with SentenceTransformers (all-MiniLM-L6-v2, 384-dim) and searched by cosine similarity, with Gemini generating the final response.',
    architecture: {
      nodes: [
        { id: 'user', label: 'User', kind: 'input' },
        { id: 'graph', label: 'LangGraph', kind: 'compute' },
        { id: 'router', label: 'Router', kind: 'compute' },
        { id: 'gemini', label: 'Gemini', kind: 'llm' },
        { id: 'final', label: 'Final Response', kind: 'output' },
      ],
      edges: [
        { from: 'user', to: 'graph' },
        { from: 'graph', to: 'router' },
        { from: 'gemini', to: 'final' },
      ],
      lanes: [
        {
          from: 'router',
          to: 'gemini',
          branches: [
            {
              label: 'Local corpus',
              nodes: [
                { id: 'retrieval', label: 'Retrieval', kind: 'retrieval' },
                { id: 'qdrant', label: 'Qdrant', kind: 'store' },
              ],
            },
            {
              label: 'Not in corpus',
              nodes: [{ id: 'web', label: 'Web Search Fallback', kind: 'retrieval' }],
            },
            {
              label: 'Needs review',
              nodes: [{ id: 'hitl', label: 'Human-in-the-loop', kind: 'human' }],
            },
          ],
        },
      ],
    },
    decisions: [
      {
        heading: 'LangGraph for stateful, conditional control flow',
        // REVIEW: rationale inferred from the stated LangGraph design.
        body: 'Adaptive routing means the path through the system depends on runtime conditions. A graph with explicit state models that directly, where a linear chain would need the branching logic smuggled into the prompt.',
      },
      {
        heading: 'LangChain as the abstraction layer',
        // REVIEW: rationale restated from the resume bullet.
        body: 'LangChain standardises model I/O, retriever interfaces, and state transitions between Gemini and Qdrant, so swapping a component does not mean rewriting the graph around it.',
      },
      {
        heading: 'Local embeddings with all-MiniLM-L6-v2',
        // REVIEW: rationale inferred from the stated cost-efficient local pipeline.
        body: 'A 384-dimension local model removes a per-document API call from indexing and keeps embedding cost at zero. Generation is where the hosted model earns its keep; embedding is not.',
      },
      {
        heading: 'Human-in-the-loop as a routing destination',
        // REVIEW: rationale inferred from the stated human-in-the-loop fallback.
        body: 'Treating human review as a branch of the graph rather than an error path means low-confidence cases have a defined destination instead of producing a confident answer nobody checked.',
      },
    ],
    challenges: [
      {
        heading: 'Deciding when retrieval is not good enough',
        // REVIEW: challenge inherent to adaptive routing.
        body: 'The routing decision is the hard part of Adaptive RAG. Falling back too eagerly wastes a web search on a question the corpus could answer; too rarely, and the system generates over context that does not support an answer.',
      },
      {
        heading: 'State across a branching graph',
        // REVIEW: challenge inherent to stateful graph orchestration.
        body: 'Every path has to converge on a response with consistent state, whether the answer came from local retrieval, a web search, or a human.',
      },
      {
        heading: 'Retrieval quality from a compact embedding model',
        // REVIEW: challenge inherent to the stated 384-dim local model choice.
        body: 'A small local model trades some retrieval fidelity for cost and independence. The conditional fallback exists partly to absorb the cases where that trade-off shows.',
      },
    ],
    impact: [],
    outcomes: [
      'Adaptive routing between local retrieval, web search fallback, and human review.',
      'Local 384-dimension embedding pipeline with no per-document API cost.',
    ],
    tech: [
      'LangGraph',
      'LangChain',
      'Qdrant',
      'Google Gemini',
      'SentenceTransformers',
      'Python',
      'Vector Search',
    ],
    takeaway:
      'A personal project exploring how agentic systems should behave when retrieval fails — building the fallback and escalation paths rather than assuming the happy path.',
    details: [
      {
        heading: 'Embedding configuration',
        body: 'SentenceTransformers all-MiniLM-L6-v2 producing 384-dimension vectors, stored in Qdrant and searched by cosine similarity.',
      },
      {
        heading: 'Scope',
        body: 'Built independently as a personal project (Feb 2026). Not deployed as a production service.',
      },
    ],
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
