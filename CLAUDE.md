# Claude Code Project Instructions

## Overview

This project uses Claude Code with MCP (Model Context Protocol) servers to build data-driven pre-proposal briefs and SEO audits for marketing agencies.

## Available Commands

Run these commands in Claude Code:

- `/build-brief` - Interactive pre-proposal brief builder with competitive analysis
- `/auto-brief` - Headless brief builder for automated workflows (n8n, Make, subagents)
- `/seo-audit` - Comprehensive SEO audit report generator
- `/generate-proposal` - Full proposal generator from contract + website + call transcript

## Template Design System

**IMPORTANT**: All briefs MUST have CSS **fully inlined** in a `<style>` block. Never use the external `scorpion-digital-footprint.netlify.app` stylesheet — it does not render correctly.

### Default — Scorpion Brand System v4

Pulled from scorpion.co's published stylesheet (May 2026). Three core colors: pure black canvas, one bright blue (`#007FFD`) for action, one pale ice-blue (`#B2D6FF`) for the "second line" of every headline. **No gradients, no glass, no secondary accents — discipline reads as authority.**

- **Source CSS file**: `.claude/context/scorpion-brand-system-v4.css` — copy entire contents into a `<style>` block in `<head>`.
- **Fonts**: Outfit (display) + Host Grotesk (body), loaded from Google Fonts. Inter is fallback only.
- **JS libraries**: Chart.js, GSAP 3.12+, GSAP ScrollTrigger — CDN in `<script>` tags.
- **Logo**: Local `scorpion-logo.png` in the brief folder (copy from another brief). Never use the CDN URL.
- **Screenshot**: `https://api.scorpion.co/platform/sitescreenshots/v1/api/screenshot/take/[domain].png` (CDN-hosted screenshot is fine)
- **Background**: Pure `#000000` with a single subtle radial wash (`.gradient-orb-1` only — no multi-orb mesh).
- **Cards**: Solid `#0a0a0a` bg with `#1a1a1a` borders. Flat plates, not glass.
- **Headline pattern**: Two-line — `.section-title-strong` (white fact) + `.section-title-soft` (ice-blue consequence).
- **Nav**: Floating centered pill nav with `--bg-card` background + separate mobile header with horizontal scrolling nav items.
- **Hero trust strip**: `.hero-trust` row under hero (Google Premier Partner, Meta Business Partner, Microsoft Advertising).
- **Live recency pill**: Floating `.live-recency` indicator showing "captured N hours ago".

**Dropped from v3 (never use in v4)**: magenta `--accent-secondary`, cyan, orange, lime, conic-gradient rotating borders, multi-color section dividers, multi-orb gradient mesh.

### v4-Only Section Types

Use these section components when data supports them — they have no v3 equivalent:
- **AI Engine Showdown** — ChatGPT/Gemini citation analysis with verdict pills
- **Brand SERP Audit** — Branded SERP screenshot + competitor poaching of brand keywords
- **Money Left ($ forgone)** — Big-figure forensics of missed-search revenue
- **SERP Screenshot Wall** — Annotated SERP captures with red/yellow/green/blue overlays
- **Local Pack Map** — Per-geo absence-vs-in-pack verdict cards
- **Copy Forensics** — Homepage word-count + CTA/credential/phone/urgency marks
- **Paid Spend Audit** — Ad detection with velocity + blind-spot callouts
- **Ad Gallery** — Live ad creatives grid
- **Annotated Screenshot** — Inline screenshot with callout boxes
- **Synthetic SERP block** — Reconstructed SERP rows when no screenshot is available
- **Proof Badges** — Source-data links (DataForSEO, GBP, raw markdown)

### Section Order (Scorpion v4)

The v4 sections sequence based on data — not every section appears in every brief. Typical full order:

