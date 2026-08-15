import { profile, heroTags } from '@/content/profile'
import { HeroPipeline } from '@/components/diagram/HeroPipeline'
import { ActionLink, TechTag } from '@/components/ui/primitives'
import {
  ArrowRightIcon,
  DownloadIcon,
  GitHubIcon,
  LeetCodeIcon,
  LinkedInIcon,
} from '@/components/ui/icons'

export function Hero() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative scroll-mt-24">
      <div aria-hidden className="grid-field pointer-events-none absolute inset-0 -z-10" />

      <div className="shell pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-14">
          {/* Copy */}
          <div>
            <p className="mono-label mb-6 flex items-center gap-3">
              <span className="relative flex size-1.5">
                {/* The diagram's `output` green, not emerald-400: that measures
                    1.61:1 on white, which makes the dot invisible on light. */}
                <span className="absolute inline-flex size-full rounded-full bg-node-output" />
              </span>
              Available for senior GenAI &amp; backend roles
            </p>

            <h1 id="hero-title" className="sr-only">
              {profile.name} — {profile.title}
            </h1>

            <p aria-hidden className="font-mono text-sm tracking-tight text-muted">
              {profile.name}
            </p>
            <p aria-hidden className="mt-1 font-mono text-sm tracking-tight text-accent">
              {profile.title}
            </p>

            {/* One emphasis break, not three: the claim at full ink weight, the
                journey it describes stepped back in muted grey. */}
            <p className="mt-7 max-w-2xl text-[length:var(--text-display)] leading-[1.06] font-semibold tracking-[-0.03em]">
              Building production-grade AI systems{' '}
              <span className="text-muted">from LLM prototypes to reliable products.</span>
            </p>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {profile.supporting}
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {heroTags.map((tag) => (
                <li key={tag}>
                  <TechTag>{tag}</TechTag>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <ActionLink href="#projects" variant="primary">
                Explore Projects
                <ArrowRightIcon className="size-4" />
              </ActionLink>
              <ActionLink href="#experience">Experience</ActionLink>
              <ActionLink href={profile.links.github} external>
                <GitHubIcon className="size-4" />
                GitHub
              </ActionLink>
              <ActionLink href={profile.links.linkedin} external>
                <LinkedInIcon className="size-4" />
                LinkedIn
              </ActionLink>
              <ActionLink href={profile.links.leetcode} external>
                <LeetCodeIcon className="size-4" />
                LeetCode
              </ActionLink>
              <ActionLink href={profile.links.resume} download>
                <DownloadIcon className="size-4" />
                Download Resume
              </ActionLink>
            </div>
          </div>

          {/* System visualization. The grid item must stretch — `justify-self-end`
              would shrink-wrap it and starve the SVG's `w-full` of a width. */}
          <div className="w-full">
            <div className="mono-label mb-5">Request path</div>
            <HeroPipeline />
          </div>
        </div>
      </div>
    </section>
  )
}
