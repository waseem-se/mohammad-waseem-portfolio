import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'

/* Rendered once at build time rather than per request — required by
   `output: 'export'`, and correct here since the card never varies. */
export const dynamic = 'force-static'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${profile.name} — ${profile.title}`

/**
 * The card's own palette, deliberately not the site's.
 *
 * A build-time PNG cannot be theme-aware, and this image is rendered inside
 * Slack / LinkedIn / X chrome rather than on the site — where a dark card holds
 * a hard edge against the light feeds those platforms default to, and a white
 * one bleeds into them and loses its shape. So the card stays dark even though
 * the site's default is now light. These values duplicate the `.dark` block in
 * globals.css by intent; they are a fixed asset, not drift.
 */
const og = {
  bg: '#0a0a0b',
  raised: '#1a1a1f',
  hairlineStrong: 'rgba(255,255,255,0.13)',
  ink: '#ededf0',
  muted: '#9a9aa4',
  accent: '#6e8bf5',
} as const

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
          background: og.bg,
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
              background: og.accent,
              display: 'flex',
            }}
          />
          <div style={{ color: og.muted, fontSize: 26, letterSpacing: 2 }}>
            {profile.name.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: og.ink,
              fontSize: 62,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            Building production-grade AI systems from LLM prototypes to reliable products.
          </div>
          <div style={{ color: og.accent, fontSize: 28, marginTop: 32 }}>{profile.title}</div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {['RAG', 'Multi-Agent', 'LangGraph', 'FastAPI', 'Qdrant', 'LLM Evaluation'].map((tag) => (
            <div
              key={tag}
              style={{
                display: 'flex',
                border: `1px solid ${og.hairlineStrong}`,
                background: og.raised,
                color: og.muted,
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
