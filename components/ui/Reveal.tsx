'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useInView } from '@/lib/hooks'

/**
 * Fade-and-rise on first scroll into view.
 *
 * The animation is defined in CSS and gated there by prefers-reduced-motion, so
 * this component only decides *when* to flip the flag. If scripting never runs,
 * the `.no-js` rule in globals.css leaves the content visible.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'section'
}) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', className)}
      data-visible={inView ? 'true' : 'false'}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}
