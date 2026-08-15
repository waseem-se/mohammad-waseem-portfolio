'use client'

import { useEffect, useState } from 'react'
import { CheckIcon, CopyIcon } from './icons'

/**
 * Email address with a copy button.
 *
 * The address itself stays a plain mailto link, so the feature degrades to a
 * working link if the clipboard API is unavailable or permission is refused.
 */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      // Clipboard unavailable — the mailto link beside this button still works.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`mailto:${email}`}
        className="font-mono text-sm break-all text-ink underline decoration-hairline-strong underline-offset-4 transition-colors hover:decoration-accent"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex size-9 items-center justify-center rounded-md border border-hairline text-dim transition-colors hover:border-hairline-strong hover:text-ink"
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
        <span className="sr-only">Copy email address</span>
      </button>
      {/* Announced politely so the confirmation is not silent for screen readers. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </div>
  )
}
