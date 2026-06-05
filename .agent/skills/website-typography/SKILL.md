---
name: website-typography
description: "Guidelines and rules for the website's typography system. Use this skill when modifying text styling, adding pages, writing blog posts, or checking layouts to ensure aesthetic consistency and zero Cumulative Layout Shift (CLS)."
---

# Website Typography Guidelines & Skill

This skill enforces the hybrid typography system designed for the website, balancing clean modern UI styling with polished scholarly/editorial reading comfort. It also dictates performance and layout stability configurations to guarantee exactly **0px Cumulative Layout Shift (CLS)**.

---

## 1. Typography Hierarchy & Font Roles

The typography system consists of two primary font families served locally via compressed WOFF2 format:

| Font Family | Base Type | Applied Weight(s) | Usage Scope |
| :--- | :--- | :--- | :--- |
| **Montserrat** | Geometric Sans-Serif | `500` (Medium), `700` (Bold) | Headings (`h1`–`h6`), menus, buttons, forms, metadata labels, short cards/snippets, and general UI controls. |
| **Alegreya** | Humanist Serif | `400` (Regular/Italic), `700` (Bold) | Long-form reading columns, blog post body text, research abstracts, and editorial prose. |

---

## 2. Design System Styling Rules

### A. General UI & Default State
* **Inherited Baseline**: All pages default to Montserrat (`--font-family-sans-serif`) via the `body` selector.
* **UI Text blocks**: Short descriptions in cards, sidebars, alerts, and navigation lists must use Montserrat. Serifs should not be used in narrow columns or UI lists to avoid clutter.
* **CTAs & Buttons**: All interactive elements (links, buttons, badge components) use Montserrat. Button labels use uppercase text (`text-transform: uppercase`), small font sizes (`0.85rem`–`0.9rem`), and explicit tracking (`letter-spacing: 0.08em`).

### B. Editorial Prose (Serif Content)
* **Scope**: Long-form editorial text (e.g. blog posts, research abstracts) must be wrapped in a `.prose` or `.blog-wrap` container.
* **Width Measure Rule**: Long paragraphs must be constrained to a fixed **`max-width: 610px`** (or `38.125rem`). 
  * *Critical Constraint*: **Never use `ch` units (e.g., `max-width: 65ch`)** for paragraph containers. Swapping from fallback fonts (like Georgia) to custom fonts changes the width of the `0` glyph, which results in word reflows and vertical Cumulative Layout Shift (CLS).
* **Line Height**: Serif body text requires a line height of **`1.65`** to prevent calligraphic overlap and eye strain.
* **Font Size**: Standard article body text should be sized at `1.05rem` (17px) or `1.1rem` (18px).
* **Lead Paragraphs**: The first paragraph of a post uses `.prose > p:first-of-type` or `p.lead` styled with `font-size: 1.25rem` and `line-height: 1.6`.

### C. Academic & Scientific Publications (Serif)
* **Rule**: Scientific publication and presentation titles (such as the BibTeX templates in the CV online layouts) must use Alegreya (`var(--font-family-serif)`).
* **Rationale**: This preserves the traditional serif look of academic journals and print preprints, while maintaining styling consistency across all academic elements of the website. Hardcoded typewriter fonts (like `American Typewriter`) must be avoided due to inconsistent cross-platform rendering.

---

## 3. Font Loading & Performance Rules

1. **Self-Hosting**: All font assets must be hosted locally under `/public/assets/fonts/` in `.woff2` format to bypass connection latency and DNS lookup overhead on external servers.
2. **Critical Preloading**: Preload tags for the primary fonts in the initial viewport (`Alegreya-400.woff2` and `Montserrat-700.woff2`) must be declared in [MainLayout.astro](file:///c:/DEV/alexisgomel-1/src/layouts/MainLayout.astro):
   ```html
   <link rel="preload" href="/assets/fonts/alegreya/Alegreya-400.woff2" as="font" type="font/woff2" crossorigin />
   <link rel="preload" href="/assets/fonts/montserrat/Montserrat-700.woff2" as="font" type="font/woff2" crossorigin />
   ```
3. **Indefinite Cache Control**: Font assets must carry `immutable` cache headers (`Cache-Control: public, max-age=31536000, immutable`) for edge caching.
4. **Font Display**: All `@font-face` rules must use `font-display: swap` to ensure text renders immediately with fallbacks while custom fonts download.

---

## 4. Zero-CLS Metric Overrides

To match fallback system fonts to the precise geometric proportions of our custom fonts, we override system metrics in [global.css](file:///c:/DEV/alexisgomel-1/public/assets/css/global.css):

### Montserrat Fallbacks (Arial/Roboto/Liberation Sans/Arimo base)
* `font-family: 'Montserrat-fallback'`
* `size-adjust: 113.00%`
* `ascent-override: 85.66%`
* `descent-override: 22.21%`
* `line-gap-override: 0.00%`

### Alegreya Fallbacks
#### Georgia Base
* `font-family: 'Alegreya-fallback-georgia'`
* `size-adjust: 90.50%`
* `ascent-override: 112.26%`
* `descent-override: 38.12%`
* `line-gap-override: 0.00%`

#### Times New Roman / Times Base
* `font-family: 'Alegreya-fallback-times'`
* `size-adjust: 96.20%`
* `ascent-override: 105.61%`
* `descent-override: 35.86%`
* `line-gap-override: 0.00%`

---

## 5. Review Checklist for Font Integration
- [ ] Do all text elements default to Montserrat (`--font-family-sans-serif`) unless specifically wrapping long-form articles?
- [ ] Are article/prose blocks wrapped in `.prose` or `.blog-wrap` with a fixed pixel/rem maximum width (e.g. `610px` or `38.125rem`) rather than `ch` units?
- [ ] Are custom serif columns styled with a `line-height: 1.65`?
- [ ] Are sitemap generation configurations updated to ignore test pages?
- [ ] Are critical fonts preloaded inside the head slot of the parent layout?
- [ ] Are font assets stored locally as `.woff2` files?
