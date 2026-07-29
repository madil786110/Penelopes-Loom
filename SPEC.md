# Build Bible — Two Projects Around *The Odyssey* (2026)

Two independent repos. Build **Project A (IMAX Cropper)** first — it ships in an evening and gives you a demo link. Then **Project B (Penelope's Loom)**, which is the one people remember.

**How to use this document with Claude Code:** don't paste the whole thing at once. Save it in each repo as `SPEC.md`, then start the session with:

> Read SPEC.md. Build only Part 1, Milestone 1. Stop and show me before continuing.

Work milestone by milestone. Anything marked **NON-GOAL** is off limits — if the model starts building it, stop it. Scope creep is the main way both of these die.

---

# PART 1 — THE IMAX CROPPER

## 1.1 What it is

*The Odyssey* is the first feature shot entirely with IMAX cameras (1.43:1). Almost every screen it plays on afterwards is narrower. This tool lets anyone drop in an image and see exactly how much of the frame disappears at each aspect ratio.

**The one job of the page:** make the loss visceral and quantified. Not a photo editor.

**NON-GOALS.** No accounts, no backend, no database, no image uploads leaving the browser, no gallery, no share-to-social buttons, no filters, no cloud storage, no server-side rendering. Everything runs client-side.

## 1.2 Stack

- Vite + React 18 + TypeScript
- Plain CSS with custom properties in `src/styles/tokens.css`. **No Tailwind, no component library, no CSS-in-JS.**
- Canvas 2D for rendering. No WebGL.
- Zero runtime dependencies beyond React. If a dependency is proposed, reject it.
- Deploy target: GitHub Pages via `gh-pages` branch or Actions. Set `base` in `vite.config.ts` to the repo name.

## 1.3 The core concept — two-stage crop

This is the most important section. Get it wrong and the whole thing is meaningless.

An uploaded image is an arbitrary ratio, but the premise is IMAX. So:

**Stage 1 — Establish the negative.** Center-crop the uploaded image to exactly **1.43:1**. This is now "the IMAX negative." All loss percentages are measured against *this*, never against the original upload.

**Stage 2 — Crop to the target ratio.** Going wider than 1.43 means keeping full width and trimming equally from top and bottom.

```
negativeAspect = 1.43
keptHeight  = negativeWidth / targetRatio
lossFraction = 1 - (keptHeight / negativeHeight)
             = 1 - (negativeAspect / targetRatio)
```

Because both stages are center-anchored, loss depends only on the ratios — not on the image. That's the elegant part and it should be stated in the UI.

**Verification test cases** (write these as unit tests, they must pass exactly):

| From | To | Label | Loss |
|---|---|---|---|
| 1.43 | 1.43 | Full IMAX 70mm | 0.0% |
| 1.43 | 1.78 | HDTV 16:9 | 19.7% |
| 1.43 | 1.90 | Digital IMAX | 24.7% |
| 1.43 | 2.39 | Scope | 40.2% |

**40% is the headline number.** It is what the LinkedIn post is about. Make it impossible to miss.

## 1.4 Features by milestone

**Milestone 1 — Math and canvas, no styling.**
Load a bundled sample image, render the 1.43 negative to canvas, four buttons for the four ratios, matte bars drawn over the cropped region, loss percentage printed as raw text. Ugly is fine. Unit tests for the crop math pass.

**Milestone 2 — Input and interaction.**
Drag-and-drop plus a file picker plus paste-from-clipboard (`onpaste`). Continuous slider from 1.43 to 2.39 with magnetic snapping within 0.03 of a named ratio. Live-updating loss readout. Three bundled samples that work before anyone uploads anything: a wide landscape, a vertical-heavy composition (a tall statue or column — loses the most and proves the point), and a centered portrait.

**Milestone 3 — The reveal control.**
A three-state toggle for how the cropped region renders:
- **Matte** — cropped area filled solid, what you'd actually see in a cinema
- **Ghost** — cropped area at 18% opacity, so you see what's lost *and* what's kept simultaneously (**this is the default**)
- **Off** — full negative, no crop

Ghost is the whole idea. Matte alone is just letterboxing; ghost is the argument.

**Milestone 4 — Design pass.** See 1.5.

**Milestone 5 — Export.**
"Download comparison" writes a single PNG: the same image at 1.43 and 2.39 stacked, with the loss percentage burned in and a small credit line. This is the image you post to LinkedIn, so it must look good at 1200×1200.

## 1.5 Design direction

**Do not build a dark cinema-styled app with a neon accent.** That is the default answer and it will look like every other AI-built tool. Ground it in the actual subject instead.

**The concept: a film lab light table.** You inspect a 70mm negative by laying it on a backlit acrylic surface. So the page is *bright, cool, and clinical*, with dense technical markings — the opposite of a moody player UI. The image is the only warm thing on the page.

**Palette** (define in `tokens.css`, use nothing outside it):

```css
--table:    #E6EDF1;  /* backlit acrylic, page ground */
--halation: #FFFFFF;  /* glow beneath the frame, panel fills */
--ink:      #14181B;  /* frame lines, display type */
--slate:    #5A666E;  /* secondary text, inactive controls */
--edge:     #F5B301;  /* Kodak edge-code yellow — active state and the loss number ONLY */
--matte:    rgba(20, 24, 27, 0.92); /* the crop mask */
```

`--edge` appears in at most two places on screen at once. That restraint is what makes it read as a signal rather than decoration.

**Type — the IBM Plex family in three roles.** Plex has engineering-drawing provenance, which fits, and using one superfamily across three roles is a deliberate choice rather than a random pairing.

- Display: **IBM Plex Sans Condensed**, weight 700, wide letter-spacing, uppercase — ratio labels and headings, echoing lettering on a camera slate
- Body: **IBM Plex Sans**, 400/500
- Data: **IBM Plex Mono** — every number on the page, no exceptions

Type scale: 12 / 14 / 16 / 22 / 34 / 76px. The loss percentage is 76px Plex Mono in `--edge`. Nothing else on the page is above 34.

**Layout.** No hero section. The tool *is* the page — canvas centered and immediately visible above the fold, controls in a single horizontal strip beneath it, one short paragraph of explanation below that. A person who lands here should be dragging the slider within three seconds.

**Signature element — the aperture plate.** When the ratio changes, the matte bars don't fade or jump. They *slide in from top and bottom together* with a mechanical ease (`cubic-bezier(0.65, 0, 0.35, 1)`, 380ms), like plates closing in a camera gate. Add hairline `--edge` frame lines at the exact crop boundary that track the bars. This is the only animation on the page. Everything else is instant.

**Quality floor, unannounced:** responsive to 360px wide, visible keyboard focus rings, slider operable by arrow keys, `prefers-reduced-motion` disables the plate animation, canvas has a text alternative describing the current ratio and loss.

**Copy rules.** Buttons say what happens: "Download comparison," not "Export." The empty state is an instruction, not an apology: "Drop an image, or paste one." Never write "Oops."

## 1.6 README

Live demo link on line one, above everything. Then the 1.43-vs-2.39 comparison image. Then three sentences on why the number is fixed regardless of image. Then setup. Nothing else.

---

# PART 2 — PENELOPE'S LOOM

## 2.1 What it is

Penelope told the suitors she would choose one of them when she finished weaving a burial shroud. She wove by day and secretly unravelled it by night, for three years.

This repo does the same thing, using git as the loom. A GitHub Action weaves rows into an SVG each morning and destroys them each night. The commit history is the artwork.

## 2.2 The central design decision

Naive version: force-push over everything, history gone, nobody sees anything. Dead on arrival.

**The design: the shroud lives on a branch, the deception is recorded on `main`.**

- Branch **`loom`** — holds `loom.svg`. Rows are committed to it through the day. At night it is force-reset to empty. The weaving genuinely vanishes, faithfully.
- Branch **`main`** — holds the code, the README, and `CHRONICLE.md`, which gains exactly one line per night and is never rewritten.

```
Night 47 — 340 rows unwoven. Suitors still waiting.
```

The shroud disappears; the record of the deception survives. Say this explicitly in the README, because it's the thing that makes someone go "oh, that's clever."

## 2.3 The `warp` tag

Create an orphan commit containing `loom.svg` in its **empty state** — bare vertical warp threads, no weft. Tag it `warp` and never move it.

Unweaving is then one line:

```bash
git push --force origin refs/tags/warp:refs/heads/loom
```

Because the empty file still exists, the README image renders as an empty loom at night rather than 404-ing. The visual actually changes with the time of day. That detail is worth the setup.

## 2.4 Repo layout

```
main:
  loom.js              # generator, pure, no git awareness
  lib/pattern.js       # deterministic pattern from seed
  workflows/weave.yml, unweave.yml   (in .github/workflows/)
  CHRONICLE.md
  README.md
  SPEC.md
loom:
  loom.svg             # the shroud, transient
```

## 2.5 The generator

**Build and perfect this locally before touching GitHub Actions.** It is a plain Node script with no git and no cron involvement, so you get a normal fast feedback loop.

```
node loom.js --day 47 --rows 220 > loom.svg
```

Requirements:

- **Deterministic.** `--day 47` produces byte-identical output every time. Seed a small PRNG (mulberry32 or xorshift, ~10 lines, no dependency) with the day number. No `Math.random()`, no `Date.now()`, anywhere.
- **`--rows N`** draws the first N weft rows of a 400-row cloth; the remainder shows bare warp threads. `--rows 0` is the empty warp state used for the `warp` tag.
- Day number is derived, never stored: `floor((today - START_DATE) / 86400000) + 1`. Stateless, so it can never drift out of sync.
- Output is a standalone SVG, roughly 800×1100, no external fonts, no embedded raster images.

**Visual spec.** Greek key / meander border on all four sides, drawn in black-figure black. The cloth body is a woven twill texture built from short horizontal weft strokes crossing visible vertical warp lines. Row density and small motif variations derive from the seed, so each day's cloth is recognisably the same design but never identical. Slight irregularity in stroke length reads as handwoven; perfect uniformity reads as a spreadsheet.

Palette:

```
linen ground   #E5DCC8
black-figure   #1A1614
Tyrian purple  #5B2A54   (one motif band, roughly a third of the way up)
warp thread    #C9BFA8   (pale, only visible in the unwoven region)
```

The purple band should only be reachable after ~120 rows — meaning on a normal day you watch it emerge and then lose it. That is the emotional beat of the whole piece.

## 2.6 The workflows

Both need `workflow_dispatch` alongside `schedule` so you can test manually and never sit waiting on cron.

**`weave.yml`** — hourly through the day, adding rows as it goes:

```yaml
name: Weave
on:
  schedule:
    - cron: '0 10-23 * * *'   # 06:00–19:00 America/New_York (EDT). Cron is UTC.
  workflow_dispatch:
concurrency:
  group: loom
  cancel-in-progress: false
jobs:
  weave:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Weave rows
        run: |
          git fetch origin loom:loom
          # compute day + row count, regenerate loom.svg, commit to loom branch
      - name: Push
        run: git push origin loom
```

**`unweave.yml`**:

```yaml
name: Unweave
on:
  schedule:
    - cron: '0 3 * * *'       # 23:00 America/New_York (EDT)
  workflow_dispatch:
jobs:
  unweave:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.LOOM_TOKEN }}
      - name: Unweave
        run: |
          ROWS=$(node loom.js --day $(node day.js) --count-only)
          git push --force origin refs/tags/warp:refs/heads/loom
          echo "Night $(node day.js) — ${ROWS} rows unwoven." >> CHRONICLE.md
          git commit -am "Night $(node day.js)"
          git push origin main
```

Let Claude Code fill in the shell bodies, but hold it to this structure.

## 2.7 Things that will bite you

Read this list before you start; every item costs an hour if you discover it late.

- **Cron in Actions is best-effort.** It gets delayed during peak load, sometimes by 30+ minutes. Never build logic that assumes exact firing times.
- **Cron is UTC.** EDT is UTC−4, EST is UTC−5. Your times will silently shift by an hour in November. Either accept it or handle the offset in code.
- **Scheduled workflows auto-disable after ~60 days of repository inactivity,** and bot commits may not reset that clock. Set yourself a recurring calendar reminder to push something.
- **`github-actions[bot]` commits do not appear on your contribution graph.** If you want the weave/unweave rhythm visible on your profile, create a fine-grained PAT with `contents: write`, store it as `LOOM_TOKEN`, and set `git config user.email` to the address linked to your GitHub account.
- **GitHub proxies README images through camo, which caches them.** The README shroud will lag behind reality by minutes to hours. Nothing you can do; don't burn a day on it. Note it in the README as part of the piece — the shroud is always slightly out of date, which is arguably on theme.
- **Force-pushing a branch is destructive by design here.** Make sure `loom` is not your default branch and is not protected.

## 2.8 README

Embed the live shroud at the top:

```markdown
![The shroud](https://raw.githubusercontent.com/USER/REPO/loom/loom.svg)
```

Then the myth in three sentences. Then the branch design, explained plainly — this is the section people will screenshot. Then a link to `CHRONICLE.md`. Then how to run the generator locally.

---

# PART 3 — SHARED

## 3.1 Legal and asset hygiene

Use no stills, posters, trailer frames, or marketing material from the film — that imagery belongs to Universal. Both projects are designed to need none of it. Homer's text and Butler's translation are public domain if you want epigraphs. Reference the film by name in your writing, which is ordinary commentary, but don't imply endorsement. MIT licence both repos.

## 3.2 Commit hygiene

Conventional commits, real messages. On the Loom, the daily commits are part of the artwork — make them read like Penelope's own log ("Woven: rows 141–168 — the purple band begins"), not "chore: update svg."

## 3.3 The LinkedIn posts

**Cropper.** Lead with the finding, not the build. Comparison image first, then roughly: *Nolan shot The Odyssey entirely with IMAX cameras at 1.43:1. Cropped to standard scope, 40% of the frame is gone — and that number is fixed, no matter what the image is. I built a tool so you can see it happen.* Demo link, then repo link. Do not open with "Excited to share."

**Loom.** This one is a story, so write it as one. Three lines on what Penelope actually did, then the reveal: the shroud lives on a branch and gets destroyed nightly, while `main` keeps the record. Screenshot the commit graph showing the sawtooth. Close on the line that does the work: *the weaving disappears; only the evidence of the deception survives.*

Post them a week apart. The Cropper first — it's the accessible one and it earns you the audience for the Loom.
