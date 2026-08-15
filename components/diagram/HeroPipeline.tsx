import { heroFlow } from '@/content/architecture'
import { FlowDiagram } from './FlowDiagram'

/**
 * The hero showpiece: the request path of an AI system, drawn as a pipeline.
 *
 * Server-rendered inline SVG — no canvas, no animation library, no image
 * asset. A single packet traverses the spine on a CSS `stroke-dashoffset`
 * animation and each stage flashes as the packet reaches it, timed by
 * animation-delay against the packet's position along the path.
 *
 * Node rectangles are painted after the spine, so the packet slides *behind*
 * each stage and re-emerges — the flow reads as work entering and leaving a
 * component rather than a dot sliding over a line.
 *
 * Below `md` the SVG is display:none and the shared FlowDiagram renders the
 * same graph as a readable vertical flow.
 */

/** One full packet traverse. Node flashes are phased against this. */
const CYCLE = 5.5

/** Geometry, in viewBox units. All positions derive from these. */
const BOX_W = 268
const BOX_H = 52
const COL_X = 24
const CENTER_X = COL_X + BOX_W / 2
const STEP = 84
const FIRST_Y = 34

/** Spine runs from the bottom of node 0 to the top of the last node. */
const SPINE_TOP = FIRST_Y + BOX_H / 2
const SPINE_BOTTOM = FIRST_Y + 6 * STEP - BOX_H / 2
const SPINE_LEN = SPINE_BOTTOM - SPINE_TOP

/** Lateral Vector DB branch, level with the Retrieval node (index 3). */
const VDB_X = 322
const VDB_W = 152
const VDB_H = 40
const VDB_Y = FIRST_Y + 3 * STEP
const LATERAL_FROM = COL_X + BOX_W
const LATERAL_LEN = VDB_X - LATERAL_FROM

/** Seconds the packet takes to reach the top edge of column node `i`. */
const arrivalAt = (i: number) => (i === 0 ? 0 : ((i * STEP - BOX_H / 2) / SPINE_LEN) * CYCLE)

/** Main column, in order. `vectordb` is drawn separately as a lateral branch. */
const column = ['query', 'router', 'agents', 'retrieval', 'llm', 'guardrails', 'response'] as const

const strokeFor: Record<string, string> = {
  input: 'var(--color-hairline-strong)',
  compute: 'color-mix(in oklab, var(--color-accent) 35%, transparent)',
  store: 'color-mix(in oklab, var(--color-accent-alt) 35%, transparent)',
  llm: 'color-mix(in oklab, var(--color-accent) 45%, transparent)',
  guard: 'color-mix(in oklab, #fbbf24 28%, transparent)',
  output: 'color-mix(in oklab, #34d399 30%, transparent)',
  human: 'color-mix(in oklab, #fb7185 30%, transparent)',
}

const dotFor: Record<string, string> = {
  input: 'var(--color-muted)',
  compute: 'var(--color-accent)',
  store: 'var(--color-accent-alt)',
  llm: 'var(--color-accent)',
  guard: '#fbbf24',
  output: '#34d399',
  human: '#fb7185',
}

export function HeroPipeline() {
  const byId = new Map(heroFlow.nodes.map((n) => [n.id, n]))
  const vectordb = byId.get('vectordb')

  return (
    <>
      {/* Wide screens: the SVG showpiece. */}
      <div className="hidden md:block">
        <svg
          viewBox="0 0 500 572"
          role="img"
          aria-label="Architecture of an AI request path: a user query passes through intent routing, agent orchestration, and retrieval against a vector database, then to an LLM, through validation and guardrails, and out as a structured response."
          className="h-auto w-full"
        >
          {/* Spine. Painted first so node boxes occlude it. */}
          <line
            x1={CENTER_X}
            y1={SPINE_TOP}
            x2={CENTER_X}
            y2={SPINE_BOTTOM}
            stroke="var(--color-hairline-strong)"
            strokeWidth={1}
          />

          {/* Lateral branch: Retrieval <-> Vector DB. */}
          <line
            x1={LATERAL_FROM}
            y1={VDB_Y}
            x2={VDB_X}
            y2={VDB_Y}
            stroke="var(--color-hairline-strong)"
            strokeWidth={1}
          />

          {/* The packet. Sits above the spine, below the boxes. */}
          <line
            data-flow-packet
            x1={CENTER_X}
            y1={SPINE_TOP}
            x2={CENTER_X}
            y2={SPINE_BOTTOM}
            stroke="var(--color-accent)"
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              // @ts-expect-error -- custom property consumed by the CSS keyframe
              '--dash': SPINE_LEN,
              strokeDasharray: `26 ${SPINE_LEN}`,
              animation: `packet ${CYCLE}s linear infinite`,
            }}
          />

          {/* Retrieval -> Vector DB packet, phased to the spine packet's arrival. */}
          <line
            data-flow-packet
            x1={LATERAL_FROM}
            y1={VDB_Y}
            x2={VDB_X}
            y2={VDB_Y}
            stroke="var(--color-accent-alt)"
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              // @ts-expect-error -- custom property consumed by the CSS keyframe
              '--dash': LATERAL_LEN,
              strokeDasharray: `12 ${LATERAL_LEN}`,
              animation: `packet ${CYCLE}s linear infinite`,
              animationDelay: `${arrivalAt(3)}s`,
            }}
          />

          {/* Vector DB node. */}
          {vectordb ? (
            <g>
              <rect
                x={VDB_X}
                y={VDB_Y - VDB_H / 2}
                width={VDB_W}
                height={VDB_H}
                rx={9}
                fill="var(--color-raised)"
                stroke={strokeFor[vectordb.kind]}
                strokeWidth={1}
              />
              <circle cx={VDB_X + 18} cy={VDB_Y} r={2.5} fill={dotFor[vectordb.kind]} />
              <text
                x={VDB_X + 34}
                y={VDB_Y}
                dominantBaseline="middle"
                className="font-mono"
                fontSize={12.5}
                fill="var(--color-ink)"
              >
                {vectordb.label}
              </text>
            </g>
          ) : null}

          {/* Main column. */}
          {column.map((id, i) => {
            const node = byId.get(id)
            if (!node) return null

            const cy = FIRST_Y + i * STEP
            const arrival = arrivalAt(i)

            return (
              <g key={id}>
                {/* Flash ring, phased to the packet. */}
                <rect
                  data-flow-pulse
                  x={COL_X - 3}
                  y={cy - BOX_H / 2 - 3}
                  width={BOX_W + 6}
                  height={BOX_H + 6}
                  rx={11}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={1}
                  opacity={0}
                  style={{
                    animation: `node-hit ${CYCLE}s linear infinite`,
                    animationDelay: `${arrival}s`,
                  }}
                />
                <rect
                  x={COL_X}
                  y={cy - BOX_H / 2}
                  width={BOX_W}
                  height={BOX_H}
                  rx={8}
                  fill="var(--color-raised)"
                  stroke={strokeFor[node.kind]}
                  strokeWidth={1}
                />
                <circle cx={COL_X + 20} cy={cy} r={2.5} fill={dotFor[node.kind]} />
                <text
                  x={COL_X + 36}
                  y={cy}
                  dominantBaseline="middle"
                  className="font-mono"
                  fontSize={13.5}
                  fill="var(--color-ink)"
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Narrow screens: the same graph as a readable vertical flow. */}
      <div className="md:hidden">
        <FlowDiagram graph={heroFlow} title="AI request path" compact />
      </div>
    </>
  )
}
