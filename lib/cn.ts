/** Minimal class joiner. Avoids pulling in clsx for a five-line function. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}