1. **Hero** — `hero-badge` (city/practice) + `hero-title` + optional `.hero-title-soft` + `hero-subtitle` (one-sentence data story) + `hero-date` + browser-mockup + `hero-trust` strip + `hero-scroll-cue`
2. **Executive Overview** (`#overview`) — Two-line `section-title-strong/-soft` + metric-grid (3-4 cards with `.success/.warning/.danger`)
3. **AI Engine Showdown** (`#ai-engine-showdown`) — ChatGPT/Gemini verbatim answer cards with verdict pills
4. **Brand SERP Audit** (`#brand-serp-audit`) — Branded SERP screenshot + competitor poaching rows
5. **Competitive Landscape** (`#competitors`) — competitor-table with `.highlight-row` + gap-chart
6. **Search Visibility / Keywords** (`#keywords`) — keyword table + insights-grid + position distribution
7. **Money Left** (`#money-left`) — Big `money-left-figure` + math rows showing $ being forgone
8. **Traffic Trend** (`#trends`) — SVG polyline + proof-stats + why-matters callout
9. **SERP Screenshot Wall** (`#serp-screenshot-wall`) — `serp-wall-card` grid with annotated overlays
10. **Local Pack Map** (`#local-pack-map`) — Per-geo `local-pack-map-card` with pin verdicts
11. **Reputation / Reviews** (`#footprint`) — metric-grid + photo grid + sentiment + testimonials
12. **Technical Health** (`#technical`) — Lighthouse metrics + Core Web Vitals + issues list
13. **Paid Spend Audit** (`#paid-spend-audit`) — paid-audit-grid with velocity + ad gallery
14. **What's Missing** (`#whats-missing`) — Red ✗ cards for failing signals
15. **Concerns** (`#concerns`) — concern-card blocks — **only if discovery notes provided, else OMIT**
16. **The Fix / Action Plan** (`#opportunities`) — opportunity-grid (3-col) with numbered cards
17. **CTA Banner** — `cta-banner` + `cta-banner-btn` + rep-card
18. **Footer**

### Key Class Names (Scorpion v4)

Inherited from v3 (still used):
- `.nav`, `.nav-logo`, `.nav-items`, `.nav-item`, `.nav-cta`, `.mobile-header`, `.mobile-nav`, `.mobile-nav-item`
- `.hero`, `.hero-badge`, `.hero-title`, `.hero-subtitle`, `.hero-date`, `.browser-mockup`, `.browser-bar`, `.browser-url`, `.browser-screenshot`
- `.section`, `.section-header`, `.section-badge`, `.section-title`, `.section-subtitle`
- `.metric-grid`, `.metric-card` (`.success/.warning/.danger` variants), `.metric-value`, `.metric-label`, `.metric-comparison`
- `.bento-card`, `.two-col`, `.callout` (`.danger/.info` variants), `.quote-card`, `.badge-pill`
- `.competitor-table` with `.highlight-row`, `.competitor-name`, `.competitor-avatar` (+ `.you` / `-img` / `-thumb`)
- `.gap-chart`, `.gap-row`, `.gap-bar[data-percent]`, `.gap-bar-fill.behind/.ahead`, `.gap-values`, `.gap-delta`, `.gap-alert-critical/-high/-medium`
- `.insights-grid`, `.insight-card`, `.insight-icon.success/.warning/.danger`
- `.why-matters`, `.why-matters-icon`, `.why-matters-label`, `.why-matters-title`, `.why-matters-text`
- `.proof-stats`, `.proof-stat`
- `.serp-grid`, `.serp-card` (`.success/.warning/.danger` variants), `.serp-card-keyword`, `.serp-card-status`
- `.concern-card`, `.concern-quote`, `.concern-answer`
- `.opportunity-grid`, `.opportunity-card`, `.opportunity-number`, `.opportunity-icon`, `.opportunity-subtitle`, `.opportunity-title`, `.opportunity-text`, `.opportunity-impact`
- `.cta-banner`, `.cta-banner-inner`, `.cta-banner-btn`, `.cta-banner-subtext`
- `.check-list`, `.footer`, `.footer-logo`, `.footer-text`

