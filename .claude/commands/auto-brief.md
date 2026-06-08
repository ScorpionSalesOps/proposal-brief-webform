# Auto Brief Builder (Headless Mode)

Build a complete pre-proposal brief from structured input. Designed for automated/headless execution - NO interactive prompts.

---

## Arguments

$ARGUMENTS is a pipe-delimited string:
```
CLIENT_NAME|PRIMARY_DOMAIN|CONTRACT_URL|INDUSTRY|LOCATION|COMPETITORS|DISCOVERY_NOTES
```

Example:
```
Smith Law|smithlaw.com|https://signup.scorpion.co/...|law|Houston, TX|competitor1.com,competitor2.com|Full discovery call notes here...
```

If COMPETITORS is "auto", discover competitors automatically.

---

## Execution Steps (All Automated)

### 1. Parse Input
Extract all fields from $ARGUMENTS. Do not prompt for missing data - use defaults or skip.

```javascript
const args = "$ARGUMENTS".split("|");
const data = {
  clientName: args[0] || "Unknown Client",
  primaryDomain: args[1] || "",
  contractUrl: args[2] || "",
  industry: args[3] || "law",
  location: args[4] || "",
  competitors: args[5] === "auto" ? [] : (args[5] || "").split(",").filter(Boolean),
  discoveryNotes: args[6] || ""
};
```

### 2. Create Folder Structure
```bash
SLUG=$(echo "[CLIENT_NAME]" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
mkdir -p "${SLUG}-brief/research"
mkdir -p "${SLUG}-brief/screenshots"
cp templates/scorpion-logo.png "${SLUG}-brief/" 2>/dev/null || true
```

### 3. Run DataForSEO Research (Parallel)

Launch ALL research in parallel using Agent/Task tools. All DataForSEO tools require `location_name: "United States"` and `language_code: "en"`.

**Agent 1: Domain Overview + Competitors**
- `mcp__dataforseo__dataforseo_labs_google_domain_rank_overview` — `{ "target": "domain.com", "location_name": "United States", "language_code": "en" }`
- `mcp__dataforseo__dataforseo_labs_google_competitors_domain` (if competitors="auto")
- Capture: domain_rank, organic keywords, ETV

**Agent 2: Historical Traffic**
- `mcp__dataforseo__dataforseo_labs_google_historical_rank_overview` — `{ "target": "domain.com", "location_name": "United States", "language_code": "en" }`
- Capture: traffic trends for charts
- Note: API returns ~6 months max, not 12

**Agent 3: Backlink Analysis**
- `mcp__dataforseo__backlinks_summary` — `{ "target": "domain.com" }`
- `mcp__dataforseo__backlinks_referring_domains` — `{ "target": "domain.com", "limit": 10 }`
- Capture: referring domains, backlinks count
- Note: May require separate subscription — skip gracefully if unavailable

**Agent 4: Top Keywords**
- `mcp__dataforseo__dataforseo_labs_google_ranked_keywords` — `{ "target": "domain.com", "location_name": "United States", "language_code": "en", "limit": 20 }`
- Capture: top ranking keywords for narrative

**Agent 5: SERP Verification**
- `mcp__dataforseo__serp_organic_live_advanced` — `{ "keyword": "...", "location_name": "United States", "language_code": "en" }`
- Verify actual ranking positions for top 3-5 keywords before making claims

### 4. Run Apify Scrapers (Parallel)

Use Agent tool with appropriate `subagent_type` for each:

**Google Ads Intelligence** (`subagent_type: "apify-actor-agent"`)
- Actor: `ivanvs/google-ads-scraper`
- Input: `{ "urls": ["https://adstransparency.google.com/..."] }`
- Limit: 15 results

**Google Reviews** (`subagent_type: "google-maps-agent"`)
- Actor: `delicious_zebu/google-maps-store-review-scraper`
- Get review count, average rating, recent reviews

**Social Media** (`subagent_type: "social-media-agent"`, if time allows)
- Instagram: `apify/instagram-profile-scraper` with `{ "usernames": ["handle"] }`
- Facebook Ads: `curious_coder/facebook-ads-library-scraper`

### 5. Scrape Website Content
- Tool: `mcp__brightdata__scrape_as_markdown` — `{ "url": "https://domain.com" }`
- Scrape prospect homepage for content analysis
- Optional: `mcp__brightdata__scrape_batch` for competitor homepages (max 10 URLs)

