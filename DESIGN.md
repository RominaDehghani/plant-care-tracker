---
name: Bitki Bakım Takipçisi
description: A garden bed you tend, not a dashboard you operate — plants grow from soil in the order you planted them.
colors:
  sky-top: "#fdfbf5"
  sky-bottom: "#f3ead9"
  soil-crust: "#a9714a"
  soil-mid: "#7c4d30"
  soil-deep: "#4f2f1f"
  stem: "#5b3a24"
  card: "#fffaf1"
  card-border: "#e7d9c2"
  foreground: "#3a2f22"
  foreground-soft: "#7a6c58"
  accent: "#2f6b4f"
  accent-strong: "#1f4e39"
  status-ok: "#1f6b4a"
  status-soon: "#a16a1a"
  status-overdue: "#b8452f"
  sky-morning-top: "#a9d6ea"
  sky-morning-mid: "#cdeaf3"
  sky-morning-bottom: "#ffe9c7"
  sky-noon-top: "#7fc4ef"
  sky-noon-mid: "#bfe3f7"
  sky-noon-bottom: "#eef7fb"
  sky-evening-top: "#5b4272"
  sky-evening-mid: "#c96b5a"
  sky-evening-bottom: "#f3ae6e"
  sun-core: "#fff3b0"
  sun-glow: "#fffbe0"
  water: "#0ea5e9"
typography:
  heading:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
---

# Design System: Bitki Bakım Takipçisi

## Overview

**Creative North Star: "The Garden Bed"**

The product is not framed as a dashboard with a plant theme; the page itself is a cross-section of a garden bed. A pale sky sits above a banded soil column, and every plant a visitor has added stands in that soil, oldest at full height on the left, newest as a small seedling toward the open ground on the right. There is no card grid, no generic centered modal: adding a plant means touching bare soil and watching a seed grow into a form, in place, at the point you touched. This system replaces an earlier, explicitly rejected pass that read as a generic AI dashboard (card grid, plain white modal, "bank login" feel) — that look is a confirmed anti-reference, not a stage this system may relapse into.

Density stays low and the composition stays literal: everything the interface shows has a physical reason to be where it is (plants stand in soil, the nav floats like something overhead, a detail card hangs like a garden tag near the plant it describes).

**Key Characteristics:**
- Composition is a literal cross-section (sky above, soil below), not an abstracted layout grid.
- The sky itself is a clock: tapping the sun cycles sabah → öğle → akşam (morning → noon → evening), recoloring the sky gradient and washing the soil with a matching tint — the sun is always present and always the through-line, only its position (top-left quadrant, never drifting toward an edge), color, and glow travel across the day.
- A hanging wooden sign carries the garden's own name (visitor-editable, persisted) — the interface is a place the visitor names, not a generic dashboard title.
- Plants stand at irregular, zigzagging heights and slight random offsets along the row, and are drawn from three different leaf-arrangement templates chosen per plant — a planted bed with variety, not identical icons at different scales.
- Every interactive surface is motivated by the metaphor: tap soil to plant, tap a plant for two small round actions (water, edit) that hover beside it like garden tools left in reach, tap the sign for a one-line status summary.
- Status (needs water / soon / healthy) is carried by the plant's own leaf color first, an icon badge second — never by a bare text label alone.
- An occasional ambient breeze sways every plant (and the sign) together for a couple of seconds — the garden is alive even when the visitor isn't touching it, but nothing animates *perpetually*, so every clickable element stays a reliably stable target.
- Motion always originates from the point the visitor touched, never a generic center-screen pop.

## Colors

Warm and earthbound at the interface layer (cream cards, terracotta-to-umber soil, one committed green accent); the scene's sky is the one deliberately mutable region, cycling through three times of day, plus one dedicated blue reserved only for water.

### Primary
- **Garden Green** (`#2f6b4f`, accent): primary actions — "Sula" (water now), form submit buttons, focus rings, the range-slider fill. Deepens to **Garden Green Deep** (`#1f4e39`, accent-strong) on hover/press, as the "healthy" watering-status color, and as the sign/nav heading color (fixed, not sky-reactive).

