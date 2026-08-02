# Lifestyle Hikers — Current Site Audit 2026-08

**Audit date:** August 2, 2026
**Branch:** `feature/current-site-audit-and-platform-improvements`
**HEAD commit:** `394ebc28eb338318a269fc12d38c26952d6a014b`
**Commit date:** August 2, 2026
**Live deployment:** https://www.lifestylehikers.com (GitHub Pages, building)

## 1. Architecture

### Technology stack
| Layer | Technology | Version |
|---|---|---|
| Static site generator | Jekyll | 4.3.4 |
| Template language | Liquid | 4.0.4 |
| Ruby | 3.3.6 (`.ruby-version`) | |
| Bundler | 4.0.4 (`Gemfile.lock` BUNDLED WITH) | |
| Markdown | kramdown | 2.5.2 |
| CSS preprocessor | Sass (embedded) | 1.97.3 |
| CMS | Sveltia CMS (Decap-compatible) | CDN-loaded |
| Hosting | GitHub Pages | Legacy build |
| Domain | lifestylehikers.com | CNAME file |
| CI/CD | GitHub Actions | 5 workflows |

### Repository stats
- **Total files:** ~402 (excluding .git, _site, .sass-cache)
- **Jekyll pages:** 9 HTML page files + 22 trail HTML pages
- **Includes:** 13 files
- **Layouts:** 3 (default, post, trail)
- **Blog posts:** 38 Markdown files
- **Data files:** 4 YAML (trails, events, gallery, testimonials)
- **CSS:** 1 file, ~2500 lines
- **JavaScript:** 4 files (script.js, hikes.js, trail-explorer.js, recovery-report.js)
- **GitHub Actions:** 5 workflows
- **Scripts:** 5 (3 Ruby, 1 Python, 1 bash)
- **CMS:** 3 admin files (config.yml, index.html, preview-templates.js)
- **Documentation:** 12 doc files + 2 example files

### Dependencies (Gemfile)
- jekyll (~> 4.3.0)
- jekyll-seo-tag
- jekyll-sitemap

### Plugins (from _config.yml)
- jekyll-seo-tag
- jekyll-sitemap

### Content model
All dynamic content is stored as Git-tracked YAML data files:
- `_data/trails.yml` — 22 trail records
- `_data/events.yml` — 13+ event records
- `_data/gallery.yml` — gallery images
- `_data/testimonials.yml` — testimonials
- `_config.yml` — site settings, stats counters

No database. No ORM. No server-side API. No authentication.

## 2. Route inventory

