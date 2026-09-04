import { heroFlow } from '@/content/architecture'
import type { FlowKind } from '@/content/types'
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
 * Below `lg` the SVG is display:none and the shared FlowDiagram renders the
 * same graph as a readable vertical flow. `lg` is where Hero.tsx opens its
 * second column, so that breakpoint and this one must stay in step: revealing
 * the SVG any earlier stretches it across the full single-column shell, where
 * it stands ~805px tall at 768px.
 *
 * The 500-unit viewBox is a design width, not a rendered one. The element is
 * `w-full` and scales uniformly, so the track may be any size at or above the
 * `lg` figure — Hero.tsx widens it to 560px at `2xl`, which is a scale factor
 * and not a redraw. Label sizes scale with it by the same factor, which is the
 * intent.
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

/**
 * Node colours come straight from the `--node-*` custom properties in
 * globals.css — `FlowKind` is a closed union, so the property name is derived
 * from `node.kind` with no lookup table to keep in step with the palette.
 *
 * These reference the raw author properties rather than Tailwind's `--color-*`
 * aliases: an alias only survives if some generated utility uses it, and a
 * `var()` inside a JSX attribute string is invisible to Tailwind's scanner.
 */
const fillFor = (kind: FlowKind) => `var(--node-${kind})`
const strokeFor = (kind: FlowKind) => `var(--node-${kind}-line)`

/**
 * A chevron pointing down the spine.
 *
 * Direction used to be carried entirely by the animated packet, which
 * `prefers-reduced-motion` removes outright — leaving stages joined by plain
 * undirected lines. These are static, so the flow still reads as a flow when
 * the motion is gone, in a screenshot, or before the first packet arrives.
 */
function SpineChevron({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M ${x - 4} ${y - 2.5} L ${x} ${y + 2} L ${x + 4} ${y - 2.5}`}
      fill="none"
      stroke="var(--hairline-strong)"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

/** Chevron on the lateral branch. `dir` is 1 for rightward, -1 for leftward. */
function LateralChevron({ x, y, dir }: { x: number; y: number; dir: 1 | -1 }) {
  return (
    <path
      d={`M ${x - 2.5 * dir} ${y - 4} L ${x + 2 * dir} ${y} L ${x - 2.5 * dir} ${y + 4}`}
      fill="none"
      stroke="var(--hairline-strong)"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

export function HeroPipeline() {
  const byId = new Map(heroFlow.nodes.map((n) => [n.id, n]))
  const vectordb = byId.get('vectordb')

  return (
    <>
      {/* Wide screens: the SVG showpiece. */}
      <div className="hidden lg:block">
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
            stroke="var(--hairline-strong)"
            strokeWidth={1}
          />

          {/* Chevrons in each spine gap, between one box and the next. */}
          {column.slice(0, -1).map((id, i) => (
            <SpineChevron key={`chev-${id}`} x={CENTER_X} y={FIRST_Y + i * STEP + STEP / 2} />
          ))}

          {/* Lateral branch: Retrieval <-> Vector DB. Bidirectional — the stage
              queries the store and reads the result back; it is not a step the
              request passes through. */}
          <line
            x1={LATERAL_FROM}
            y1={VDB_Y}
            x2={VDB_X}
            y2={VDB_Y}
            stroke="var(--hairline-strong)"
            strokeWidth={1}
          />
          <LateralChevron x={VDB_X - 5} y={VDB_Y} dir={1} />
          <LateralChevron x={LATERAL_FROM + 5} y={VDB_Y} dir={-1} />

          {/* The packet. Sits above the spine, below the boxes. */}
          <line
            data-flow-packet
            x1={CENTER_X}
            y1={SPINE_TOP}
            x2={CENTER_X}
            y2={SPINE_BOTTOM}
            stroke="var(--accent)"
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
            stroke="var(--accent-alt)"
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
                fill="var(--raised)"
                stroke={strokeFor(vectordb.kind)}
                strokeWidth={1}
              />
              <circle cx={VDB_X + 18} cy={VDB_Y} r={2.5} fill={fillFor(vectordb.kind)} />
              <text
                x={VDB_X + 34}
                y={VDB_Y}
                dominantBaseline="middle"
                className="font-mono"
                fontSize={12.5}
                fill="var(--ink)"
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
                  stroke="var(--accent)"
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
                  fill="var(--raised)"
                  stroke={strokeFor(node.kind)}
                  strokeWidth={1}
                  /* The model stage is drawn provisional — dashed outline and a
                     hollow dot below — matching FlowDiagram. It shares
                     `compute`'s hue, so this is what separates them, and it
                     keeps the distinction off colour alone. */
                  strokeDasharray={node.kind === 'llm' ? '5 4' : undefined}
                />
                {node.kind === 'llm' ? (
                  <circle
                    cx={COL_X + 20}
                    cy={cy}
                    r={3}
                    fill="none"
                    stroke={fillFor(node.kind)}
                    strokeWidth={1.5}
                  />
                ) : (
                  <circle cx={COL_X + 20} cy={cy} r={2.5} fill={fillFor(node.kind)} />
                )}
                <text
                  x={COL_X + 36}
                  y={cy}
                  dominantBaseline="middle"
                  className="font-mono"
                  fontSize={13.5}
                  fill="var(--ink)"
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Narrow screens: the same graph as a readable vertical flow. */}
      <div className="lg:hidden">
        <FlowDiagram graph={heroFlow} title="AI request path" compact />
      </div>
    </>
  )
}
