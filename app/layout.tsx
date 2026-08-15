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
    'ClickHouse',
    'PostgreSQL',
    'pgvector',
    'Vector Databases',
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
  /* Mobile browser chrome. These follow the OS rather than the stored choice,
     because they are static metadata; `applyTheme` in lib/hooks.ts repaints
     both once hydrated, so a mismatch lasts only until then. */
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Puts the resolved theme on `<html>` before the first paint.
 *
 * Precedence: stored choice -> OS preference -> light.
 *
 * `output: 'export'` means there is no server, no middleware, and no cookie, so
 * a synchronous inline script is the only mechanism available. It cannot flash:
 * a classic inline script is blocked on any pending render-blocking stylesheet,
 * so it runs after the CSS is in hand and before anything is painted.
 *
 * It deliberately leaves `<meta name="theme-color">` alone. Those are owned by
 * React through Next's metadata, and `suppressHydrationWarning` on `<html>`
 * does not extend to descendants — lib/hooks.ts syncs them after hydration.
 */
const themeScript = `try{var d=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',d==='dark'||(d!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))}catch(e){}`

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
    'Vector Databases',
    'LLM Evaluation',
    'Backend Engineering',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning covers this element's own attributes and text
       only — descendants are still checked — which is exactly the scope needed
       for the `class` the script above writes. React will not later strip it:
       it rewrites `class` only when the prop value changes, and the font
       variable string is a build-time constant. */
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
