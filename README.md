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
source of truth for titles, dates, systems, and metrics on this site. Technology coverage is
slightly broader: the Retrieval layer, the Retrieval / Vector Data skill group, and one Lead
Software Engineer bullet name ClickHouse and PostgreSQL + pgvector, which are hands-on
experience not yet reflected in the PDF. No metric, title, date, or system is invented.

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

**Client JavaScript is opt-in.** Everything is a React Server Component except seven files
that need state: the header (scroll-spy), the mobile nav sheet, the metrics count-up, the
experience timeline, the architecture tablist, the copy-email button, and the theme toggle.
There is no animation library and no icon library — the icons in
[icons.tsx](components/ui/icons.tsx) are hand-authored SVG.

**The hero pipeline** ([HeroPipeline.tsx](components/diagram/HeroPipeline.tsx)) is
server-rendered inline SVG. A packet traverses the spine on a CSS `stroke-dashoffset`
animation, and each stage flashes via an `animation-delay` computed from its distance along
the path. Node rectangles paint after the spine so the packet passes behind them.

**One naming trap to avoid:** do not add a `--color-base` token. It would generate a
`text-base` *colour* utility that shadows Tailwind's built-in `text-base` *font size* and
silently paint body copy the same colour as the page. The background token is
`--color-canvas` for this reason. The same rule is why the diagram tokens are `node-`
prefixed: bare `--color-input` / `--color-output` would produce `bg-input` and `text-output`,
generic enough to be reached for by accident.

## Theming

**Light is the default; dark is an opt-in class.** Precedence on load is stored choice ->
OS preference -> light.

- **Where the values live.** [globals.css](app/globals.css) declares the raw palette as
  plain custom properties in `:root` (light) and `.dark` (dark), then maps them into
  Tailwind through `@theme inline`. That indirection is load-bearing. `@theme` values are
  also read at *build* time — most visibly for the static hex fallback Tailwind emits
  alongside every `color-mix()` opacity modifier — so putting the colours directly in
  `@theme` and overriding `--color-*` in `.dark` compiles a half-opacity `bg-surface` to a
  hardcoded light hex that `.dark` cannot reach. Routing through a plain property keeps the
  value live. (Both this file and `globals.css` spell that example out rather than writing
  it as a class — Tailwind scans them too, and would emit a dead utility for it.) `:root` and `.dark` are both specificity 0-1-0 and unlayered, so **`.dark` must
  stay below `:root`** in the file.
- **No flash.** A synchronous inline script in [layout.tsx](app/layout.tsx) sets the class
  before first paint. With `output: 'export'` there is no server, no middleware, and no
  cookie, so this is the only mechanism; a classic inline script is blocked on pending
  render-blocking stylesheets, so it runs after the CSS is in hand and before anything is
  painted. `<html>` carries `suppressHydrationWarning` for that attribute.
- **The toggle is stateless.** [ThemeToggle.tsx](components/ui/ThemeToggle.tsx) reads
  nothing and stores nothing in React — `<html class="dark">` is the single source of
  truth, and the glyph and label swap in CSS. Server and first client render are identical,
  so there is no mount gate and no pop-in. It appears twice, once in the header row and
  once inside the mobile sheet, because the sheet traps focus.
- **Two things are deliberately not theme-aware.** The OG card
  ([opengraph-image.tsx](app/opengraph-image.tsx)) is a build-time PNG rendered inside other
  platforms' chrome, where staying dark keeps its edge against light feeds. The favicon
  ([icon.svg](app/icon.svg)) follows browser chrome, not the site.

## Accessibility

Verified rather than assumed:

- WCAG AA contrast on all three text tokens, in both themes, against both the page and the
  raised surface. The binding pair either way is `dim` on `raised`: **5.22:1 light, 5.07:1
  dark**. Every other pair sits above it — on `raised`, `ink` measures 14.88 / 14.84 and
  `muted` 6.18 / 6.22. Diagram node colours clear the 3:1 non-text floor on `raised` in both.
- Full keyboard operation — skip link, visible focus rings, an ARIA tablist for the
  architecture stack (arrows / Home / End with wrapping), and a mobile nav sheet that traps
  focus, closes on Escape, and restores focus to its trigger.
- `prefers-reduced-motion` removes the packet, the stage flashes, and the scroll reveals
  outright, and the metrics render their real values rather than a frozen counter.
- No horizontal overflow at 320 / 375 / 768 / 1024 / 1440.
- Content stays visible without JavaScript (a `<noscript>` rule restores the reveals).
