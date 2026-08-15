import { contact, profile } from '@/content/profile'
import { Section, SectionHeader, ActionLink } from '@/components/ui/primitives'
import { CopyEmail } from '@/components/ui/CopyEmail'
import { DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from '@/components/ui/icons'

export function Contact() {
  return (
    <Section id="contact">
      <SectionHeader id="contact-title" index="08" eyebrow="Contact" title={contact.title} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="text-base text-muted">{contact.intro}</p>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {contact.interests.map((interest) => (
              <li key={interest} className="flex items-center gap-3 text-sm text-ink">
                <span aria-hidden className="size-1 shrink-0 rounded-full bg-accent" />
                {interest}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-hairline bg-surface/50 p-7 md:p-8">
          <p className="mono-label mb-4">Direct</p>
          {/* mailto + copy, deliberately not a form — there is no backend to
              receive one, and a form that silently discards a message is worse
              than no form. */}
          <CopyEmail email={profile.email} />

          <div className="mt-7 flex flex-wrap gap-3">
            <ActionLink href={`mailto:${profile.email}`} variant="primary">
              <MailIcon className="size-4" />
              Email me
            </ActionLink>
            <ActionLink href={profile.links.resume} download>
              <DownloadIcon className="size-4" />
              Resume
            </ActionLink>
          </div>

          <div className="mt-7 border-t border-hairline pt-6">
            <p className="mono-label mb-4">Elsewhere</p>
            <div className="flex flex-wrap gap-3">
              <ActionLink href={profile.links.linkedin} external>
                <LinkedInIcon className="size-4" />
                LinkedIn
              </ActionLink>
              <ActionLink href={profile.links.github} external>
                <GitHubIcon className="size-4" />
                GitHub
              </ActionLink>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
