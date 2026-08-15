import type { Principle } from './types'

/** Stated as engineering constraints, not aspirations. */
export const principles: Principle[] = [
  {
    title: 'Production over prototypes',
    body: 'AI applications require validation, observability, failure handling, schemas, and predictable interfaces. A demo that works on the happy path is not a system.',
  },
  {
    title: 'Retrieval before hallucination',
    body: 'Strong retrieval architecture and fallback strategies are critical for reliable AI systems. Most hallucination is a retrieval failure surfacing as a generation failure.',
  },
  {
    title: 'Structured outputs',
    body: 'LLM responses should be treated as contracts and validated against schemas. A response that does not satisfy its contract is rejected or regenerated — never passed downstream on trust.',
  },
  {
    title: 'Optimize the system, not just the model',
    body: 'Retrieval, prompts, token usage, latency, model selection, and architecture are one system. Tuning them together is what moves cost and quality; swapping models alone rarely does.',
  },
]

export const nav = [
  { href: '#home', label: 'Home', id: 'home' },
  { href: '#about', label: 'About', id: 'about' },
  { href: '#experience', label: 'Experience', id: 'experience' },
  { href: '#projects', label: 'Projects', id: 'projects' },
  { href: '#architecture', label: 'Architecture', id: 'architecture' },
  { href: '#skills', label: 'Skills', id: 'skills' },
  { href: '#contact', label: 'Contact', id: 'contact' },
]
