import Link from 'next/link'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export default function NotFound() {
  return (
    <>
      <SiteHeader homeAnchors={false} />
      <main id="main" className="shell flex min-h-[60vh] flex-col justify-center py-24">
        <p className="mono-label mb-5">404</p>
        <h1 className="text-[length:var(--text-section)] font-semibold">Page not found.</h1>
        <p className="mt-4 max-w-md text-muted">
          That route does not exist on this site.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 w-fit items-center rounded-lg bg-ink px-4 text-sm font-medium text-canvas"
        >
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