### 6. On-Page Technical Analysis (optional)
- Tool: `mcp__dataforseo__on_page_lighthouse` — `{ "url": "https://domain.com" }`
- Get Lighthouse scores for prospect and top competitor

### 7. Scrape Contract (if URL provided)
- Tool: `mcp__brightdata__scrape_as_markdown` — `{ "url": "CONTRACT_URL" }`
- Extract: Monthly cost, ad budget, setup fee, deliverables list.
- **NOTE**: Do NOT include pricing in the brief — save contract data to research/ only.

### 8. Build HTML Brief

Use the **Scorpion Brand System v4** as the default design. Follow `.claude/commands/build-brief.md` Step 6 for full section-by-section design spec. v3 J&T is fallback only.

**Key design rules (Scorpion v4 — DEFAULT):**
- CSS: inline the full file from `.claude/context/scorpion-brand-system-v4.css` (~95KB) into a `<style>` block in `<head>`
- Fonts: Outfit (display) + Host Grotesk (body), loaded from Google Fonts. Inter is fallback only.
- CSS vars: `--bg-primary: #000000`, `--bg-card: #0a0a0a`, `--accent: #007FFD`, `--accent-soft: #B2D6FF`
- Libraries: Chart.js, GSAP + ScrollTrigger from CDN
- Cards: Solid `#0a0a0a` background with `#1a1a1a` borders. Flat plates, NOT glass, NOT 3px-top-border strips.
- Background: pure black `#000000` with a single subtle `.gradient-orb-1` radial wash. NOT a 3-orb mesh.
- Headline pattern: two-line `.section-title-strong` (white) + `.section-title-soft` (ice-blue `#B2D6FF`)
- Floating centered pill nav (NOT sticky nav)
- Scroll progress bar, back-to-top button
- Hero adds `.hero-trust` strip + `.hero-scroll-cue` + `.live-recency` pill
- Narrative-first approach — lead with business diagnosis
- NO PRICING in the brief

**Dropped from v3 (do NOT use)**: magenta `--accent-secondary`, cyan, orange, lime, conic-gradient rotating borders, `.highlight-gradient` rainbow text, multi-orb gradient mesh.

**v3 J&T fallback** (only if user explicitly asks): font Inter, `--bg-primary: #0a0a14`, `--bg-card: #1a1838`, `--accent-secondary: #6D5AFF`, 3-orb gradient mesh.

**Video embeds by vertical:**
- Legal: `https://player.vimeo.com/video/1108588137?h=4038d9b45f` and `https://player.vimeo.com/video/1108564810?h=4c831ee34b`
- Home Services: `https://player.vimeo.com/video/1109496435?h=33ee4479d1` and `https://player.vimeo.com/video/1109461826?h=3ed3d614a1`

**DO NOT use old templates** (kersh-law-brief, sub-zero-heating-air-brief, example-brief.html with --bg-primary: #0B345E). These are deprecated.

### 9. Save Research Data

Save all collected data to `[client]-brief/research/`:
- `client-info.json` — Input data + metadata
- `domain-data.json` — Overview metrics
- `traffic-history.json` — Monthly ETV
- `ranked-keywords.json` — Top rankings
- `backlink-data.json` — Link profile
- `competitor-data.json` — Competitor metrics
- `ads-data.json` — Google Ads intelligence
- `social-data.json` — Social media data

### 10. Output Completion

Print JSON status to stdout (required for automated workflow parsing):
```json
{
  "status": "success",
  "brief_path": "[client]-brief/index.html",
  "client_name": "...",
  "domain": "...",
  "research_date": "YYYY-MM-DD"
}
```

If any step fails critically:
```json
{
  "status": "error",
  "error": "Description of what failed",
  "partial_path": "[client]-brief/"
}
```

---

## Key Rules

1. **NO interactive prompts** — Never use AskUserQuestion or pause for input
2. **Parallel execution** — Launch all research agents simultaneously
3. **Fail gracefully** — If an API fails, note it and continue with available data
4. **JSON output** — Final status must be valid JSON for automated parsing
5. **Scorpion v4 default** — Use Scorpion Brand System v4 design (CSS at `.claude/context/scorpion-brand-system-v4.css`). v3 J&T only if explicitly requested.
6. **NO pricing** — Never include pricing in the brief HTML
7. **Verify claims** — All ranking claims must be verified with live SERP data
8. **Never fabricate** — If data is unavailable, say "Data unavailable"
