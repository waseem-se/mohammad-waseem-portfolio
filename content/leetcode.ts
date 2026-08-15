import type { LeetCodeTopicGroup } from './types'

/**
 * Public LeetCode profile stats.
 *
 * Unlike the rest of `content/`, these facts trace to the live profile rather
 * than the resume PDF — `profileUrl` and `capturedOn` are the audit trail.
 * Refreshing the section means editing this object and nothing else; update
 * `capturedOn` at the same time so a stale figure is visible as stale.
 *
 * Counts are per-language and per-topic exactly as LeetCode reports them, and
 * are deliberately never summed. LeetCode counts a problem once per language it
 * was solved in, and tags a single problem with several topics, so any total
 * derived from these numbers would overstate the distinct problems solved.
 */
export const leetcode = {
  username: 'waseem777',
  profileUrl: 'https://leetcode.com/u/waseem777/',
  /** ISO date the figures below were read off the profile. */
  capturedOn: '2026-08-15',
  rank: '616,345',
  country: 'India',
  languages: [
    { name: 'C++', count: 197 },
    { name: 'Python3', count: 70 },
    { name: 'MS SQL Server', count: 3 },
  ],
  topicGroups: [
    {
      name: 'Advanced',
      topics: [
        { name: 'Dynamic Programming', count: 16 },
        { name: 'Divide and Conquer', count: 6 },
        { name: 'Game Theory', count: 3 },
      ],
    },
    {
      name: 'Intermediate',
      topics: [
        { name: 'Hash Table', count: 49 },
        { name: 'Math', count: 46 },
        { name: 'Greedy', count: 27 },
      ],
    },
    {
      name: 'Fundamental',
      topics: [
        { name: 'Array', count: 131 },
        { name: 'String', count: 58 },
        { name: 'Sorting', count: 41 },
      ],
    },
  ] satisfies LeetCodeTopicGroup[],
}