| Route | Status | Source file | Content type |
|---|---|---|---|
| `/` | ✅ 200 | index.html | Homepage |
| `/trails/` | ✅ 200 | trails.html | Trail Explorer |
| `/trails/[slug]/` | ✅ 200 | trail-*.html (22 files) | Individual trail pages |
| `/hikes/` | ✅ 200 | hikes.html | Hike schedule |
| `/past-hikes/` | ✅ 200 | past-hikes.html | Past hike archive |
| `/blog/` | ✅ 200 | blog.html | Blog listing |
| `/blog/[slug]/` | ✅ 200 | _posts/*.md (38 files) | Blog posts |
| `/corporate/` | ✅ 200 | corporate.html | Corporate partnerships |
| `/recovery-report/` | ✅ 200 | recovery-report.html | Recovery tool |
| `/admin/` | ✅ 200 | admin/index.html | Sveltia CMS |
| `/join/` | ❌ 404 | — | No dedicated join page |
| Non-existent page | ✅ 404 | — | Custom 404 handling via GitHub Pages |

## 3. CMS architecture (Sveltia CMS / Decap-compatible)

### Backend
- GitHub backend (`willylondon/lifestyle-hikers`, branch: `main`)
- OAuth via GitHub App ID: `Iv1.b81c2fe99d3dc7f7`

### Collections
1. **Blog** (`_posts/`) — Markdown posts with front matter
2. **Trails** (`_data/trails.yml`) — YAML list
3. **Events/Hikes** (`_data/events.yml`) — YAML list
4. **Gallery** (`_data/gallery.yml`) — YAML list
5. **Testimonials** (`_data/testimonials.yml`) — YAML list
6. **Site Settings** (`_config.yml`) — Jekyll config

### Media
- Upload path: `assets/images/uploads/`
- Public folder: `/assets/images/uploads/`

### CMS preview
- Templates: `admin/preview-templates.js`
- Preview container: `admin/index.html`

## 4. Build health

### Build result: ✅ PASS
- Production build (`JEKYLL_ENV=production`) completes in ~0.5s
- Only stdlib deprecation warnings (csv, base64 — non-blocking)
- 63 HTML files generated

### YAML validation
- `_config.yml`: OK
- `_data/trails.yml`: OK (minor: uses Time class, requires `require 'time'` in strict safe_load)
- `_data/events.yml`: OK (same Time class note)
- `_data/gallery.yml`: OK
- `_data/testimonials.yml`: OK
- `admin/config.yml`: OK

### Front matter validation
- No duplicate permalinks found
- No invalid front matter found
- 45 files with front matter permalink

### Known issues
1. **Spaces in uploaded filenames** cause URL encoding issues (e.g., `Port royal 3.jpg`, `city walk 1.jpg`)
2. **Duplicate blog posts** — automated blog generation has created near-identical posts with different dates (e.g., "what to pack" appears 3 times)
3. **hike.html OG image** references `hero.webp` instead of `hero-group-2026.jpg`
4. **Corporate page stats cards** lack visible values (empty proof-number spans)
5. **Gemfile.lock uses Bundler 4.0.4** but system Ruby 2.6 cannot install it — requires Ruby 3.3+

## 5. Content model — current field inventory

### Trail fields (_data/trails.yml, 22 records)
| Field | Type | Present in all records |
|---|---|---|
| name | string | ✅ |
| slug | string | ✅ |
| parish | string | ✅ |
| location | string | ✅ |
| difficulty | string (Easy/Moderate/Hard) | ✅ |
| distance | string | ✅ |
| distance_km | number | 9 of 22 |
| elevation | string | ✅ |
| time | string | ✅ |
| duration_minutes_min | number | 17 of 22 |
| duration_minutes_max | number | 17 of 22 |
| trail_status | string | ✅ |
| guide_requirement | string | ✅ |
| river_crossing | string | ✅ |
| preparation_note | string | ✅ |
| featured | boolean | ✅ |
| bookable | boolean | ✅ |
| image | string | ✅ |
| image_width | number | ✅ |
| image_height | number | ✅ |
| alt | string | ✅ |
| last_verified_date | date | varies |
| verification_level | string | varies |

### Event fields (_data/events.yml, 13+ records)
| Field | Type | Notes |
|---|---|---|
| name | string | ✅ |
| location | string | ✅ |
| difficulty | string | ✅ |
| date | date | ✅ |
| time / departure_time | string | ✅ |
| distance | string | ✅ |
| spots / spaces_remaining | number | ✅ |
| description | string | ✅ |
| registration_url | string | optional |
| event_status | string | optional (upcoming/completed/etc.) |
| price_jmd | number | some |
| meeting_point | string | some |
| transport_information | string | some |
| flyer | string | optional |
| send_to_telegram | boolean | automation field |
| send_to_brevo | boolean | automation field |

### Testimonial fields
| Field | Type |
|---|---|
| name | string |
| role | string |
| rating | number (1-5) |
| text | string |
| avatar | string |

### Gallery fields
| Field | Type |
|---|---|
| src | string |
| alt | string |
| size | string (tall/wide) |

### Site settings (_config.yml)
| Field | CMS widget |
|---|---|
| title | string |
| description | string |
| image | image |
| logo | image |
| stats.base_total_hikes | number |
| stats.base_hikes_this_year | number |
| stats.active_members | number |
| stats.trails_explored | number |
| email | string |
| social.instagram | string |

## 6. Feature implementation status

### ✅ Fully implemented
- Homepage with hero, trails, events, about, gallery, community, merch, testimonials, contact
- Trail Explorer with search, parish filter, difficulty filter, distance filter, sort
- 22 individual trail pages with structured data
- Hike schedule with status tabs (Upcoming/Sold out/Members only/Cancelled/Completed)
- Blog with 38 posts, category-based listing
- Corporate partnership page with package tiers
- Recovery Report interactive tool (browser-side, no login)
- Past hikes archive
- Gallery
- Testimonials
- Contact/Join form (Google Forms integration, Telegram redirect)
- Curator.io Instagram feed
- Sveltia CMS with GitHub auth
- SEO (jekyll-seo-tag, jekyll-sitemap, meta tags, OG tags, structured data)
- robots.txt, sitemap.xml
- GitHub Pages deployment
- Content distribution automation (n8n, Telegram, Brevo webhooks)
- Skip link for accessibility
- Mobile hamburger navigation

### ⚠️ Partially implemented
- Trail-alert CTA exists but points to homepage contact form (no dedicated trail-alert page)
- Private hike enquiry routes to same contact form
- Corporate hike enquiry has inquiry buttons but no dedicated form
- Merch section links externally (no e-commerce integration)
- Trail status/last-verified fields exist in data but inconsistently populated
- Event `spaces_remaining` uses CMS-editorial values (not live inventory)

### ❌ Not implemented
- Member profiles or accounts
- Private booking system
- Payment processing
- Google Earth Engine / AlphaEarth integration
- Real-time trail conditions
- Community trail reports
- Dedicated merchandise store
- School hike enquiry page
- Tourist hike enquiry page
- WhatsApp group integration (link exists but no automation)
- Conversion tracking
- Comprehensive content security policy
- Image optimization pipeline beyond manual WebP conversion
- Automated duplicate-post detection
- Stale event detection

## 7. Defects found

### Content defects
1. **Duplicate blog posts** — automated blog generator created near-identical posts (e.g., "what to pack" × 3, "best waterfalls" × 2)
2. **Stale events in events.yml** — all events have past dates; no upcoming events
3. **hike.html front matter OG image** — references `hero.webp` instead of `hero-group-2026.jpg`
4. **Corporate page stats** — proof-number spans have empty values in some cards
5. **Spaces in uploaded filenames** — e.g., `Port royal 3.jpg`, `city walk 1.jpg`, `cherry garden lifestyle .JPG`

### Technical defects
6. **Gemfile.lock requires Bundler 4.0.4** — not installable on macOS system Ruby 2.6; requires Ruby ≥ 3.2
7. **Missing /join/ route** — returns 404; all Join Us links point to `#contact` homepage anchor
8. **Some trail images reference deleted JPGs** — a few cards show 0×0 images in browser rendering (server returns 200 — likely lazy-load artifact)
9. **No content validation workflow** — duplicate posts, broken images, stale events not caught

### UX defects
10. **Hikes page defaults to "Upcoming" tab** — but all hikes are completed, showing empty state
11. **No dedicated trail-alert page** — CTA leads to generic contact form
12. **"Completed" events still say "upcoming"** — description text like "Are you ready? Step into history..." on Judgement Cliff (past event)

## 8. Accessibility health

### Passes
- Skip-to-content link present
- Semantic HTML navigation
- Label elements on forms (Recovery Report, Join form)
- alt text on most images
- aria-live regions on search results
- aria-expanded on nav toggle

### Issues found
- Some interactive elements lack visible focus indicators
- Color contrast not formally verified (dark theme, needs testing)
- `prefers-reduced-motion` respected (JS checks for it)
- Some form labels on trails page use LabelText but need explicit `for`/`id` association
- Touch targets on mobile nav need verification

## 9. SEO health

### Passes
- Canonical URLs on major pages
- Meta descriptions present
- OG tags present
- Twitter card metadata
- Structured data (WebSite, WebPage, BlogPosting schemas)
- Sitemap generated
- robots.txt present
- Google Search Console verified (`mTUf4jlbokEWy9O3NlvfmuN6H64h91ZwayB1LSpDuuo`)

### Issues
- Some blog posts have shorter-than-optimal descriptions
- No breadcrumb schema on inner pages
- OG image on /hikes/ references old hero image
- Some trail page descriptions are generic

## 10. Performance health

| Metric | Value | Source |
|---|---|---|
| TTFB (production) | ~0.23s | curl timing |
| Full page load (browser) | ~1.4s | Navigation timing API |
| CSS size | ~12KB (gzipped) | Resource timing |
| JS total | ~15KB (3.7KB main + hikes/trail/recovery) | Resource timing |
| Hero image | 159KB (hero-group-2026.jpg) | Resource timing |
| Google Fonts | ~1.2KB | Resource timing |
| Font Awesome CDN | ~19KB | Resource timing |

### Issues
- Hero image (1280×720 JPG, 159KB) could be smaller with WebP (~60KB estimated)
- Google Analytics + Ahrefs analytics load synchronously
- Font Awesome loads full CSS (could use subset)
- No responsive image variants (srcset)
- Below-fold images lack explicit lazy loading on some pages

## 11. Security and privacy

### Passes
- No API keys in public repository (uses .env.example template)
- No private data in YAML/Markdown/Git
- Join form submits to Google Forms (not stored in repo)
- Recovery Report tool runs entirely client-side
- README explicitly prohibits storing member data in repo

### Concerns
- No Content Security Policy header
- No image upload restrictions documented
- Google Forms integration has no CSRF protection (relies on no-cors mode)
- Telegram invite link is base64-encoded in JavaScript (obfuscation, not security)
- Bitwarden secrets referenced in .env.example (credentials stored separately)
- No automated secret scanning

## 12. Automation inventory

| Workflow | File | Purpose |
|---|---|---|
| Validate site | `.github/workflows/validate-site.yml` | Build + lint on push |
| Content distribution | `.github/workflows/content-distribution-webhook.yml` | Webhook-triggered content pushes |
| Notify n8n blog | `.github/workflows/notify-n8n-blog-publish.yml` | Blog publish → n8n |
| Send Telegram | `.github/workflows/send-telegram-blog-notification.yml` | Blog → Telegram |
| Optimize images | `.github/workflows/optimize-cms-images.yml` | CMS image optimization |
| Build payload | `scripts/build_content_distribution_payload.rb` | n8n payload builder |
| Notify n8n | `scripts/notify_n8n_blog_posts.rb` | n8n notification |
| Notify Telegram | `scripts/notify_telegram_blog_posts.rb` | Telegram notification |
| Validate content | `scripts/validate_content.rb` | Content validation |
| Optimize uploads | `scripts/optimize_cms_uploads.py` | Image optimization |

## 13. Recommended changes

### Immediate (Stage 8 — fix defects)
1. Fix `hike.html` OG image reference
2. Fix corporate page stat card values
3. Add missing /join/ redirect
4. Clean up duplicate blog posts
5. Fix spaces in uploaded filenames (or handle URL encoding)
6. Address stale event descriptions

### Short-term (Stages 9-15)
7. Improve Trail Explorer filtering
8. Add dedicated trail-alert page
9. Add school/tourist/private enquiry flows
10. Add optional trail condition fields
11. Optimize hero image to WebP
12. Improve accessibility (focus styles, labels, contrast)
13. Add content validation GitHub Action
14. Create member backend options document

### Future (Stages 16+)
15. Private member backend
16. AlphaEarth integration research
17. Payment integration
18. Booking system

## 14. Files expected to change in this audit phase

### Documentation (new)
- `docs/current-site-audit-2026-08.md` ← this file
- `docs/current-cms-compatibility-matrix.md`
- `docs/current-implementation-plan.md`
- `docs/current-testing-report.md`
- `docs/current-performance-report.md`
- `docs/private-platform-backend-options.md`
- `docs/rollback-plan.md`
- `docs/deployment-checklist.md`
- `docs/content-schema.md` (update)
- `docs/admin-guide.md` (update)

### Code (to fix)
- `hikes.html` — fix OG image
- `corporate.html` — fix stat card values
- `_includes/events.html` — stale description fix
- `.github/workflows/validate-site.yml` — enhance validation

### New files
- `/join/index.html` — redirect page
- `docs/audit-screenshots/before/*.png` — screenshots