New in v4:
- `.section-title-strong`, `.section-title-soft`, `.hero-title-soft` — two-line headline pattern
- `.hero-trust`, `.hero-trust-label`, `.hero-trust-item`, `.hero-scroll-cue`
- `.live-recency`, `.live-recency-dot`, `.live-recency-label`, `.live-recency-relative`, `.live-recency-sep`
- `.ai-showdown-deck`, `.ai-showdown-card`, `.ai-showdown-card-engine`, `.ai-showdown-card-verdict-mentioned/-missing/-untested`, `.ai-showdown-card-answer`, `.ai-showdown-citation`
- `.ai-hero`, `.ai-hero-ring`, `.ai-hero-ring-fill`, `.ai-hero-ring-number`, `.ai-hero-verdict`, `.ai-hero-fraction`, `.ai-engine-grid`, `.ai-engine-card`, `.ai-engine-status-pill`, `.ai-paradigm-callout`, `.ai-query-card`, `.ai-competitor-card`
- `.brand-serp-results`, `.brand-serp-result-owned/-hostile`, `.brand-serp-result-title/-url/-tag`, `.brand-serp-screenshot`, `.brand-serp-render-wrap`, `.brand-serp-proof`
- `.branded-poaching`, `.branded-poaching-row`, `.branded-poaching-keyword`, `.branded-poaching-competitor`, `.branded-poaching-spend`
- `.money-left`, `.money-left-figure`, `.money-left-figure-suffix`, `.money-left-caption`, `.money-left-eyebrow`, `.money-left-math`, `.money-left-row`, `.money-left-row-formula`, `.money-left-row-source`, `.money-left-total`
- `.serp-wall`, `.serp-wall-card`, `.serp-wall-card-box-red/-yellow/-green/-blue`, `.serp-wall-card-overlay`, `.serp-wall-card-thumb`, `.serp-wall-card-verdict-success/-warning/-danger/-neutral`, `.serp-wall-card-render`
- `.local-pack-map-stack`, `.local-pack-map-card`, `.local-pack-map-card-pin`, `.local-pack-map-card-pin-client`, `.local-pack-map-card-pin-marker`, `.local-pack-map-card-verdict-absent/-in-pack`, `.local-pack-map-photos-grid`, `.local-pack-map-photo`
- `.copy-forensics`, `.copy-forensics-stats`, `.copy-forensics-stat`, `.copy-forensics-exemplars`, `.copy-forensics-exemplar-strong/-weak/-empty`, `.copy-mark-cta/-phone/-credential/-urgency`
- `.paid-audit-grid`, `.paid-audit-card`, `.paid-audit-card-callout`, `.paid-audit-card-callout-blind`, `.paid-audit-list-row`, `.paid-audit-velocity-row`, `.paid-audit-velocity-row-prospect`
- `.ad-gallery`, `.ad-gallery-grid`, `.ad-card`, `.ad-card-platform`, `.ad-card-headline`, `.ad-card-body`, `.ad-card-cta`, `.ad-card-image`, `.ad-card-meta`, `.ad-card-advertiser-client`
- `.annotated-screenshot`, `.annotated-screenshot-box-red/-yellow/-green/-blue`, `.annotated-screenshot-label`, `.annotated-screenshot-overlay`
- `.syn-serp`, `.syn-serp-bar`, `.syn-serp-block-ads/-lsa/-localpack/-organic/-paa/-snippet`, `.syn-serp-result-you`, `.syn-serp-lsa-client`, `.syn-serp-ad-client`, `.syn-serp-tag-red/-yellow/-green`
- `.proof-badge`, `.proof-badge-link`, `.proof-badge-md`, `.proof-badge-raw`, `.proof-badge-screenshot`, `.proof-badge-icon`
- `.flow-diagram`, `.flow-step`, `.flow-step-icon`, `.flow-step-label`, `.flow-arrow`
- `.evidence-modal`, `.evidence-modal-backdrop`, `.evidence-modal-image`, `.evidence-modal-annotations`, `.evidence-modal-eyebrow`, `.evidence-modal-caption`, `.evidence-modal-cta`
- `.prospect-photo-grid`, `.prospect-photo-card`, `.prospect-photo-img`, `.prospect-photo-meta`

### v3 J&T Design (LEGACY FALLBACK)

Use only when the user explicitly asks for the v3 J&T style (e.g. "build this in the J&T style", "match steve-huff-brief").
- **Reference briefs**: `steve-huff-brief/`, `meriwether-tharp-brief/`, `advance-mechanical-brief/`
- **Font**: Inter
- **Background**: `#0a0a14` with 3-orb gradient mesh (accent, magenta, cyan)
- **Cards**: `#1a1838` with colored borders
- **Primary accent**: `#007FFD` · **Secondary accent**: `#6D5AFF`

#### Section Order (J&T v3)
1. Hero (badge + title + subtitle + date + browser mockup)
2. Executive Overview (`#overview`) — metric-grid + callout + optional quote-card
3. Competitive Landscape (`#competitors`) — competitor-table with highlight-row + gap-chart
4. Search Visibility / Keywords (`#keywords`) — keyword table + insights-grid
5. Traffic Trend (`#trend`) — SVG polyline chart + proof-stats + why-matters
6. Live SERP Snapshot (`#serp`) — serp-grid cards (you/absent/lsa variants)
7. Reviews / Reputation (`#reviews`) — metric-grid + two-col bento-cards
8. Technical Health (`#technical`) — Lighthouse metric-grid + insights-grid
9. What's Missing (`#missing`) — two-col bento-cards with red borders
10. Concerns (`#concerns`) — concern-card blocks — **only if discovery notes provided, else OMIT**
11. The Fix / Action Plan (`#opportunities`) — opportunity-grid (3-col) with numbered opportunity-cards
12. Bottom Line — why-matters block
13. CTA Banner — cta-banner + cta-banner-btn + optional rep-card
14. Footer

