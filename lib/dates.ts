/**
 * Month arithmetic for the career timeline.
 *
 * Everything here works on inclusive `YYYY-MM` strings, which is the resolution
 * the resume states and therefore the only resolution the site can honestly
 * claim. No `Date` object is constructed: the site is statically exported, so
 * anything derived from the clock would be baked in at build time — see
 * `timelineAsOf` in content/experience.ts.
 */

/**
 * Month names as a literal table rather than `toLocaleString`.
 *
 * `toLocaleString` reads the *build machine's* locale, which would let a CI
 * runner's environment decide what a visitor sees in a static file. These are
 * the abbreviations already written into the resume.
 */
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function parse(ym: string): { year: number; month: number } {
  const [y, m] = ym.split('-')
  const year = Number(y)
  const month = Number(m)
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Expected an inclusive YYYY-MM month, got "${ym}"`)
  }
  return { year, month }
}

/** Absolute month count, for ordering and span arithmetic. */
export function monthIndex(ym: string): number {
  const { year, month } = parse(ym)
  return year * 12 + (month - 1)
}

/** `'2025-08'` -> `'Aug 2025'`. */
export function formatMonth(ym: string): string {
  const { year, month } = parse(ym)
  return `${MONTHS[month - 1]} ${year}`
}

/**
 * `('2025-08', null)` -> `'Aug 2025 – Present'`.
 *
 * En dash, matching the free-text period strings this replaced and the company
 * bands that still carry them.
 */
export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : 'Present'}`
}

/** Inclusive month count. `('2021-08', '2022-05')` -> 10. */
export function monthSpan(start: string, end: string): number {
  return monthIndex(end) - monthIndex(start) + 1
}

/** 10 -> `'10 mos'`; 26 -> `'2 yrs 2 mos'`; 24 -> `'2 yrs'`. */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12)
  const rest = months % 12

  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`)
  if (rest > 0 || years === 0) parts.push(`${rest} ${rest === 1 ? 'mo' : 'mos'}`)
  return parts.join(' ')
}
