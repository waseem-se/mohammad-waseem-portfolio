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
        {/* The diagram track opens narrow at `lg` and reaches its 500px design
            width at `xl`. At exactly 1024px a 500px track leaves the headline a
            404px measure while the display clamp still resolves to ~64px,
            which wraps it to eight lines and hyphen-breaks "production-grade".
            That lower bound is unchanged and still binding.

            Past `2xl` the shell is the viewport, so the track grows with it
            rather than leaving a 500px figure marooned beside a 1200px copy
            column. 560 is a size, not a redraw: the SVG is `w-full` and scales
            uniformly — see HeroPipeline. The copy's own measure is capped
            separately, so this `1fr` is deliberately wider than the text it
            holds. */}
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] 2xl:gap-20">
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
                journey it describes stepped back in muted grey.

                Carries `font-display` explicitly because this is a <p>: the real
                <h1> above is sr-only, so the h1-h4 base rule in globals.css does
                not reach the line that actually renders. Tracking and leading are
                Space Grotesk's, not Inter's — at the clamp's 68px ceiling
                -0.03em is -2.04px a pair, which this face does not have the
                sidebearings to give up, and 1.06 collides on the "g" of
                "Building". */}
            <p className="font-display mt-7 measure 2xl:measure-lg text-[length:var(--text-display)] leading-[1.08] font-semibold tracking-[-0.02em]">
              Building production-grade AI systems{' '}
              <span className="text-muted">from LLM prototypes to reliable products.</span>
            </p>

            <p className="mt-7 max-w-xl 2xl:measure text-base leading-relaxed text-muted md:text-lg">
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
