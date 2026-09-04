import { leetcode } from '@/content/leetcode'
import { profile } from '@/content/profile'
import { ActionLink } from '@/components/ui/primitives'
import { BarChart, ChartFrame, ChartScale, ChartTable } from '@/components/chart/Chart'
import { LeetCodeIcon, ArrowRightIcon } from '@/components/ui/icons'
import { Reveal } from '@/components/ui/Reveal'

/**
 * LeetCode figures, as supporting evidence of DSA ability.
 *
 * This is a block inside Code & Engineering, not a section of its own — it
 * deliberately emits no <section>, so the section's `aria-labelledby` contract
 * stays intact and the numbered index sequence is untouched.
 *
 * Every figure comes from `content/leetcode.ts`. Nothing here is summed or
 * derived; see that file for why a total would misrepresent the profile. That
 * constraint is what rules out every chart form a reader might expect here: no
 * pie, no donut, no stacked bar, no share-of-total, no headline count. Two
 * independent sets of bars, each on its own stated scale, is the only honest
 * shape for numbers that double-count by design.
 */

/**
 * One scale across all nine topics, computed once here rather than per tier.
 *
 * This is the single most important line in the file. Scaling each tier to its
 * own maximum would draw "Dynamic Programming, 16" exactly as long as "Array,
 * 131" — three charts that each look full and say nothing about each other,
 * which is precisely the false comparison the rest of this page works to avoid.
 * The Advanced tier looking sparse is the honest reading.
 */
const topicMax = Math.max(
  ...leetcode.topicGroups.flatMap((group) => group.topics.map((topic) => topic.count)),
)

const languageMax = Math.max(...leetcode.languages.map((language) => language.count))

export function ProblemSolving() {
  return (
    <Reveal className="mt-12">
      <h3 className="mono-label mb-5">Problem Solving</h3>

      <div className="rounded-xl border border-hairline bg-surface p-7 md:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-hairline-strong bg-raised text-muted">
              <LeetCodeIcon className="size-5" />
            </span>
            <div className="min-w-0">
              {/* `min-w-0` on both flex items plus `break-all` — a mono URL has
                  no natural break opportunity, so without these the row keeps
                  its intrinsic width and overflows the shell below ~300px. */}
              <p className="font-mono text-sm break-all text-ink">leetcode.com/u/{leetcode.username}</p>
              <p className="mt-1 text-sm text-dim">
                Rank <span className="font-mono tabular-nums">{leetcode.rank}</span>
                {' · '}
                {leetcode.country}
              </p>
            </div>
          </div>

          <ActionLink href={profile.links.leetcode} external>
            View LeetCode Profile
            <ArrowRightIcon className="size-4" />
          </ActionLink>
        </div>

        <div className="mt-8 space-y-5 border-t border-hairline pt-8">
          <ChartFrame
            title="Problems solved by language"
            unit="Problems, as LeetCode reports them per language"
            bodyMax="max-w-3xl"
            source="content/leetcode.ts"
            caveat="A problem solved in two languages is counted under both. These bars do not sum to a number of problems, and no total is shown because none would be true."
            table={
              <ChartTable
                caption="Problems solved by language"
                columns={['Language', 'Problems']}
                rows={leetcode.languages.map((language) => [language.name, language.count])}
              />
            }
          >
            {/* One series, so colour would encode nothing — all three bars take
                the accent. The 65:1 range between C++ and MS SQL Server is real
                and stays linear: `min-w-[3px]` keeps the smallest bar visible
                and the count sits beside it either way. A log scale would make
                3 look like a third of 197, which is the lie. */}
            <BarChart
              max={languageMax}
              data={leetcode.languages.map((language) => ({
                label: language.name,
                value: language.count,
                display: String(language.count),
                tone: 'compute' as const,
              }))}
            />
            <ChartScale max={languageMax} unit="problems" />
          </ChartFrame>

          <ChartFrame
            title="Problems solved by topic"
            unit="Problems, on one scale shared across all nine topics"
            bodyMax="max-w-6xl"
            source="content/leetcode.ts"
            caveat="LeetCode tags one problem with several topics, so a single problem appears under each topic it matches. These bars do not sum to a number of problems. All three tiers share one scale, so bar lengths are comparable across tiers as well as within them."
            table={
              <ChartTable
                caption="Problems solved by topic, grouped by tier"
                columns={['Topic', 'Tier', 'Problems']}
                rows={leetcode.topicGroups.flatMap((group) =>
                  group.topics.map((topic) => [topic.name, group.name, topic.count]),
                )}
              />
            }
          >
            <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
              {leetcode.topicGroups.map((group) => (
                /* Each column is its own container: the bar rows switch to their
                   wide layout on the width they actually get, not on the frame's. */
                <div key={group.name} className="@container min-w-0">
                  <h5 className="mb-3 text-sm font-semibold text-ink">{group.name}</h5>
                  <BarChart
                    max={topicMax}
                    data={group.topics.map((topic) => ({
                      label: topic.name,
                      value: topic.count,
                      display: String(topic.count),
                      tone: 'compute' as const,
                    }))}
                  />
                </div>
              ))}
            </div>
            <ChartScale max={topicMax} unit="problems, shared across all nine topics" />
          </ChartFrame>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-dim">
          Figures as of <span className="font-mono tabular-nums">{leetcode.capturedOn}</span>.
          LeetCode counts a problem under every language and topic it matches, so these numbers
          are not additive.
        </p>
      </div>
    </Reveal>
  )
}
