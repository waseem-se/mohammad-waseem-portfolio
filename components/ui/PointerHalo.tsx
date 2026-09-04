'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * A soft accent glow that trails the pointer.
 *
 * The only client component on the site that is not holding state something
 * else depends on — it is decoration, and it therefore has to cost nothing when
 * it is not wanted. It renders `null` on the server, on the first client
 * render, on any coarse pointer, and under `prefers-reduced-motion`; nothing on
 * the page is positioned or sized in relation to it.
 *
 * Position is written straight to the element's `transform` from a single rAF
 * loop. Nothing here goes through React state: a `setState` per `pointermove`
 * would re-render this subtree ~120 times a second on a 120Hz display and would
 * put a React commit between the pointer and the glow.
 *
 * Everything visual lives in `.pointer-halo` in globals.css. This file decides
 * only *whether* and *where*.
 */

/** Fraction of the remaining distance closed each frame. Lower trails longer. */
const EASE = 0.12

export function PointerHalo() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [fine, setFine] = useState(false)

  /* `(pointer: fine)` asks about the *primary* pointer, which is what we want:
     a touchscreen laptop reports fine and gets the halo, a phone does not.
     Tracked reactively rather than read once, because a mouse can be paired
     mid-session. */
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* usePrefersReducedMotion returns true on the server and on the first client
     render, and `fine` starts false, so `active` is false on both sides of
     hydration — same markup either way, nothing to mismatch. */
  const active = fine && !reduced

  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return

    // `target` is where the pointer is; `x`/`y` are where the glow has got to.
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let frame = 0
    let seen = false

    const onMove = (event: PointerEvent) => {
      // A hybrid device reports `fine`, but a touch drag on one should not drag
      // the glow — the halo belongs to a hovering pointer.
      if (event.pointerType === 'touch') return

      targetX = event.clientX
      targetY = event.clientY

      if (seen) return
      seen = true
      // Land on the first sample rather than sliding in from the origin.
      x = targetX
      y = targetY
      el.style.opacity = '1'
    }

    const tick = () => {
      x += (targetX - x) * EASE
      y += (targetY - y) * EASE
      /* translate3d, not top/left: this stays on the compositor and never
         triggers layout. The trailing translate(-50%, -50%) centres the box on
         the pointer and resolves against the element's own size. */
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    /* Passive: this listener never calls preventDefault, and saying so keeps it
       off the scroll-blocking path. */
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [active])

  if (!active) return null

  return <div ref={ref} aria-hidden className="pointer-halo" />
}
