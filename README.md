# mohammad-waseem-portfolio

Personal portfolio for **Mohammad Waseem** — Senior Software Engineer, GenAI & LLM Systems.

Static site: Next.js App Router, TypeScript, Tailwind CSS v4, exported to plain HTML.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export -> out/
npm run lint
npm run typecheck
npx serve out      # preview the built artifact
```

`npm run build` writes a fully static `out/` — no Node runtime required to host it.

## Deploying

Built for **Vercel / Netlify** at a domain root (no `basePath`). Push the repo and the
default build command works as-is.

Set `NEXT_PUBLIC_SITE_URL` to the real domain before going live — it feeds the canonical
URLs, OpenGraph tags, and `sitemap.xml`. Without it the build falls back to the
placeholder in [content/profile.ts](content/profile.ts).

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com npm run build
```

To host somewhere that serves the site from a subpath instead, add `basePath` and
`assetPrefix` to [next.config.ts](next.config.ts).

## Editing content

**All copy, metrics, and diagrams live in [content/](content/) — no text is hardcoded in
components.** To change what the site says, edit these and nothing else:

| File | Contains |
| --- | --- |
| [profile.ts](content/profile.ts) | Name, title, headline, email, links, About copy, SEO strings, GitHub section |
| [metrics.ts](content/metrics.ts) | The seven credibility figures, each with a `source` naming its resume line |
| [experience.ts](content/experience.ts) | Companies, roles, bullets, education, accomplishments |
| [projects.ts](content/projects.ts) | The five projects in full, including their architecture graphs |
| [architecture.ts](content/architecture.ts) | The eight-layer stack, and the hero pipeline graph |
| [skills.ts](content/skills.ts) | Five skill categories |
| [philosophy.ts](content/philosophy.ts) | The four principles, and the nav items |

### Content provenance

The resume at [public/Mohammad_Waseem_Resume.pdf](public/Mohammad_Waseem_Resume.pdf) is the
source of truth for every fact on this site — systems, titles, dates, technologies, and
metrics. Nothing is invented.

Project detail pages also carry *design rationale* (Engineering Decisions, Challenges, Key
Takeaway), which the resume does not contain. Every such string is marked with a
`// REVIEW:` comment in [content/projects.ts](content/projects.ts). These assert no metric,
scale figure, team size, timeline, or customer beyond the resume — they explain why a
stated technology fits a stated problem. **Read them before publishing.**

Two deliberate choices worth knowing:

- **The phone number on the resume is not published in the site HTML.** It remains inside
  the downloadable PDF. Replace the PDF with a redacted copy if that matters.
- **The Lead Software Engineer role is dated `Aug 2025 – Present`.** The resume prints
  `Jun 2022 – Present` against the *company* and gives the role no explicit range; since
  SDE 2 ends Jul 2025, the timeline dates Lead to follow it so the progression reads
  without three overlapping roles. The company band still shows `Jun 2022 – Present`.

### Adding a profile photo

`profile.photo` in [content/profile.ts](content/profile.ts) is `null`, so the About section
renders no image. Drop a file in `public/` and set:

```ts
photo: { src: '/waseem.jpg', alt: 'Mohammad Waseem' }
```

### GitHub repositories

`codeSection.curatedRepos` is an empty array, so the Code & Engineering section links to the
profile only. The public repos on that account are mostly forks and practice work and none
of the systems described here are public, so nothing is auto-fetched. Add entries to that
array to render a hand-picked list.

## Architecture notes

**Diagrams are data.** Every architecture diagram is a `FlowGraph` (nodes + edges + optional
branching lanes) in `content/`, rendered by one component,
[FlowDiagram.tsx](components/diagram/FlowDiagram.tsx). The mobile vertical flow is a layout
of the same data, not a second asset. Diagrams render as semantic HTML with CSS connectors,
so the text is selectable and screen-readable; each carries a generated prose description.

**Client JavaScript is opt-in.** Everything is a React Server Component except six files
that need state: the header (scroll-spy), the mobile nav sheet, the metrics count-up, the
experience timeline, the architecture tablist, and the copy-email button. There is no
animation library and no icon library — the icons in
[icons.tsx](components/ui/icons.tsx) are hand-authored SVG.

**The hero pipeline** ([HeroPipeline.tsx](components/diagram/HeroPipeline.tsx)) is
server-rendered inline SVG. A packet traverses the spine on a CSS `stroke-dashoffset`
animation, and each stage flashes via an `animation-delay` computed from its distance along
the path. Node rectangles paint after the spine so the packet passes behind them.

**One naming trap to avoid:** do not add a `--color-base` token. It would generate a
`text-base` *colour* utility that shadows Tailwind's built-in `text-base` *font size* and
silently paint body copy the same colour as the page. The background token is
`--color-canvas` for this reason.

## Accessibility

Verified rather than assumed:

- WCAG AA contrast on all three text tokens, against both the page and raised surfaces
  (`ink` 16.9:1, `muted` 7.1:1, `dim` 5.7:1).
- Full keyboard operation — skip link, visible focus rings, an ARIA tablist for the
  architecture stack (arrows / Home / End with wrapping), and a mobile nav sheet that traps
  focus, closes on Escape, and restores focus to its trigger.
- `prefers-reduced-motion` removes the packet, the stage flashes, and the scroll reveals
  outright, and the metrics render their real values rather than a frozen counter.
- No horizontal overflow at 320 / 375 / 768 / 1024 / 1440.
- Content stays visible without JavaScript (a `<noscript>` rule restores the reveals).
