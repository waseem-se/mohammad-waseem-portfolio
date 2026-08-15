import type { SkillGroup } from './types'

/** Categorized capability list. No proficiency bars or percentages by design. */
export const skillGroups: SkillGroup[] = [
  {
    name: 'GenAI / LLM',
    items: [
      'RAG',
      'Multi-Agent Orchestration',
      'LangGraph',
      'LangChain',
      'LLM Evaluation',
      'Guardrails',
      'Semantic Search',
      'Embeddings',
      'Token-Level Streaming',
    ],
  },
  {
    name: 'Backend',
    items: [
      'Python',
      'FastAPI',
      'AsyncIO',
      'Pydantic v2',
      'C#',
      'ASP.NET Core',
      '.NET',
      'REST APIs',
    ],
  },
  {
    name: 'Retrieval / Data',
    items: ['Qdrant', 'FAISS', 'SQL', 'Vector Search', 'Embeddings'],
  },
  {
    name: 'Frontend',
    items: ['React.js', 'JavaScript', 'TypeScript'],
  },
  {
    name: 'Engineering',
    items: ['Docker', 'GitHub Actions', 'CI/CD', 'Postman', 'VS Code', 'PyCharm', 'Rider'],
  },
]
