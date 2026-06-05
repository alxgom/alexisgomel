# Website Typography & Font Guidelines

This document details the typography system, architectural styling rules, performance optimizations, and zero Cumulative Layout Shift (CLS) configuration for the website.

---

## 1. Typography System Architecture

The website uses a hybrid font system designed to balance modern technical readability (for UI and metadata) with classical long-form reading comfort (for research and writing):

| Font Family | Category | Weights & Styles | Primary Role |
| :--- | :--- | :--- | :--- |
| **Montserrat** | Geometric Sans-Serif | `500` (Medium), `700` (Bold) | Headings, UI components, buttons, navigation, metadata, and short snippets. |
| **Alegreya** | Humanist Serif | `400` (Regular), `400i` (Italic), `700` (Bold) | Long-form editorial prose (blog posts, articles, detailed abstracts). |

---

## 2. Design & Styling Rules

To maintain layout cleanliness and prevent visual clutter, the typography system enforces the following semantic rules:

### A. UI Elements, Controls & Headings (Montserrat / System-UI Sans-Serif)
* **Default Font Stack**: All pages default to the system-ui sans-serif font stack (`--font-family-sans-serif-system`) via the `body` selector for general body paragraphs and descriptions. This ensures native rendering speed and eliminates layout shifts.
* **Headings**: All `h1` through `h6` headings globally use Montserrat (`--font-family-sans-serif`), styled with a heavy bold weight (`font-weight: 700`). This provides strong typographic hierarchy and contrast against the body text.
* **UI Elements & Controls**: Interactive elements (such as buttons, navigation bars, links, tags, and form fields) explicitly use Montserrat (`--font-family-sans-serif`) to maintain a clean, geometric brand identity for interface controls.
  * *CTA Styling*: CTAs use uppercase text (`text-transform: uppercase`), explicit tracking (`letter-spacing: 0.08em`), and smaller size (`0.85rem`–`0.9rem`) to establish a clear structural boundary from prose text.

### B. Editorial Prose (Alegreya)
* **Editorial Wrapper**: Long-form body text is styled with Alegreya by wrapping the article block in the `.prose` or `.blog-wrap` class.
* **Width Constraint (Measure)**: Long paragraphs must be constrained to a fixed **`max-width: 610px`** (or `38.125rem`). 
  * *Critical Rule*: **Never use `ch` units (e.g. `65ch`) for container widths.** Because `ch` represents the width of the active font's "0" glyph, swapping from a system fallback to a custom font alters the container width, resulting in text reflow and vertical Cumulative Layout Shift (CLS).
* **Line Height**: Alegreya’s calligraphic shapes require breathing room. Article text must use `line-height: 1.65`.
* **Font Size**: Standard prose text is styled at `1.05rem` (17px) or `1.1rem` (18px) for reading comfort.
* **Lead Paragraphs**: The first paragraph of a post (using `.prose > p:first-of-type` or `p.lead`) is styled with `font-size: 1.25rem` and `line-height: 1.6` to pull the reader in.

### C. Academic & Scientific Publications (Alegreya)
* **Rule**: Scientific publication and presentation titles in list components (e.g., the BibTeX bibliography template in the CV layout) are styled using Alegreya (`var(--font-family-serif)`).
* **Rationale**: This simulates the traditional serif print look of scientific journals (such as APS, Nature, or arXiv preprints) and keeps a unified look across all academic prose elements. Platform-inconsistent typewriter fonts (like `American Typewriter`) must be avoided.

---

## 3. Performance & Caching Guidelines

To ensure the custom fonts load under 100ms and operate safely on Cloudflare's Free Tier CDN:

1. **Self-Hosting**: All font files are stored locally in `/public/assets/fonts/` as `.woff2` files (the most compressed format). Do not load fonts from external CDNs (like `fonts.googleapis.com`) to avoid extra DNS lookups and connection delays.
2. **Preloading**: Preload tags for the two critical fonts needed for the immediate viewport are placed in `<head>` inside `MainLayout.astro` to initiate fetch before CSS parsing:
   ```html
   <link rel="preload" href="/assets/fonts/alegreya/Alegreya-400.woff2" as="font" type="font/woff2" crossorigin />
   <link rel="preload" href="/assets/fonts/montserrat/Montserrat-700.woff2" as="font" type="font/woff2" crossorigin />
   ```
3. **Indefinite Caching**: Font assets are static files served with immutable caching headers (`Cache-Control: public, max-age=31536000, immutable`). Cloudflare caches them on its edge nodes indefinitely.
4. **Font Display**: All `@font-face` blocks define `font-display: swap` to prevent render-blocking.

---

## 4. Zero CLS Fallback Configurations

To prevent any layout shifting while web fonts load, we override system fallback metrics to match our custom fonts' coordinates down to the pixel:

```css
/* Montserrat fallback (matching Arial/Roboto/Liberation Sans/Arimo) */
@font-face {
  font-family: 'Montserrat-fallback';
  src: local('Arial'), local('Roboto'), local('Liberation Sans'), local('Arimo');
  size-adjust: 113.00%;
  ascent-override: 85.66%;
  descent-override: 22.21%;
  line-gap-override: 0.00%;
}

/* Alegreya fallback using Georgia */
@font-face {
  font-family: 'Alegreya-fallback-georgia';
  src: local('Georgia');
  size-adjust: 90.50%;
  ascent-override: 112.26%;
  descent-override: 38.12%;
  line-gap-override: 0.00%;
}

/* Alegreya fallback using Times New Roman */
@font-face {
  font-family: 'Alegreya-fallback-times';
  src: local('Times New Roman'), local('Times');
  size-adjust: 96.20%;
  ascent-override: 105.61%;
  descent-override: 35.86%;
  line-gap-override: 0.00%;
}
```

*These font stacks are defined inside `/public/assets/css/global.css`.*

---

## 5. Typography To-Do / Future Exploration

- [ ] **Explore a more styled/characteristic heading font**: Investigate pairing the system body sans-serif stack with a more distinctive, stylized brand typeface for headings (e.g. a more expressive sans-serif or a geometric slab-serif) to replace Montserrat and give headings stronger individual character.
