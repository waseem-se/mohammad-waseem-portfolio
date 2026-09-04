import {
  companies,
  education,
  roleSeries,
  roleSeriesFor,
  timelineAsOf,
} from '@/content/experience'
import { formatDuration, formatMonth, formatRange, monthSpan } from '@/lib/dates'
import { ChartFrame, ChartTable } from '@/components/chart/Chart'
import { TimelineChart } from '@/components/chart/TimelineChart'
import type { ChartLegendItem } from '@/components/chart/Chart'
import type { TimelineBand } from '@/components/chart/TimelineChart'

/**
 * The career as a shape rather than as a list.
 *
 * Sits above the disclosure set rather than replacing it: the bands answer "how
 * long, in what order, with how much overlap", and the disclosures answer "what
 * was actually built". Neither answers the other's question.
 *
 * Education is drawn dashed and unfilled rather than in a fifth colour — a
 * difference of form, so it survives greyscale, and it also says the right
 * thing, since a degree is not a rung on the same ladder as the roles above it.
 */

const legend: ChartLegendItem[] = roleSeries.map((role) => ({
  code: role.code,
  label: role.label,
  tone: role.tone,
}))

/** Which company each role belongs to, for the table's Employer column. */
const employerOf = new Map(
  companies.flatMap((company) => company.roles.map((role) => [role.id, company.name] as const)),
)

export function CareerChart() {
  const roles = companies.flatMap((company) => company.roles)

  /* Oldest first, so the bands read left-to-right as the axis does. The
     disclosure list below stays newest-first, which is what a reader scanning
     for current work wants. */
  const ordered = [...roles].sort((a, b) => a.start.localeCompare(b.start))

  const bands: TimelineBand[] = [
    {
      label: education.degree,
      note: education.school,
      start: education.start,
      end: education.end,
      tone: null,
      code: 'B.TECH',
    },
    ...ordered.map((role) => ({
      label: role.title,
      start: role.start,
      end: role.end,
      tone: roleSeriesFor(role.id).tone,
      code: roleSeriesFor(role.id).code,
    })),
  ]

  return (
    <ChartFrame
      title="Career Timeline"
      unit={`Months, ${formatMonth(education.start)} to ${formatMonth(timelineAsOf)}`}
      bodyMax="max-w-6xl"
      legend={legend}
      source="content/experience.ts"
      caveat={`Bands are drawn from the month ranges in content/experience.ts. The current role is drawn to ${formatMonth(
        timelineAsOf,
      )} — the date these figures were last reviewed, not today's date, so a stale deploy reads as stale rather than quietly growing. The company band in the list below carries the resume's Jun 2022 – Present; the Lead role's Aug 2025 start is inferred so the progression reads without two roles overlapping. Education is drawn dashed because it is not a rung on the same ladder.`}
      table={
        <ChartTable
          caption="Roles and education by date, with duration"
          columns={['Role', 'Employer', 'Start', 'End', 'Duration']}
          rows={[
            [
              education.degree,
              education.school,
              formatMonth(education.start),
              formatMonth(education.end),
              formatDuration(monthSpan(education.start, education.end)),
            ],
            ...ordered.map((role) => [
              role.title,
              employerOf.get(role.id) ?? '—',
              formatMonth(role.start),
              role.end ? formatMonth(role.end) : `Present (as of ${formatMonth(timelineAsOf)})`,
              formatDuration(monthSpan(role.start, role.end ?? timelineAsOf)),
            ]),
          ]}
        />
      }
    >
      <TimelineChart bands={bands} asOf={timelineAsOf} />
      <p className="sr-only">
        {ordered
          .map((role) => `${role.title}, ${formatRange(role.start, role.end)}`)
          .join('. ')}
      </p>
    </ChartFrame>
  )
}
