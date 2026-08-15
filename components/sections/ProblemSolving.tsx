import { leetcode } from '@/content/leetcode'
import { profile } from '@/content/profile'
import { ActionLink } from '@/components/ui/primitives'
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
 * derived; see that file for why a total would misrepresent the profile.
 */
export function ProblemSolving() {
  return (
    <Reveal className="mt-12">
      <h3 className="mono-label mb-5">Problem Solving</h3>

      <div className="rounded-xl border border-hairline bg-surface p-7 md:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-hairline-strong bg-raised text-muted">
              <LeetCodeIcon className="size-5" />
            </span>
            <div>
              <p className="font-mono text-sm text-ink">leetcode.com/u/{leetcode.username}</p>
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

        <div className="mt-8 border-t border-hairline pt-8">
          <p className="mono-label mb-5">Problems solved by language</p>
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {leetcode.languages.map((language) => (
              <div key={language.name}>
                <dt className="text-xs leading-snug text-dim">{language.name}</dt>
                <dd className="mt-1.5 font-mono text-2xl font-semibold tracking-tight text-ink tabular-nums">
                  {language.count}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8 border-t border-hairline pt-8">
          <p className="mono-label mb-5">Problems solved by topic</p>
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            {leetcode.topicGroups.map((group) => (
              <div key={group.name}>
                <h4 className="mb-3 text-sm font-semibold text-ink">{group.name}</h4>
                <dl>
                  {group.topics.map((topic) => (
                    <div
                      key={topic.name}
                      className="flex items-baseline justify-between gap-3 border-b border-hairline py-2 last:border-b-0"
                    >
                      <dt className="text-sm leading-snug text-muted">{topic.name}</dt>
                      <dd className="font-mono text-sm text-ink tabular-nums">{topic.count}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
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
