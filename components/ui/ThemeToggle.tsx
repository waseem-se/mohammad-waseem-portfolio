'use client'

import { cn } from '@/lib/cn'
import { toggleTheme } from '@/lib/hooks'
import { MoonIcon, SunIcon } from '@/components/ui/icons'

/**
 * Light/dark switch.
 *
 * Stateless by design. The theme lives on `<html>` as a class, put there by the
 * inline script in app/layout.tsx before React runs, and both the glyph and the
 * label swap in CSS via the `dark` variant. So the server render and the first
 * client render are byte-identical: the correct icon is on screen in the first
 * frame, with no `mounted` gate and no pop-in.
 *
 * Deliberately no `aria-label` and no `aria-pressed`. The accessible name comes
 * from the CSS-swapped text — the inactive span is `display: none`, so it is
 * out of the accessibility tree and the computed name always matches what is on
 * screen. An `aria-label` would override the visible text and fail WCAG 2.5.3
 * (Label in Name), and `aria-pressed` is state the server cannot render, which
 * would force the mount gate back. A native `<button>` gives keyboard operation
 * for free, and the `:focus-visible` rule in globals.css paints the ring.
 *
 * The base class list is intentionally minimal: `cn` is a plain joiner with no
 * conflict resolution, so anything a call site might want to override lives at
 * the call site.
 */
export function ThemeToggle({
  className,
  labelled,
}: {
  className?: string
  /** Renders the label visibly instead of screen-reader-only. */
  labelled?: boolean
}) {
  const label = labelled ? '' : 'sr-only'

  return (
    <button type="button" onClick={toggleTheme} className={cn('inline-flex items-center transition-colors', className)}>
      {/* Shows the theme the press will switch *to*. */}
      <MoonIcon className="size-[18px] dark:hidden" />
      <SunIcon className="hidden size-[18px] dark:block" />
      <span className={cn(label, 'dark:hidden')}>Switch to dark theme</span>
      <span className={cn(label, 'hidden dark:block')}>Switch to light theme</span>
    </button>
  )
}
