'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tracks the OS reduced-motion preference reactively.
 *
 * Returns `true` during SSR and the first client render so that any
 * JS-driven motion starts disabled and only switches on once we have
 * confirmed the user has not asked for reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}

/**
 * Highlights the nav entry for the section currently in view.
 *
 * Uses a viewport-band root margin so a section becomes "active" as it crosses
 * the upper third of the screen, which matches what a reader perceives as the
 * section they are on.
 */
export function useScrollSpy(ids: string[], enabled = true): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    if (!enabled) return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio)
          } else {
            visible.delete(entry.target.id)
          }
        }

        if (visible.size === 0) return

        // Pick whichever intersecting section occupies the most of the band.
        let best = ''
        let bestRatio = -1
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id
            bestRatio = ratio
          }
        }
        if (best) setActive(best)
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids, enabled])

  return active
}

/**
 * Fires once when the element first enters the viewport.
 * Used for scroll reveals and to trigger the metric count-up.
 */
export function useInView<T extends HTMLElement>(rootMargin = '0px 0px -12% 0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [inView, rootMargin])

  return { ref, inView }
}

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/* -------------------------------------------------------------------------- */

export type Theme = 'light' | 'dark'

const THEME_KEY = 'theme'

/**
 * `localStorage` *throws* rather than returning null when storage is blocked
 * (Safari private mode, some embedded webviews), so every access is guarded.
 * Returns null when the visitor has expressed no preference — the OS decides.
 */
function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'dark' || stored === 'light' ? stored : null
  } catch {
    return null
  }
}

/**
 * Next renders one `<meta name="theme-color">` per `prefers-color-scheme`, so
 * mobile browser chrome follows the OS rather than the stored choice. Painting
 * both with the active canvas colour makes the toggle win. Reading the value
 * back off the document rather than repeating a hex here keeps this in step
 * with the palette in globals.css automatically.
 */
function syncThemeColor(root: HTMLElement) {
  // Doubles as the style flush the transition damper below depends on.
  const canvas = getComputedStyle(root).getPropertyValue('--canvas').trim()
  if (!canvas) return
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => {
      meta.content = canvas
    })
}

/**
 * Flips the class and holds every transition still for the frame it lands in.
 *
 * Without the damper only the handful of elements carrying `transition-colors`
 * would animate while the rest of the page snapped, which reads as a rendering
 * fault rather than a theme change.
 */
function commitTheme(theme: Theme) {
  const root = document.documentElement

  const damper = document.createElement('style')
  damper.textContent = '*,*::before,*::after{transition:none !important}'
  document.head.appendChild(damper)

  root.classList.toggle('dark', theme === 'dark')
  syncThemeColor(root)

  requestAnimationFrame(() => damper.remove())
}

/** Switches the theme and remembers the choice. */
export function applyTheme(theme: Theme) {
  commitTheme(theme)
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage blocked: the choice still applies, just only for this session.
  }
}

/**
 * `<html class="dark">` is the single source of truth rather than React state,
 * which is what lets any number of toggles stay in sync with no shared store.
 */
export function toggleTheme() {
  applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')
}

/**
 * Follows the OS preference for as long as the visitor has not picked a theme
 * themselves. Once they have, a stored choice outranks the OS and this is inert
 * — matching the precedence the inline script in app/layout.tsx applies on load.
 */
export function useSystemThemeSync(): void {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => {
      if (readStoredTheme()) return
      commitTheme(mq.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
}
