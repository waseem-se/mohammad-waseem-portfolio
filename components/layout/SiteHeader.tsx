'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useScrollSpy, useSystemThemeSync } from '@/lib/hooks'
import { nav } from '@/content/philosophy'
import { profile } from '@/content/profile'
import {
  CloseIcon,
  GitHubIcon,
  LeetCodeIcon,
  LinkedInIcon,
  MenuIcon,
} from '@/components/ui/icons'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const sectionIds = nav.map((n) => n.id)

/**
 * Sticky header with scroll-spy.
 *
 * `homeAnchors` is false on project detail pages, where the section anchors do
 * not exist — links there point back at the home page instead of at fragments
 * that would go nowhere.
 */
export function SiteHeader({ homeAnchors = true }: { homeAnchors?: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useScrollSpy(sectionIds, homeAnchors)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Mounted once here rather than inside ThemeToggle, which renders twice while
  // the mobile sheet is open.
  useSystemThemeSync()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile sheet: lock the page, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }

      if (event.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables || focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus()

    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const href = (anchor: string) => (homeAnchors ? anchor : `/${anchor}`)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled
          ? 'border-hairline bg-canvas/85 backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex min-h-11 min-w-0 items-center gap-2.5 rounded-sm"
          aria-label={`${profile.name} — home`}
        >
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125"
          />
          <span className="truncate font-mono text-sm font-medium tracking-tight text-ink">
            {profile.name}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const isActive = homeAnchors && active === item.id
              return (
                <li key={item.id}>
                  <a
                    href={href(item.href)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative rounded-md px-3 py-2 text-sm transition-colors',
                      isActive ? 'text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    {item.label}
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-px bg-accent"
                      />
                    ) : null}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md p-2.5 text-muted transition-colors hover:text-ink sm:inline-flex"
          >
            <GitHubIcon className="size-[18px]" />
            <span className="sr-only">GitHub (opens in a new tab)</span>
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md p-2.5 text-muted transition-colors hover:text-ink sm:inline-flex"
          >
            <LinkedInIcon className="size-[18px]" />
            <span className="sr-only">LinkedIn (opens in a new tab)</span>
          </a>
          <a
            href={profile.links.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md p-2.5 text-muted transition-colors hover:text-ink sm:inline-flex"
          >
            <LeetCodeIcon className="size-[18px]" />
            <span className="sr-only">LeetCode (opens in a new tab)</span>
          </a>

          {/* No `hidden` breakpoint class: the theme switch is reachable at
              every width, unlike the two social links above. */}
          <ThemeToggle className="size-11 justify-center rounded-md text-muted hover:text-ink" />

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:text-ink lg:hidden"
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open ? (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="fixed inset-0 top-16 z-50 flex flex-col overflow-y-auto bg-canvas lg:hidden"
        >
          <nav aria-label="Primary mobile" className="shell flex-1 py-8">
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={href(item.href)}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center border-b border-hairline text-lg text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 rounded-lg border border-hairline-strong px-4 text-sm text-ink"
              >
                <GitHubIcon className="size-[18px]" />
                GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 rounded-lg border border-hairline-strong px-4 text-sm text-ink"
              >
                <LinkedInIcon className="size-[18px]" />
                LinkedIn
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href={profile.links.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 rounded-lg border border-hairline-strong px-4 text-sm text-ink"
              >
                <LeetCodeIcon className="size-[18px]" />
                LeetCode
                <span className="sr-only"> (opens in a new tab)</span>
              </a>

              {/* Not redundant with the one in the header row: the sheet traps
                  focus, so without a copy here the switch is keyboard-
                  unreachable while the menu is open. The trap's query already
                  matches any <button>, so it needs no change. */}
              <ThemeToggle
                labelled
                className="min-h-12 gap-3 rounded-lg border border-hairline-strong px-4 text-sm text-ink"
              />
            </div>
          </nav>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              toggleRef.current?.focus()
            }}
            className="shell flex min-h-14 items-center gap-2 border-t border-hairline py-4 text-sm text-muted"
          >
            <CloseIcon className="size-4" />
            Close
          </button>
        </div>
      ) : null}
    </header>
  )
}
