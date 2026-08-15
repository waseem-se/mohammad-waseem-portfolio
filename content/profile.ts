/**
 * Personal details. Phone number is deliberately omitted — it appears in the
 * resume PDF but is not published in the site HTML.
 */
export const profile = {
  name: 'Mohammad Waseem',
  title: 'Senior Software Engineer — GenAI & LLM Systems',
  headline:
    'Building production-grade AI systems from LLM prototypes to reliable products.',
  supporting:
    '5+ years of software engineering experience across GenAI, LLM systems, RAG architectures, multi-agent orchestration, backend APIs, semantic retrieval, evaluation, and production AI systems.',
  email: 'mohd.waseem.se@gmail.com',
  location: 'Bangalore, Karnataka, India',
  links: {
    github: 'https://github.com/waseem-se',
    linkedin: 'https://www.linkedin.com/in/waseem-se/',
    resume: '/Mohammad_Waseem_Resume.pdf',
  },
  /** Optional headshot for the About section. Leave null to render no photo. */
  photo: null as { src: string; alt: string } | null,
} as const

export const heroTags = [
  'Python',
  'C#',
  'FastAPI',
  'LangGraph',
  'LangChain',
  'Qdrant',
  'FAISS',
  'RAG',
  'Multi-Agent Systems',
  'LLM Evaluation',
]

export const about = {
  lead: 'I am a Senior Software Engineer who builds production AI systems — the layer where LLMs stop being demos and start being services other systems depend on.',
  body: [
    'My work centres on GenAI and LLM systems: retrieval-augmented generation, multi-agent orchestration, semantic retrieval over vector stores, and the evaluation and guardrail layers that decide whether a model response is safe to return. Most of that runs on async Python — FastAPI, AsyncIO, Pydantic v2 — alongside C# and ASP.NET Core services.',
    'The backend engineering came first. Before the AI work I was building .NET APIs and code-generation tooling for financial systems, and that grounding is why I treat model output as an untrusted contract to be validated rather than a result to be trusted.',
  ],
  emphasis: 'Software engineering first. AI systems as the specialization.',
}

export const contact = {
  title: "Let's build something useful.",
  intro: 'Interested in opportunities involving:',
  interests: [
    'GenAI',
    'LLM systems',
    'RAG',
    'AI agents',
    'AI infrastructure',
    'Backend engineering',
    'Developer productivity',
  ],
}

export const codeSection = {
  title: 'Code & Engineering',
  body: 'The systems described above were built inside private company repositories and are not publicly available. Public profile below.',
  /**
   * Hand-curated repositories. Intentionally empty: the GitHub account's public
   * repos are mostly forks and practice work, so nothing there represents the
   * engineering described on this site. Add entries here to render a list.
   */
  curatedRepos: [] as { name: string; description: string; url: string; tech: string[] }[],
}

export const seo = {
  title: 'Mohammad Waseem | Senior Software Engineer — GenAI & LLM Systems',
  description:
    'Portfolio of Mohammad Waseem, Senior Software Engineer specializing in GenAI, LLM systems, RAG, multi-agent orchestration, semantic retrieval, FastAPI, Python, C#, and production AI systems.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mohammadwaseem.dev',
}
