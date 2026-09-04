# mohammad-waseem-portfolio

Personal portfolio for **Mohammad Waseem** — Senior Software Engineer, GenAI & LLM Systems.

Static site: Next.js App Router, TypeScript, Tailwind CSS v4, exported to plain HTML.

## Commands

```bash
npm install
npm start          # http://localhost:3000
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

A node with `attachedTo` hangs laterally off its host rather than taking a place in the
chain — a store a stage queries, not a stage the request passes through. Without it the
renderer splices such a node into the sequence, which is how the narrow-screen hero once
drew `Retrieval -> Vector DB -> LLM` while the SVG drew Vector DB as a side branch. The
generated prose description follows the same split, so the two never disagree.

**The page is the viewport; only text is capped.** `.shell` in
[globals.css](app/globals.css) is a gutter, not a page width — it carries no `max-width`, so
the header, footer, section rules, card grids, metrics strip and diagrams all span the
display, and the side padding grows in steps from 1.25rem to 5rem past 1920px. What stops
growing is running text: `measure` (42rem), `measure-lg` (48rem) and `measure-xl` (56rem) cap
paragraphs and headings, and those three values live only in that file. They are the same
numbers that were previously spelled `max-w-2xl` / `max-w-3xl` / `max-w-4xl` at each call
site, promoted to names so "how wide may a line of text be" is answered once. Charts obey a
measure too, through `ChartFrame`'s `bodyMax` — past a point extra width stops being
resolution and starts being a bar you cannot scan back to its own label.

A consequence worth knowing before adding a section: a grid that was safe when the content
stopped at 1152px may not be. Skills goes five across only at `3xl` (1920) because at 1536 a
five-column card leaves 217px of content and `TechTag` is `whitespace-nowrap`; Philosophy
goes four across at `2xl` only because `principles.length === 4`, and a ragged trailing cell
would show through the `gap-px` seams as a tinted block. The project page's Engineering
Decisions grid deliberately stays two across for that reason — its item count varies 4/3/4.

**Charts are data too, and they carry a contract.** Every figure charted is already on the
page in prose; the charts derive from `content/` rather than restating it, so a content edit
moves them. Bars are CSS, not SVG: SVG `<text>` does not wrap and a `viewBox` scales text
with the box, which across this site's range of container widths would mean 5px labels on a
phone and 40px ones on a monitor. [Chart.tsx](components/chart/Chart.tsx) centralises the
part that must never be forgotten rather than the geometry — `caveat` and `table` are
*required* props on `ChartFrame`, so no chart can ship without stating what its numbers do
not mean and without a real `<table>` for anyone who cannot see it. Scales are explicit
props, never derived inside a group: deriving per group is how two charts drawn side by side
silently end up on two different axes, which is why all three LeetCode tiers are handed one
`topicMax` computed across all nine topics.

Two figures the charts deliberately refuse to draw: the LeetCode counts are never summed
(LeetCode counts a problem once per language and once per topic, so any total overstates),
and the two accuracy percentages carry no bar at all, because a level and a reduction on one
0-100% axis invites a comparison that means nothing.

**`node-*` tokens are fills and legend swatches only, never text.** `--node-guard` measures
4.11:1 and `--node-retrieval` 4.48:1 on `raised` — past the 3:1 non-text floor a bar fill
needs, short of the 4.5:1 AA floor a label needs. All chart text wears `ink` / `muted` /
`dim` / `accent`, with a coloured swatch beside it carrying the identity.

**Node kinds carry meaning, and not through colour alone.** `retrieval` is its own kind
rather than a flavour of `compute`: with them merged, routing, orchestration, and retrieval
all rendered in one indigo, flattening the distinction the Principles section is built on.
`llm` still shares `compute`'s hue and is separated by *form* — dashed outline, hollow dot,
in both renderers — which states that the model stage is the probabilistic one and keeps
the difference legible without relying on hue.

**Client JavaScript is opt-in.** Everything is a React Server Component except eight files.
Seven need state: the header (scroll-spy), the mobile nav sheet, the metrics count-up, the
[experience disclosures](components/sections/ExperienceTimeline.tsx), the architecture
tablist, the copy-email button, and the theme toggle. The eighth,
[PointerHalo.tsx](components/ui/PointerHalo.tsx), is the one exception to that rule: it holds
no state anything depends on and is pure decoration. It earns its place by costing nothing
when unwanted — it renders `null` on the server, on the first client render, on any coarse
pointer, and under `prefers-reduced-motion`, and nothing on the page is positioned relative
to it. The charts add no client components at all; the experience section was split so its
shell and its two charts could stay on the server.

There is no animation library, no icon library and no chart library — the icons in
[icons.tsx](components/ui/icons.tsx) are hand-authored SVG and the bars in
[components/chart/](components/chart/) are `div`s with a width.

**The hero pipeline** ([HeroPipeline.tsx](components/diagram/HeroPipeline.tsx)) is
server-rendered inline SVG. A packet traverses the spine on a CSS `stroke-dashoffset`
animation, and each stage flashes via an `animation-delay` computed from its distance along
the path. Node rectangles paint after the spine so the packet passes behind them. Static
chevrons sit in each spine gap and at both ends of the lateral branch: direction must not
depend on the packet, which reduced motion removes and a screenshot never catches.

**One naming trap to avoid:** do not add a `--color-base` token. It would generate a
`text-base` *colour* utility that shadows Tailwind's built-in `text-base` *font size* and
silently paint body copy the same colour as the page. The background token is
`--color-canvas` for this reason. The same rule is why the diagram tokens are `node-`
prefixed: bare `--color-input` / `--color-output` would produce `bg-input` and `text-output`,
generic enough to be reached for by accident. `--font-display` was checked against the same
rule and is clear: `font-display` is a `@font-face` *descriptor*, never a property, and
Tailwind ships no built-in utility by that name.

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
  ([icon.svg](app/icon.svg)) follows browser chrome, not the site. The OG card is not
  font-aware either — it stays on system fonts so the build never depends on the network,
  which means its headline is the one place the site's display face does not reach.

## Accessibility

Verified rather than assumed:

- WCAG AA contrast on all three text tokens, in both themes, against both the page and the
  raised surface. On `raised` the binding pair either way is `dim`: **5.22:1 light, 5.07:1
  dark**; `ink` measures 14.88 / 14.84 and `muted` 6.18 / 6.22. Diagram node colours clear
  the 3:1 non-text floor on `raised` in both.
- The pointer halo cannot reach `raised`. It paints at `z-index: -1`, behind every opaque
  `surface` and `raised` panel, so the guardrail against stacking `accent-soft` on `raised`
  is not merely respected but unreachable. The only text it sits behind is text on the bare
  canvas, where `dim` falls from 6.24 to **5.21:1 light** and 5.85 to **5.00:1 dark** at the
  halo's brightest point — its inner stop is `accent-soft` verbatim, so at full strength it
  tints no harder than a chip. 5.00 is the new site-wide binding pair.
- Full keyboard operation — skip link, visible focus rings, an ARIA tablist for the
  architecture stack (arrows / Home / End with wrapping), and a mobile nav sheet that traps
  focus, closes on Escape, and restores focus to its trigger.
- `prefers-reduced-motion` removes the packet, the stage flashes, the scroll reveals and the
  pointer halo outright, and the metrics render their real values rather than a frozen
  counter. Nothing in a chart animates at all: bar widths are inline `style` attributes, so
  they paint at full length from the stylesheet alone. The
  pipeline still reads as directed: the chevrons are static, so nothing about the flow is
  carried by motion alone.
- No diagram or chart distinction rests on colour alone. `llm` is dashed and hollow-dotted as
  well as tinted, and every node carries an `sr-only` kind label. Every chart series repeats
  its identity as a monospace code on each mark and in the legend; education on the career
  timeline is dashed and unfilled rather than a fifth hue; the technology matrix encodes
  presence as filled-versus-empty and states "3 of 5" as text. Each chart also carries an
  `sr-only` `<table>` with the same figures.
- No horizontal overflow at 320 / 375 / 768 / 1024 / 1440 / 1536 / 1920 / 2560, on the home
  page and on a project page, in both themes.
- Content stays visible without JavaScript (a `<noscript>` rule restores the reveals).
