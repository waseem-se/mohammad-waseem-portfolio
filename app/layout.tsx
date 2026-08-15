import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { seo, profile } from '@/content/profile'
import './globals.css'

/* Self-hosted at build time by next/font — no runtime request to Google. */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-jb',
})

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: {
    default: seo.title,
    template: `%s | ${profile.name}`,
  },
  description: seo.description,
  applicationName: `${profile.name} — Portfolio`,
  authors: [{ name: profile.name, url: seo.siteUrl }],
  creator: profile.name,
  keywords: [
    'Mohammad Waseem',
    'Senior Software Engineer',
    'GenAI',
    'LLM Systems',
    'RAG',
    'Multi-Agent Orchestration',
    'Semantic Retrieval',
    'LLM Evaluation',
    'Guardrails',
    'FastAPI',
    'Python',
    'C#',
    'LangGraph',
    'LangChain',
    'Qdrant',
    'FAISS',
    'Production AI Systems',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: `${profile.name} — Portfolio`,
    title: seo.title,
    description: seo.description,
    url: seo.siteUrl,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Structured data so a search result can render the profile as a Person rather
 * than as an untyped page. Only facts already published on the site.
 */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  url: seo.siteUrl,
  description: seo.description,
  sameAs: [profile.links.github, profile.links.linkedin],
  knowsAbout: [
    'Generative AI',
    'Large Language Models',
    'Retrieval-Augmented Generation',
    'Multi-Agent Orchestration',
    'Semantic Retrieval',
    'LLM Evaluation',
    'Backend Engineering',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Scroll reveals start at opacity 0 and are switched on by script. With
            scripting unavailable that would hide the page, so restore them here.
            Done as <noscript> rather than by toggling a class on <html>, which
            React owns and would report as a hydration mismatch. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>.reveal{opacity:1 !important;animation:none !important}</style>`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only rounded-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-canvas"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
