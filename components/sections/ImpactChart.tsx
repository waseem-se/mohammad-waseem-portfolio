import { companies, roleSeries, roleSeriesFor } from '@/content/experience'
import { impactData } from '@/lib/charts'
import { BarChart, ChartFrame, ChartScale, ChartTable } from '@/components/chart/Chart'
import type { BarDatum, ChartLegendItem } from '@/components/chart/Chart'

/**
 * The measured outcomes, ranked.
 *
 * These figures already exist on the site, but only inside collapsed role
 * panels — you have to open three disclosures to learn that the work is
 * quantified at all. This is the same data as evidence rather than as detail.
 *
 * The one judgement call worth stating: the eight figures are not eight of the
 * same thing. Six are reductions against a prior baseline and are genuinely
 * comparable to each other. Two are accuracies — 95% is the accuracy of
 * generated migrations, a level; 18% is an improvement over a prior model, a
 * change in a level. Neither is a fall against a baseline, and on a shared
 * 0-100% axis "95%" would read as a bigger achievement than "75% fewer unsafe
 * outputs", which is not a comparison that means anything.
 *
 * So the two accuracy figures get no bar at all. A caveat line would have been
 * the easier fix, but a reader who skims the bars would still have compared
 * them; with no lengths on one side of the divide there is nothing to compare.
 */

/** Fixed and authored, never derived from render order — see roleSeries. */
const legend: ChartLegendItem[] = roleSeries.map((role) => ({
  code: role.code,
  label: role.label,
  tone: role.tone,
}))

export function ImpactChart() {
  const data = impactData(companies)

  const reductions: BarDatum[] = data
    .filter((datum) => datum.kind === 'reduction')
    .sort((a, b) => b.value - a.value)
    .map((datum) => ({
      label: datum.label,
      value: datum.value,
      display: datum.display,
      note: roleSeriesFor(datum.roleId).code,
      tone: roleSeriesFor(datum.roleId).tone,
    }))

  const accuracies = data.filter((datum) => datum.kind === 'accuracy')

  return (
    <ChartFrame
      title="Measured Impact"
      unit="Percent reduction against the prior baseline"
      bodyMax="max-w-4xl"
      legend={legend}
      source="content/experience.ts"
      caveat="Each figure is a separate measurement of a separate system, taken at a different time. The bars compare only within the group above — a 30% fall in token usage and a 70% fall in processing time are both reductions, but of unrelated quantities. The two accuracy figures below carry no bar: 95% is the accuracy of generated migrations and 18% is an improvement over a prior model, so neither is a reduction and neither belongs on that scale."
      table={
        <ChartTable
          caption="Measured outcomes by role, with what each figure measures"
          columns={['Figure', 'Value', 'Kind', 'Role']}
          rows={data.map((datum) => [
            datum.label,
            datum.display,
            datum.kind === 'reduction' ? 'Reduction against baseline' : 'Accuracy level',
            roleSeriesFor(datum.roleId).label,
          ])}
        />
      }
    >
      <BarChart data={reductions} max={100} />
      <ChartScale max={100} unit="percent" />

      <div className="mt-8 border-t border-hairline pt-6">
        <h5 className="mono-label mb-5">Accuracy figures — not on the scale above</h5>
        <dl className="grid grid-cols-2 gap-6 sm:gap-8">
          {accuracies.map((datum) => (
            <div key={datum.label}>
              <dt className="sr-only">{datum.label}</dt>
              <dd>
                <span className="block font-mono text-2xl font-semibold tracking-tight text-accent tabular-nums">
                  {datum.display}
                </span>
                <span className="mt-1 block text-xs leading-snug text-dim">
                  {datum.label}
                  <span className="mt-0.5 block font-mono text-[0.6875rem] tracking-[0.08em]">
                    {roleSeriesFor(datum.roleId).code}
                  </span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </ChartFrame>
  )
}