#### Key Class Names (J&T v3 — legacy only)
- `.nav`, `.nav-logo`, `.nav-items`, `.nav-item`, `.nav-cta`, `.mobile-header`, `.mobile-nav`, `.mobile-nav-item`
- `.hero`, `.hero-badge`, `.hero-title`, `.hero-subtitle`, `.hero-date`, `.browser-mockup`, `.browser-bar`, `.browser-url`
- `.section`, `.section-header`, `.section-badge`, `.section-title`, `.section-subtitle`
- `.metric-grid`, `.metric-card` (`.success/.warning/.danger` variants), `.metric-value`, `.metric-label`, `.metric-comparison`
- `.bento-card`, `.two-col`, `.callout` (`.danger/.info` variants), `.quote-card`
- `.badge-pill` (`.success/.warning/.danger/.info`)
- `.competitor-table` with `.highlight-row`, `.competitor-name`, `.competitor-avatar.you`
- `.gap-chart`, `.gap-row`, `.gap-bar[data-percent]`, `.gap-bar-fill.behind/.ahead`, `.gap-values`, `.gap-delta`
- `.chart-card`, `.chart-header`, `.chart-title`, `.chart-container`
- `.insights-grid`, `.insight-card`, `.insight-card-header`, `.insight-icon.success/.warning/.danger`
- `.why-matters`, `.why-matters-icon`, `.why-matters-label`, `.why-matters-title`, `.why-matters-text`
- `.proof-stats`, `.proof-stat`
- `.serp-grid`, `.serp-card` (`.you/.absent/.lsa` variants), `.serp-card-badge`
- `.concern-card`, `.concern-quote`, `.concern-answer`
- `.opportunity-grid`, `.opportunity-card`, `.opportunity-number`, `.opportunity-icon`, `.opportunity-subtitle`, `.opportunity-title`, `.opportunity-text`, `.opportunity-impact`
- `.cta-banner`, `.cta-banner-inner`, `.cta-banner-btn`, `.rep-card`, `.rep-avatar`, `.rep-name`, `.rep-title`
- `.check-list`, `.footer`, `.footer-logo`, `.footer-text`

### Deprecated — DO NOT USE
- `kersh-law-brief`, `sub-zero-heating-air-brief` — old designs
- `example-brief.html` (with `--bg-primary: #0B345E`) — old design
- Any brief using v2 classes: `.glass-card`, `.stat-card`, `.section-label`, `.bento-grid`, `.solution-card`, `.comp-table`, `.kw-table`, sticky `<nav>`
- The **external `scorpion-digital-footprint.netlify.app` stylesheet** — confirmed to render incorrectly; always inline instead

### Design Tokens (Scorpion v4 — DEFAULT)
```css
:root {
    --bg-primary: #000000;
    --bg-secondary: #060608;
    --bg-tertiary: #0e0e10;
    --bg-card: #0a0a0a;
    --glass-bg: #0a0a0a;
    --glass-border: #1a1a1a;
    --glass-highlight: #222222;
    --accent: #007FFD;
    --accent-light: #4DA3FD;
    --accent-soft: #B2D6FF;   /* line-2 / ice-blue */
    --success: #23BF57;
    --warning: #fbbf24;
    --danger: #f87171;
    --text-primary: #FFFFFF;
    --text-secondary: #BCBEC7;
    --text-tertiary: #71717a;
    --font: 'Host Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-display: 'Outfit', 'Host Grotesk', 'Inter', -apple-system, sans-serif;
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```
Full CSS lives at `.claude/context/scorpion-brand-system-v4.css` — copy entire file into each brief's `<style>` block.

