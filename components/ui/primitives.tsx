import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* -------------------------------------------------------------------------- */
/* Section scaffolding                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Consistent section opener: hairline rule, monospace index, heading, optional
 * lede. Every section on the site uses this so the vertical rhythm never drifts.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  id,
}: {
  index: string
  eyebrow: string
  title: string
  lede?: string
  id?: string
}) {
  return (
    <header className="mb-12 md:mb-16">
      <div className="mono-label mb-6 flex items-center gap-3">
        <span className="text-accent">{index}</span>
        <span aria-hidden className="h-px w-8 bg-hairline-strong" />
        <span>{eyebrow}</span>
      </div>
      <h2
        id={id}
        className="max-w-3xl text-[length:var(--text-section)] leading-[1.1] font-semibold"
      >
        {title}
      </h2>
      {lede ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lede}</p> : null}
    </header>
  )
}

export function Section({
  id,
  children,
  className,
  bordered = true,
}: {
  id: string
  children: ReactNode
  className?: string
  bordered?: boolean
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        'scroll-mt-24 py-20 md:py-28',
        bordered && 'border-t border-hairline',
        className,
      )}
    >
      <div className="shell">{children}</div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Tags & chips                                                               */
/* -------------------------------------------------------------------------- */

export function TechTag({ children, subtle }: { children: ReactNode; subtle?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-xs whitespace-nowrap',
        subtle
          ? 'border-hairline bg-surface text-dim'
          : 'border-hairline-strong bg-raised text-muted',
      )}
    >
      {children}
    </span>
  )
}

export function Chip({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'accent'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 font-mono text-[0.6875rem] tracking-[0.12em] uppercase',
        tone === 'accent'
          ? 'border-accent/35 bg-accent-soft text-accent'
          : 'border-hairline-strong bg-raised text-dim',
      )}
    >
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Buttons & links                                                            */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const buttonStyles: Record<ButtonVariant, string> = {
  /* `bg-ink text-canvas` inverts correctly in both themes. The hover must too:
     a literal `hover:bg-white` assumes "ink is light, so brighten it", which on
     the light theme paints a white button behind a white label. `ink-strong`
     goes darker on light and to white on dark — 20.6:1 and 19.8:1. Not
     `hover:opacity-90`, which would fade the label toward the page as well. */
  primary: 'bg-ink text-canvas hover:bg-ink-strong border border-transparent',
  secondary: 'border border-hairline-strong bg-raised text-ink hover:border-accent/50 hover:bg-surface',
  ghost: 'border border-transparent text-muted hover:text-ink hover:border-hairline-strong',
}

/** Minimum height keeps every CTA at a 44px touch target. */
const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-200'

export function ActionLink({
  href,
  children,
  variant = 'secondary',
  external,
  download,
  className,
}: {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  external?: boolean
  download?: boolean
  className?: string
}) {
  const classes = cn(buttonBase, buttonStyles[variant], className)

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        data-variant={variant}
      >
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  }

  if (download || href.startsWith('mailto:') || href.startsWith('#')) {
    return (
      <a href={href} download={download} className={classes} data-variant={variant}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} data-variant={variant}>
      {children}
    </Link>
  )
}
