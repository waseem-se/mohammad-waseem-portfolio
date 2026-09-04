import { projects } from '@/content/projects'
import { countEdges, countNodes, techRecurrence, techSingletonCount } from '@/lib/charts'
import { BarChart, ChartFrame, ChartScale, ChartTable, UnitMatrix } from '@/components/chart/Chart'
import type { ChartLegendItem, MatrixColumn } from '@/components/chart/Chart'
import { Reveal } from '@/components/ui/Reveal'

/**
 * What recurs across the five case studies, and how they are shaped.
 *
 * A block inside Projects rather than a section of its own — it emits no
 * <section>, so the `aria-labelledby` contract and the 01-08 index sequence
 * are untouched. Same convention ProblemSolving documents.
 *
 * Both charts are computed from content/projects.ts rather than transcribed, so
 * adding or editing a project moves them. The counting for the architecture
 * chart lives in lib/charts.ts and walks lane branches — see countEdges there
 * for why `edges.length` alone would rank the only branching graph as the
 * simplest one.
 */

const columns: MatrixColumn[] = projects.map((project) => ({
  id: project.slug,
  short: project.shortName,
  full: project.shortName,
}))

const recurrence = techRecurrence(projects)
const singletons = techSingletonCount(projects)

const complexity = projects
  .map((project) => ({
    name: project.shortName,
    nodes: countNodes(project.architecture),
    edges: countEdges(project.architecture),
  }))
  .sort((a, b) => b.nodes - a.nodes || b.edges - a.edges)

const complexityMax = Math.max(...complexity.flatMap((row) => [row.nodes, row.edges]))

/** Graphs carrying more edges than nodes are the ones that branch. */
const branching = complexity.filter((row) => row.edges > row.nodes)

const complexityLegend: ChartLegendItem[] = [
  { code: 'NODES', label: 'Nodes — stages and stores', tone: 'compute' },
  { code: 'EDGES', label: 'Edges — connections between them', tone: 'input' },
]

export function ProjectFootprint() {
  return (
    <Reveal className="mt-14">
      <h3 className="mono-label mb-5">Footprint</h3>

      <div className="space-y-5">
        <ChartFrame
          title="Technology recurrence"
          unit="Projects using each technology, of five"
          bodyMax="max-w-3xl"
          source="content/projects.ts"
          caveat={`Five projects is a small denominator: a row reading "3 of 5" describes this list, not a practice. ${singletons} further technologies appear in exactly one project each and are not shown. Names are compared verbatim, so "Gemini Flash" and "Google Gemini" count separately, as do "Semantic Search", "Vector Search" and "Embeddings" — merging them would be a judgement about what counts as the same tool, which belongs in the content file rather than in a chart.`}
          table={
            <ChartTable
              caption="Technologies appearing in more than one project"
              columns={['Technology', ...projects.map((p) => p.shortName), 'Projects']}
              rows={recurrence.map((row) => [
                row.name,
                ...row.present.map((present) => (present ? 'Yes' : 'No')),
                `${row.count} of ${projects.length}`,
              ])}
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
          unit="Nodes and connections per architecture diagram"
          bodyMax="max-w-4xl"
          legend={complexityLegend}
          source="content/projects.ts"
          caveat="Counts describe the shape of each diagram, not how hard the work was — a short graph containing one difficult routing decision is not simpler than a long linear one. Nodes and edges inside lane branches are included, which is why the Adaptive RAG graph counts higher than its three declared edges suggest."
          table={
            <ChartTable
              caption="Nodes and edges per project architecture"
              columns={['Project', 'Nodes', 'Edges']}
              rows={complexity.map((row) => [row.name, row.nodes, row.edges])}
            />
          }
        >
          <div className="grid gap-6">
            {complexity.map((row) => (
              /* Own container so the two rows lay out on the width they
                 actually get. Deliberately one column: split two-up inside a
                 56rem body each column is ~428px, below the threshold where a
                 bar row fits on one line, so every bar became three stacked
                 lines and the pair took six. */
              <div key={row.name} className="@container min-w-0">
                <h5 className="mb-3 text-sm font-semibold text-ink">{row.name}</h5>
                <BarChart
                  max={complexityMax}
                  data={[
                    {
                      label: 'Nodes',
                      value: row.nodes,
                      display: String(row.nodes),
                      tone: 'compute' as const,
                    },
                    {
                      label: 'Edges',
                      value: row.edges,
                      display: String(row.edges),
                      tone: 'input' as const,
                    },
                  ]}
                />
              </div>
            ))}
          </div>
          <ChartScale max={complexityMax} unit="nodes or edges" />

          {/* Derived, not asserted — if the content changes so does the claim,
              and if nothing branches the sentence disappears rather than going
              stale. */}
          {branching.length === 1 && branching[0] ? (
            <p className="measure mt-6 border-t border-hairline pt-6 text-sm leading-relaxed text-muted">
              <span className="font-medium text-ink">{branching[0].name}</span> is the only
              architecture here with more connections than stages. Every other one is a chain;
              this is the one that branches.
            </p>
          ) : null}
        </ChartFrame>
      </div>
    </Reveal>
  )
}