### Neutral / Interface
- **Sky Cream** (`#fdfbf5`, sky-top) and **Sky Sand** (`#f3ead9`, sky-bottom): the page's static `<body>` fallback, and — at 80% opacity — the color used for any text sitting on soil (see the No-Gray-On-Soil rule).
- **Soil Crust** (`#a9714a`): the thin lit band directly under the horizon line, and the seed mound's own fill.
- **Soil Mid** (`#7c4d30`): the main soil body, top of the banded gradient.
- **Soil Deep** (`#4f2f1f`): the gradient's floor — soil reads as it goes further from the surface, and doubles as the root linework and fleck-texture ink.
- **Card Cream** (`#fffaf1`, card) with **Card Border** (`#e7d9c2`): every elevated *interface* surface (nav pill, modal, quick-action buttons, form inputs, the garden sign's own plaque) — this layer never changes with time of day; it is chrome, not scene.
- **Bark** (`#3a2f22`, foreground) / **Bark Soft** (`#7a6c58`, foreground-soft): body text on cream surfaces. **Never used for text sitting directly on soil** — see the Contrast rule below.

### Sky (Time of Day)
Three lighting worlds. Each recolors the sky gradient and washes the soil with a matching overlay so the whole scene reads as one moment; the sign's own text stays fixed (`accent-strong`/`foreground-soft`) in every mode since it sits on its own opaque card, never on the sky.
- **Sabah / Morning** — sky `#a9d6ea → #cdeaf3 → #ffe9c7`, soil washed with a faint warm haze `rgba(255,200,120,0.08)`.
- **Öğle / Noon** — sky `#7fc4ef → #bfe3f7 → #eef7fb`, brightest and bluest, no soil wash.
- **Akşam / Evening** — sky `#5b4272 → #c96b5a → #f3ae6e` (violet to ember), soil washed with `rgba(120,40,30,0.18)`.

### Sun
- **Sun Core** (`#fff3b0` at noon, warming to `#ffd98a` morning / `#ff9a5a` evening) with **Sun Glow** (`#fffbe0`/`#ffedbb`/`#ffc79a`): a radiating disc drawn directly in the sky, not an icon standing in for it. Always anchored in the sky's top-left quadrant; only color, glow, and a small vertical drift travel across the three times of day.

### Water
- **Water Blue** (`#0ea5e9`, Tailwind `sky-500`/`sky-600`): reserved *only* for the watering moment — the falling-droplet animation and the quick-action "Sula" button itself. Deliberately the one cool color in an otherwise warm system, so "you just watered this" (or "tap to water") reads as unmistakably water — never reused for the overdue-status droplet badge, which stays `status-overdue` red for urgency, and never used for any other button.

### Status
- **Needs Water** (`#b8452f`, status-overdue), **Soon** (`#a16a1a`, status-soon), **Healthy** (`#1f6b4a`, status-ok): drive a plant's leaf fill and its small icon badge (droplet / triangle / none), and color the "Sıradaki sulama" (next-watering) column in the sign's summary table. Status is never color-only — the icon, and the summary table's day-count text, repeat it in words.

### Named Rules
**The No-Gray-On-Soil Rule.** Any text or icon rendered directly on the soil gradient (plant names, the seed-mound label, its "+" glyph) uses a light token from the Sky/Card family (`sky-bottom`, `card`), never `foreground-soft`. `foreground-soft` was tuned for cream surfaces and drops below 2:1 against soil — this was a real defect caught and fixed during build; do not reintroduce it.
**The Chrome-Never-Times-Out Rule.** The garden sign, modal, and quick-action buttons keep their constant cream/green identity across all three sky modes. Only the scene (sky, sun, soil wash) responds to time of day.
**The Water-Is-Blue Rule.** Blue appears nowhere else in the system — not even as another button's hover state. The moment a visitor sees blue, it means water, action or animation.

## Typography

**Display Font:** Fraunces (serif; with Georgia as system fallback)
**Body Font:** Nunito Sans (with system-ui fallback)

**Character:** Fraunces is warm and slightly organic at display weight — it carries the "grown, not manufactured" feeling into headings and the nav wordmark. Nunito Sans stays a plain, rounded, highly legible workhorse for every functional string (labels, form fields, status text) so the story never costs readability.

### Hierarchy
- **Display** (Fraunces, 600, `text-2xl`–`text-3xl`): the "Bahçen" page title and modal titles ("Toprağa yeni bir tohum ek").
- **Title** (Fraunces, 600, `text-lg`–`text-xl`): plant name in the tag card, nav wordmark.
- **Body** (Nunito Sans, 400, `text-sm`–`text-base`): descriptions, form labels, hint copy.
- **Label** (Nunito Sans, 500, `text-xs`–`text-sm`): plant name-under-stem, status text, button labels.

## Layout

Single-column, centered content up to `max-w-3xl`/`max-w-4xl`, with two structural bands stacked vertically: a sky band (nav + page heading) and a soil band that grows to fill the remaining viewport height so it always reaches the bottom edge — never a floating strip with dead space beneath it. The plant row itself is a horizontally scrolling flex strip (`items-end`, `gap-7`/`gap-9`) so it degrades to a swipeable strip on narrow viewports without changing the composition. The floating nav is a fixed-position pill, independent of document flow, centered at the top on all breakpoints. Modals and the plant-tag popover use `fixed` positioning layered above everything else.

## Elevation & Depth

Hybrid: flat within the scene (soil, sky, and the plant illustrations carry no drop shadow — they're surfaces of the "world," not floating UI), but every elevated *interface* surface (nav pill, modal, tag popover, plant-status badge) uses a soft, warm-toned offset shadow to read as clearly separate from the scene.

### Shadow Vocabulary
- **Nav float** (`0 8px 24px -12px rgba(79,47,31,0.35)`): the floating nav pill's resting shadow.
- **Modal lift** (`0 28px 64px -20px rgba(79,47,31,0.45)`): the add/edit modal — the largest, softest shadow in the system, signaling it's above the whole scene.
- **Tag card lift** (`0 20px 48px -16px rgba(79,47,31,0.4)`): the plant detail popover, one step lighter than the modal.

### Named Rules
**The World-Is-Flat Rule.** Nothing that is part of the garden scene itself (soil, sky, stems, leaves, roots) ever gets a box-shadow. Shadows exist only on interface chrome layered above the scene.

## Shapes

Soft and rounded throughout, scaled to the surface's importance: small controls and status badges are full pills (`rounded-full`), form inputs use a medium radius (`rounded-xl`, 12px), and elevated cards (modal, quick-action buttons) use a larger radius (`rounded-2xl`/`rounded-3xl`, 16–24px) so they read as the most "lifted" shapes in the system. A single small radius (`rounded-xs`, 4px) exists only for the notes field's folded paper corner — never use it elsewhere. Plant illustrations are drawn as crisp geometric bezier shapes (stem curve, almond-shaped leaves, a simple bud circle) — never sketch-style or textured SVG.

## Components

### Buttons
- **Shape:** full pill (`rounded-full`).
- **Primary:** `accent` background, `card` (near-white) text, `accent-strong` on hover — used for "Sula," "Toprağa ek" / "Kaydet."
- **Ghost/Secondary:** transparent background, `foreground-soft` text, a soft `soil-crust`-tinted background on hover — used for "Vazgeç" and icon-only actions (edit, close).
- **Destructive:** `status-overdue` background only after an inline "emin misin?" confirmation step replaces the initial ghost "Sil" button; never a native `confirm()` dialog.

### Cards / Containers
- **Corner Style:** 24px (`rounded-3xl`) for the modal.
- **Background:** `card` (#fffaf1) with a 1px `card-border` (#e7d9c2).
- **Shadow Strategy:** see Elevation & Depth.
- **Internal Padding:** 24–28px (`p-6`/`p-7`).

### Inputs / Fields
- **Text/number style:** `card-border` stroke, translucent white fill, 12px radius (`rounded-xl`). Name and species fields carry a small leading icon (`Sprout`, `Leaf`) inside the field, never as a separate label decoration.
- **Focus:** border shifts to `accent`, plus a soft `accent` ring at low opacity (`focus:ring-2 ring-accent/20`) — no default browser outline.
- **Notes field:** the same input shell, wrapped so its top-right corner shows a small folded-paper triangle (`rounded-xs` shadowed diagonal) — a physical, journal-like detail, not a design-system-wide corner treatment.

### Range Slider (signature control)
Replaces a plain number field for watering interval. A custom-styled `<input type="range">` (0–30 days): `accent`-filled track up to the thumb, `card-border` track beyond it, a white thumb ringed in `accent`. The live value ("7 gün") sits in the label itself, bold in `accent-strong`; "Her gün" / "30 günde bir" caption the two ends so the scale never needs to be inferred.

### Date Picker (signature control)
Replaces the native date input with a small popover calendar (button trigger showing the ISO date + a calendar glyph). Month grid in `card` with `card-border`, Monday-first Turkish weekday initials, today outlined in `accent`, the selected day filled solid `accent`/`card` text. Opens/closes on outside click and Escape, same as every other floating surface in the system.

### Sunlight Picker (signature control)
Replaces the `<select>` for güneş ihtiyacı with three equal-width toggle buttons, each a progressively fuller sun glyph (`SunDim` / `SunMedium` / `Sun`) over its label. The active option gets an `accent` border and a faint `accent/10` fill; inactive options stay on plain `card-border`.

### Garden Sign (signature component — replaces the earlier floating nav)
A wooden-plaque sign hangs from two peg marks touching the very top edge of the viewport — there is no separate nav bar; the sign *is* the persistent chrome. It carries the leaf mark, the visitor's own editable garden name (click text or its pencil to rename, persisted, Enter/Escape/blur to commit), and — on tap of the plaque itself — a summary table of every plant (Bitki / Son sulama / Ekilme / Sıradaki sulama, the last color-coded by urgency and centered independently of the sign's own narrow width). The table is positioned out of document flow (`left-1/2` + `-translate-x-1/2`, never `inset-x-0` inside a narrow positioned ancestor — that combination silently clamped the panel to the sign's own width, a real bug caught during build) so opening it never shifts the sign or the page. The sign only sways when the shared wind gust passes through; it rests at 0 the rest of the time so it stays a reliably clickable target rather than a perpetually moving one.

### Sun (interactive, not just decorative)
The drawn sun described under Colors is also the sky's only control: tapping it advances sabah → öğle → akşam → sabah. It always lives in the sky's top-left quadrant across all three positions — never drifting toward an edge — so it reads as "the sun moved a little," never as sliding out of frame.

### Plant Stem (signature component)
A per-plant geometric SVG: a single curved stem, 2–6 almond-shaped leaves (count and scale driven by the plant's "growth" — its rank by planting order, eased into a 0.4–1.0 range so the oldest plant reads as clearly tallest without towering), a small solid bud circle for the most mature plants, and a thin two-branch root mark dipping into the soil below the same baseline. Leaf fill is always the plant's live watering-status color; the stem itself stays a constant bark brown regardless of status, so status reads as "the plant's condition," never "the plant's material." Each stem carries a small, deterministic (per-plant-id, not re-randomized on render) vertical zigzag and horizontal jitter so the row reads as planted, not laid out on a grid, and its leaves sway on hover as one authored wind gesture.

### Seed Mound (signature component)
The row's trailing element: a small terracotta mound with a dashed light-toned circle and "+" glyph above it, gently bobbing when the garden is empty to draw the first tap. Opens the add-plant modal with its transform-origin anchored to the exact point tapped.

### Plant Quick Actions (signature component)
Tapping a planted stem never opens a card of prose — it surfaces exactly two small round buttons beside the plant: a filled **water-blue** droplet (water now, which also plays a ~1.6s falling-droplet animation on the stem itself — long enough to actually notice, not a flicker) and an outlined pencil (edit). No name, species, or status text repeats here; that detail lives in the edit modal or the sign's summary table. Same anchored-popover mechanics as every other floating surface (clamped to viewport, closes on outside click/Escape).

### Plant Modal (signature component)
Shared by add and edit. Animates in with a spring scale from `transformOrigin` computed from the triggering tap/click point — never a fixed center-scale pop — so it reads as growing out of the soil (add) or out of the quick-actions cluster (edit). Contains the delete action (inline confirm, no native dialog) only in edit mode.

## Do's and Don'ts

### Do:
- **Do** keep every status signal doubled: leaf/badge color plus an icon or text label, never color alone.
- **Do** anchor every modal's entrance `transformOrigin` to the element the visitor actually touched.
- **Do** use `sky-bottom`/`card` for any text or icon sitting directly on the soil gradient.
- **Do** let the soil band's gradient (`soil-crust` → `soil-mid` → `soil-deep`) carry depth; don't flatten it back to one solid fill.
- **Do** keep the sign, modal, and quick-action chrome visually constant across all three sky modes — only the scene itself (sky, sun, soil wash) responds to time of day.
- **Do** keep tap-a-plant down to two round icon actions; push any descriptive detail into the modal or the sign's summary table instead of growing the popover back into a card.
- **Do** center an out-of-flow overlay with `left-1/2` + `-translate-x-1/2` (or a portal), never `inset-x-0` inside a narrow `position: relative` ancestor — the latter silently clamps the overlay's width to that ancestor's, no matter what width class you give the overlay itself.

### Don't:
- **Don't** reintroduce a centered white card-grid layout or a plain, non-anchored centered modal — that is the system's confirmed anti-reference.
- **Don't** use emoji for status or action icons; use the drawn `lucide-react` icon set already in use.
- **Don't** draw plant illustrations as sketch-style or textured SVG; keep them crisp geometric shapes.
- **Don't** use `foreground-soft` (or any cream-tuned gray) for text on the soil background.
- **Don't** give any element a perpetual (non-hover, non-event-triggered) idle animation loop — it can never be a reliably clickable target. Tie ambient motion to a real event (the shared wind gust, a hover, a click) instead.
- **Don't** re-randomize a plant's zigzag/jitter offset on every render — it must stay derived from the plant's own id so the bed doesn't visibly shuffle.
