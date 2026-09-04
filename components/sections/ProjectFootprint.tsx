import { projects } from '@/content/projects'
import { architectureShape, shapeKinds, techRecurrence, techSingletonCount } from '@/lib/charts'
import type { ShapeSegment } from '@/lib/charts'
import { kindLabel } from '@/lib/flow'
import { ChartFrame, ChartTable, SequenceKey, SequenceStrip, UnitMatrix } from '@/components/chart/Chart'
import type { MatrixColumn } from '@/components/chart/Chart'
import type { FlowKind } from '@/content/types'
import { Reveal } from '@/components/ui/Reveal'

/**
 * What recurs across the five case studies, and how they are shaped.
 *
 * A block inside Projects rather than a section of its own — it emits no
 * <section>, so the `aria-labelledby` contract and the 01-08 index sequence
 * are untouched. Same convention ProblemSolving documents.
 *
 * Both charts are computed from content/projects.ts rather than transcribed, so
 * adding or editing a project moves them. The second one draws each pipeline as
 * a sequence of stages; the walk that orders them lives in lib/charts.ts — see
 * architectureShape there for why the order has to come from the edges rather
 * than from the order the nodes happen to be authored in.
 */

const columns: MatrixColumn[] = projects.map((project) => ({
  id: project.slug,
  short: project.shortName,
  full: project.shortName,
}))

const recurrence = techRecurrence(projects)
const singletons = techSingletonCount(projects)

/**
 * Key order, authored rather than derived from what the content happens to use.
 * Roughly the order a request meets them, so the key reads as a pipeline too.
 */
const kindOrder: FlowKind[] = [
  'input',
  'compute',
  'retrieval',
  'store',
  'llm',
  'guard',
  'output',
  'human',
]

const shapes = projects
  .map((project) => ({
    /* Identity, kept alongside the display name: `shortName` is a label, and
       the sort below reorders these rows. */
    slug: project.slug,
    name: project.shortName,
    shape: architectureShape(project.architecture),
  }))
  /* Name breaks the tie, as it does in techRecurrence. Without it Guardrails and
     Jira Assistant — both 7 stages, both linear — order by their position in
     content/projects.ts, so reordering that file silently reorders the chart.
     `paths` sorts ahead of the name so a branching graph leads its own tier. */
  .sort(
    (a, b) =>
      b.shape.stages - a.shape.stages ||
      b.shape.paths - a.shape.paths ||
      a.name.localeCompare(b.name),
  )

const presentKinds = shapeKinds(
  shapes.map((row) => row.shape),
  kindOrder,
)

/** Graphs whose widest point carries more than one path. */
const branching = shapes.filter((row) => row.shape.paths > 1)

const formatNames = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

/**
 * The branching claim, derived — names and the rest of the sentence.
 *
 * Every case is generated from the same filter, so a second branching graph
 * rewrites the sentence instead of deleting it. Only genuinely having nothing
 * to say returns null.
 */
const branchingClaim = ((): { names: string; rest: string } | null => {
  if (branching.length === 0) return null

  const names = formatNames.format(branching.map((row) => row.name))
  const chains = shapes.length - branching.length

  if (branching.length === 1) {
    return {
      names,
      rest: 'is the only architecture here that branches. Every other one is a single chain from input to output.',
    }
  }

  if (chains === 0) {
    return { names, rest: 'all branch. Not one of them is a single chain.' }
  }

  return {
    names,
    rest: `branch. The other ${
      chains === 1 ? 'one is a single chain' : `${chains} are single chains`
    } from input to output.`,
  }
})()

/**
 * The strip restated as prose, for the table a screen reader actually reads.
 *
 * The strip itself is aria-hidden, so this is the accessible form of the chart —
 * and a stage sequence in plain words is a better one than the node and edge
 * counts it replaced, which described the drawing rather than the architecture.
 */
function sequenceSentence(segments: ShapeSegment[]): string {
  return segments
    .map((segment) => {
      if (segment.type === 'stage') return kindLabel[segment.cell.kind]
      const branches = segment.branches
        .map(
          (branch) =>
            `${branch.label}: ${branch.cells.map((cell) => kindLabel[cell.kind]).join(' then ')}`,
        )
        .join('; ')
      return `a ${segment.branches.length}-way branch (${branches})`
    })
    .join(', ')
}

