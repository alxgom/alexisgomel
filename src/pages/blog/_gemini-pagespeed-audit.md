# I asked Gemini 3.1 Pro to audit my website's performance — while looking at a live dashboard

Last Thursday, Google released Gemini 3.1 Pro through Antigravity, the AI coding assistant I've been using to build this website over the past year. I was curious about one specific capability upgrade: could it actually _see_ and _reason_ about data in a live, interactive web report?

So I ran a small experiment.

## The setup

I built a custom analytics pipeline for my personal website using GA4, BigQuery, and Looker Studio. Part of that pipeline includes a daily PageSpeed audit: a threaded Python Cloud Function reads my sitemap, calls the PageSpeed Insights API 7 times per page, and stores the results in BigQuery. Because PageSpeed scores have a natural spread (especially on the Performance metric), the dashboard shows the **median** of those 7 runs to get a more stable reading.

The dashboard is public — you can explore it at [alexisgomel.com/projects/webanalytics/](/projects/webanalytics/).

I wanted to see if Gemini 3.1 Pro could navigate to the PageSpeed section of that report, read the interactive charts, and produce a meaningful technical audit — all without me interpreting the data for it.

## The session

I simply pointed it at the dashboard URL and told it to find the PageSpeed section and analyze the report.

The first thing it did was navigate correctly to the "Page speed" tab and open the "Current state" view.

_[Screenshot: Navigating to Page Speed → Current state]_

Then things got interesting. The dashboard has a date range filter, and without being asked, the AI opened it and started modifying it — apparently trying to be thorough. It typed "028" into the date offset field, briefly pulling the filter back 28 days instead of staying on today's data.

_[Screenshot: The 028-days date picker incident]_

This is something I've noticed with Gemini compared to Claude: it tends to expand or modify the scope of a task without checking in first. Here, it self-corrected after I nudged it to focus on today only — but it's worth noting. A more "partnership-first" assistant would've asked before touching the filters.

_[Screenshot: Date correctly set to 22 feb 2026 – 22 feb 2026]_

Once filtered to 22/02/2026, it scrolled through the performance charts — including the interactive, scrollable breakdown table — and hovered over data points to read exact values.

_[Screenshot: Performance breakdown table with metric columns]_

## Comparison with Gemini 3.0

I had tried a similar experiment with Gemini 3.0 and it didn't go well. It would get stuck in loops trying to take screenshots, lose track of where it was in the report, or give up navigating the interactive elements. It couldn't reliably read data from the scrollable table at all.

3.1 Pro handled the navigation solidly. The date incident aside, it found the right sections, scrolled the charts, and read specific metric values out of the table correctly.

## What it found

From reading the dashboard, Gemini 3.1 identified four key performance patterns:

1. **TBT (Total Blocking Time) is critically broken** on pages embedding third-party iframes — specifically `/projects/webanalytics/` (Looker Studio embed) and `/playlists/` (10+ Spotify iframes). Both score 0/1 on TBT for both mobile and desktop.

2. **Speed Index tanks** on the same pages — near 0 — meaning users stare at a blank screen for too long even though the page eventually loads.

3. **Mobile LCP breaks on `/projects/`** — the listing page scores a perfect 100 on desktop, but the LCP metric drops to 0.22 on mobile. This is a specific, isolated anomaly worth investigating.

4. **The Spanish `/es/` pages** showed the worst overall mobile scores, including an LCP of just 0.01 on `/es/projects/`. The AI hypothesized this could be a localization framework adding render-blocking scripts.

## Then it checked the code

After the audit, I asked it to verify its hypotheses against the actual codebase. This is where the "multimodal + reasoning" loop gets interesting.

- **TBT hypothesis: ✅ Confirmed.** The webanalytics page embeds a Looker Studio iframe with no `loading="lazy"` — it fires immediately on page load, blocking the main thread.
- **Speed Index hypothesis: ✅ Confirmed.** There's a loading spinner, but the iframe itself still requests immediately underneath it — defeating the purpose.
- **Mobile LCP hypothesis: ✅ Confirmed (partially).** The hero images on the projects page use `fetchpriority="high"` but no `srcset` — serving full desktop-resolution assets to mobile.
- **Spanish localization hypothesis: ❌ Refuted.** The `/es/` pages are physically separate Astro files with identical structure to the English counterparts — no extra payload. The extreme metric values were likely measurement noise on the specific crawl.

It also implemented the fixes on the spot: adding `loading="lazy"` to the Looker Studio iframe and responsive `widths`/`sizes` attributes to the hero images.

## The audit

Below is the full technical audit it produced, as generated, followed by the code verification notes.

---

_[AUDIT EMBED PLACEHOLDER]_

---

## Digging Deeper: The Range Behind the Median

The Looker Studio dashboard shows the _median_ of 7 daily test runs per page. But to really understand what's happening, we need to look at the full distribution. I ran a local Python script against the raw data in BigQuery to plot the actual spread of the Performance Score and TBT metrics for both days.

_[Screenshot: Feb 22 Performance distributions]_
_[Screenshot: Feb 23 Performance distributions]_

Looking at the TBT specifically, the boxplots show exactly why the native lazy loading attempt failed to move the needle: the main thread isn't just blocked, it's blocked _consistently_ for thousands of milliseconds across every single run, cementing the need for a true Facade approach.

_[Screenshot: Feb 22 TBT distributions]_
_[Screenshot: Feb 23 TBT distributions]_

## Reflections

This experiment worked better than I expected for a first try, and it represents a workflow I hadn't really used before: ask the AI to look at a _live_ report, form its own interpretation, then check it against the code, and finally validate those assumptions against the raw data distributions.

The distribution plots revealed three things that the median scores masked:

- **The Astro foundation is rock solid:** The lightweight pages (like `/sac/` or this very blog post) clustered tightly around 90-100. The performance bleed is 100% isolated to the third-party embeds.
- **The "/es/ ghost" was just noise:** Yesterday's Looker Studio audit flagged the Spanish home page for a catastrophic mobile score of 39. The distribution on Feb 22 showed massive, sloppy variance. But on Feb 23? That variance vanished, and the score clustered tightly at 85. This validated our code-check: there was no heavy localization framework ruinous to performance. We were chasing a ghost born from network jitter during a synthetic crawl.
- **The variance simply shifted:** On the 22nd, `/sevilla/` was the unstable outlier. On the 23rd, it stabilized and `/playlists/` became wildly unpredictable.

The ultimate takeaway? Hunting performance bugs using a single day's median score is a trap. The dashboard alerted me to the problem, but only by looking at the _distributions_ across multiple days do you see the truth: the framework is stable, but third-party embeds introduce massive, unpredictable latency spikes that cannot be tamed by native `loading="lazy"` tags.

The date mishap is a good reminder that these models are still eager to act rather than ask. For exploratory, low-stakes tasks that's mostly fine. For anything involving production data or deployment, you'd want clearer guardrails or more explicit prompting about scope boundaries.

But as a "read the dashboard, find the bugs" shortcut? For someone who already built the instrumentation and knows the codebase? Surprisingly useful. The next step is clear: time to build those Facades.