### Design CSS Variables (v3 — legacy only)
```css
:root {
    --bg-primary: #0a0a14;
    --bg-secondary: #0e0e1a;
    --bg-tertiary: #151231;
    --bg-card: #1a1838;
    --glass-bg: rgba(255,255,255,0.02);
    --glass-border: rgba(255,255,255,0.06);
    --glass-highlight: rgba(255,255,255,0.08);
    --accent: #007FFD;
    --accent-light: #4da3fd;
    --accent-secondary: #6D5AFF;
    --accent-gradient: linear-gradient(135deg, #007FFD, #6D5AFF);
    --cyan: #22d3ee;
    --magenta: #6D5AFF;
    --orange: #fb923c;
    --lime: #a3e635;
    --success: #34d399;
    --warning: #fbbf24;
    --danger: #f87171;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --text-tertiary: #71717a;
    --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Brief Rules

1. **Investment section only with contract data** — If a contract URL is provided, include pricing from the contract. If not, omit the Investment section. Never invent pricing.
2. **Concerns section only with discovery notes** — If call notes/transcript are provided, include objection handling. If not, omit the section.
3. **Narrative-first** — Lead with business diagnosis, not a marketing audit.
4. **Verify claims** — All ranking claims verified with `mcp__dataforseo__serp_organic_live_advanced`.
5. **Never fabricate** — If data is unavailable, say "Data unavailable".
6. **Video embeds** — Use home services videos for trades, legal videos for law firms. See `reference_scorpion_videos.md`.

## Apify Actor Rules

**IMPORTANT: Never use Apify actors that cost more than $1.00 per result.**

### Approved Actors ONLY

When running Apify scrapers, use ONLY these pre-approved actors. Do not search for alternatives or use any other actors.

| Data Type | Actor | Price | Success Rate |
|-----------|-------|-------|--------------|
| **Google Ads** | `ivanvs/google-ads-scraper` | $0.0025/result | 100% |
| **Instagram** | `apify/instagram-profile-scraper` | $0.0026/profile | 99.9% |
| **Facebook Ads** | `curious_coder/facebook-ads-library-scraper` | $0.00075/ad | 99.8% |
| **Facebook Posts** | `danek/facebook-pages-posts-ppe` | $0.003/post | 99.2% |
| **YouTube** | `streamers/youtube-channel-scraper` | $0.0013/video | 99.9% |
| **Google Reviews** | `delicious_zebu/google-maps-store-review-scraper` | $0.0004/review | 88% |
| **Yelp Reviews** | `web_wanderer/yelp-reviews-scraper` | $0.0003/review | 99.1% |

### Blocked Actors (DO NOT USE)

- `amernas/google-ads-analyzer` - $5.00/result (OCR mode is expensive)
- Any actor over $0.10/result without explicit user approval

### Usage Rules

1. **Never search for alternative actors** - Use only the approved list above
2. **Never skip step="info"** - Always check schema before calling
3. **Set reasonable limits** - Default to 10-20 results max per scrape
4. **Report failures** - If an approved actor fails, note it and continue without searching for alternatives

## API Usage Guidelines

### DataForSEO
- Use for domain analysis, keyword research, backlink data, and SERP analysis
- Modules enabled: SERP, KEYWORDS_DATA, ONPAGE, DATAFORSEO_LABS, BACKLINKS, BUSINESS_DATA, DOMAIN_ANALYTICS
- Always specify `location_name: "United States"` and `language_code: "en"` for US-focused analysis
- Historical rank overview returns ~6 months of data, not 12
- Backlinks API may require separate subscription

### Bright Data
- Use for scraping websites when you need full page content
- `scrape_as_markdown` - Single page scraping
- `scrape_batch` - Multiple pages at once (max 10)

### Chart Generation
- Use `@antv/mcp-server-chart` for generating charts in briefs
- Supports line, bar, pie, radar, and more

## Output Structure

Generated briefs follow this structure:
```
[client-name]-brief/
├── research/           # JSON data files
│   ├── client-info.json
│   ├── domain-data.json
│   ├── traffic-history.json
│   ├── backlink-data.json
│   ├── ads-data.json
│   └── social-data.json
├── screenshots/        # SERP and ad screenshots
├── scorpion-logo.png   # Template asset
└── index.html          # The final brief
```

## Headless/Subagent Mode

When running via `/auto-brief` or as a subagent:
- NO interactive prompts — never pause for input
- Run all research in parallel using Agent/Task tools
- Output JSON status to stdout when done
- Fail gracefully — if an API fails, continue with available data
- Background agents may get auto-denied on Write/Bash — extract content and write from main session

## Netlify Deploy Safety

**ALWAYS** use site UUID when deploying via CLI, not site name. Verify the target before pushing. These are live client-facing briefs.
