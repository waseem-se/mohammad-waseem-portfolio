import { codeSection, profile } from '@/content/profile'
import { Section, SectionHeader, TechTag, ActionLink } from '@/components/ui/primitives'
import { GitHubIcon, ArrowRightIcon, ExternalIcon } from '@/components/ui/icons'

export function CodeAndEngineering() {
  const { curatedRepos } = codeSection

  return (
    <Section id="code">
      <SectionHeader
        id="code-title"
        index="07"
        eyebrow="Code"
        title={codeSection.title}
        lede={codeSection.body}
      />

      {curatedRepos.length > 0 ? (
        <ul className="mb-8 grid gap-4 sm:grid-cols-2">
          {curatedRepos.map((repo) => (
            <li key={repo.name}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full rounded-xl border border-hairline bg-surface/50 p-6 transition-colors hover:border-hairline-strong"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-mono text-sm text-ink group-hover:text-accent">
                    {repo.name}
                  </h3>
                  <ExternalIcon className="size-4 shrink-0 text-dim" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{repo.description}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {repo.tech.map((t) => (
                    <li key={t}>
                      <TechTag subtle>{t}</TechTag>
                    </li>
                  ))}
                </ul>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col items-start gap-6 rounded-xl border border-hairline bg-surface/50 p-7 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div className="flex items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-hairline-strong bg-raised text-muted">
            <GitHubIcon className="size-5" />
          </span>
          <div>
            <p className="font-mono text-sm text-ink">github.com/waseem-se</p>
            <p className="mt-1 text-sm text-dim">Public profile</p>
          </div>
        </div>

        <ActionLink href={profile.links.github} external>
          Open GitHub
          <ArrowRightIcon className="size-4" />
        </ActionLink>
      </div>
    </Section>
  )
}