/** `9 stages · branches into 3 paths` — the count the strip does not spell out. */
const annotate = (shape: { stages: number; paths: number }) =>
  `${shape.stages} stages · ${
    shape.paths > 1 ? `branches into ${shape.paths} paths` : 'linear chain'
  }`

export function ProjectFootprint() {
  return (
    <Reveal className="mt-14">
      <h3 className="mono-label mb-5">Footprint</h3>

      <div className="space-y-5">
        <ChartFrame
          title="Technology recurrence"
          unit="Projects using each technology, of five"
          bodyMax="max-w-3xl"
          caveat={`Five projects is a small denominator: a row reading "3 of 5" describes this list, not a practice. ${singletons} further technologies appear in exactly one project each and are not shown. Names are compared verbatim, so "Gemini Flash" and "Google Gemini" count separately, as do "Semantic Search", "Vector Search" and "Embeddings" — merging them would be a judgement about what counts as the same tool, which belongs in the content file rather than in a chart.`}
          table={
            <ChartTable
              caption="Technologies appearing in more than one project"
              columns={['Technology', ...projects.map((p) => p.shortName), 'Projects']}
              rows={recurrence.map((row) => ({
                /* Unique by construction — techRecurrence keys its Map by name. */
                key: row.name,
                cells: [
                  row.name,
                  ...row.present.map((present) => (present ? 'Yes' : 'No')),
                  `${row.count} of ${projects.length}`,
                ],
              }))}
            />
          }
        >
          {/* A matrix, not bars. With five projects the values span 5 down to 2,
              so bars would carry almost no variance while inviting the row to be
              read as a proportion of something large — and they would throw away
              *which* projects, which is the part worth keeping. */}
          <UnitMatrix
            columns={columns}
            rows={recurrence.map((row) => ({
              label: row.name,
              present: row.present,
              count: row.count,
            }))}
            tone="compute"
          />
        </ChartFrame>

        <ChartFrame
          title="Architecture shape"
          unit="Stages in pipeline order, coloured by role"
          bodyMax="max-w-4xl"
          caveat="Each cell is one stage of the pipeline, in the order a request meets it, and the dashed group is a fan-out that re-converges. The strip describes structure, not difficulty — a short pipeline containing one hard routing decision is not simpler than a long straight one. Data stores appear as stages because the request passes through them as the diagram is drawn. Colours are the project diagrams' own, so a strip and the full diagram it summarises agree."
          table={
            <ChartTable
              caption="Stage sequence and topology per project architecture"
              columns={['Project', 'Stages', 'Parallel paths', 'Stage sequence']}
              rows={shapes.map((row) => ({
                key: row.slug,
                cells: [
                  row.name,
                  row.shape.stages,
                  row.shape.paths,
                  sequenceSentence(row.shape.segments),
                ],
              }))}
            />
          }
        >
          <div className="grid gap-7">
            {shapes.map((row) => (
              /* Own container, so the cell size and the branch labels respond to
                 the width the strip actually gets rather than to the figure's. */
              <div key={row.slug} className="@container min-w-0">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h5 className="text-sm font-semibold text-ink">{row.name}</h5>
                  <p className="mono-label">{annotate(row.shape)}</p>
                </div>
                <SequenceStrip segments={row.shape.segments} />
              </div>
            ))}
          </div>

          {/* One key for all five strips, not one each. */}
          <SequenceKey kinds={presentKinds} className="mt-8 border-t border-hairline pt-6" />

          {/* Derived, not asserted — if the content changes so does the claim.
              The wording is built in branchingClaim above so that two branching
              graphs restate the sentence rather than removing it; it disappears
              only when nothing branches at all. */}
          {branchingClaim ? (
            <p className="measure mt-6 text-sm leading-relaxed text-muted">
              <span className="font-medium text-ink">{branchingClaim.names}</span>{' '}
              {branchingClaim.rest}
            </p>
          ) : null}
        </ChartFrame>
      </div>
    </Reveal>
  )
}
