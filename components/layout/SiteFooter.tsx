import { profile } from '@/content/profile'
import { GitHubIcon, LeetCodeIcon, LinkedInIcon, MailIcon } from '@/components/ui/icons'

export function SiteFooter() {
  const year = 2026

  return (
    <footer className="border-t border-hairline py-10">
      <div className="shell flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-sm text-ink">{profile.name}</p>
          <p className="mt-1 text-sm text-dim">{profile.title}</p>
        </div>

        <div className="flex items-center gap-1">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:text-ink"
          >
            <MailIcon className="size-[18px]" />
            <span className="sr-only">Email {profile.name}</span>
          </a>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:text-ink"
          >
            <GitHubIcon className="size-[18px]" />
            <span className="sr-only">GitHub (opens in a new tab)</span>
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:text-ink"
          >
            <LinkedInIcon className="size-[18px]" />
            <span className="sr-only">LinkedIn (opens in a new tab)</span>
          </a>
          <a
            href={profile.links.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:text-ink"
          >
            <LeetCodeIcon className="size-[18px]" />
            <span className="sr-only">LeetCode (opens in a new tab)</span>
          </a>
        </div>
      </div>

      <div className="shell mt-8 flex flex-col gap-1 border-t border-hairline pt-6">
        <p className="font-mono text-xs text-dim">
          © {year} {profile.name}.
        </p>
      </div>
    </footer>
  )
}
