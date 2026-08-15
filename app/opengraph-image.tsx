import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'

/* Rendered once at build time rather than per request — required by
   `output: 'export'`, and correct here since the card never varies. */
export const dynamic = 'force-static'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${profile.name} — ${profile.title}`

/**
 * Social card, rendered to PNG at build time so it ships with the static
 * export. Kept to system fonts and flat colour — no remote font fetch, which
 * would make the build depend on the network.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0b',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#6e8bf5',
              display: 'flex',
            }}
          />
          <div style={{ color: '#9a9aa4', fontSize: 26, letterSpacing: 2 }}>
            {profile.name.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#ededf0',
              fontSize: 62,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            Building production-grade AI systems from LLM prototypes to reliable products.
          </div>
          <div style={{ color: '#6e8bf5', fontSize: 28, marginTop: 32 }}>{profile.title}</div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {['RAG', 'Multi-Agent', 'LangGraph', 'FastAPI', 'Qdrant', 'LLM Evaluation'].map((tag) => (
            <div
              key={tag}
              style={{
                display: 'flex',
                border: '1px solid rgba(255,255,255,0.13)',
                background: '#1a1a1f',
                color: '#9a9aa4',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 22,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
