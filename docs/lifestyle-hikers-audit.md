# Lifestyle Hikers Platform Audit

Audit date: 2026-07-30  
Repository: `willylondon/lifestyle-hikers`  
Audit branch: `feature/lifestyle-hikers-platform-upgrade`  
Production URL: `https://www.lifestylehikers.com`

## Executive summary

Lifestyle Hikers is a static Jekyll 4.3.4 site deployed through GitHub Pages. Sveltia CMS edits YAML data files, Markdown posts, `_config.yml`, and repository-hosted images through GitHub. There is no application backend, database, ORM, server API, member authentication, booking database, payment gateway, or map integration.

The existing CMS is a Git-based content editor and must remain the source of truth for public content. It is appropriate for trails, event listings, homepage statistics, testimonials, gallery images, and blog posts. It is not an appropriate store for private bookings, medical details, emergency contacts, member profiles, or moderated user reports because every committed record would be part of the Git repository and its history.

The safest first implementation is therefore:

1. Repair current build/content and mobile-navigation defects.
2. Add optional, backward-compatible CMS fields to existing trail and event records.
3. Build public `/trails/` and `/hikes/` discovery pages from those Git-managed records.
4. Keep booking as an external registration/manual-payment link until a private backend is selected.
5. Do not add member accounts, private booking records, emergency/medical data, or community report submissions to the repository.

## 1. Current architecture

| Area | Current implementation |
| --- | --- |
| Frontend | Jekyll 4.3.4, Liquid templates, HTML, CSS, and vanilla JavaScript |
| Backend | None |
| CMS | Sveltia CMS loaded from unpkg; Decap-compatible configuration |
| Database | None |
| ORM/database client | None |
| Public authentication | None |
| Admin authentication | GitHub OAuth/application flow through Sveltia CMS; access-token sign-in is also presented |
| Content storage | Git-tracked Markdown, YAML, `_config.yml`, and image files |
| Media storage | `assets/images/uploads/` in the Git repository |
| Hosting | GitHub Pages, inferred from the CNAME, GitHub Pages behavior, CMS documentation, and deployed responses |
| Deployment | Push-to-`main` GitHub Pages build; no explicit Pages deployment workflow is committed |
| Server APIs | None |
| Middleware | None |
| Build | Bundler + Jekyll; `jekyll-seo-tag` and `jekyll-sitemap` plugins |
| Testing | No test framework or committed tests |
| Linting/formatting | No configured linter or formatter |

### Runtime and dependency baseline

- `Gemfile` requests Jekyll `~> 4.3.0`.
- `Gemfile.lock` resolves Jekyll 4.3.4 and declares Bundler 4.0.4.
- The audit machine exposes Apple Ruby 2.6.10 and Bundler 1.17.2 only.
- The exact local build cannot start because Bundler 4.0.4 is unavailable and the resolved dependency set requires a newer Ruby ecosystem.
- Docker is installed but its daemon is not running, so it could not provide an isolated baseline runtime.
- The production site was tested through the deployed GitHub Pages build instead.

This is a reproducibility defect. A supported Ruby version must be declared and CI must run the production build.

### External services

- GitHub and GitHub Pages
- Sveltia CMS from `unpkg.com`
- GitHub OAuth app ID in `admin/config.yml`
- Google Forms for community registration
- Google Forms for merchandise orders
- Google Analytics (`G-ZY66KJYF0Y`)
- Ahrefs Web Analytics
- Curator.io Instagram feed
- Instagram
- Google Fonts
- Font Awesome from cdnjs
- Unsplash-hosted contact-section image
- n8n webhook automation
- Telegram Bot API fallback
- Brevo flags passed through the n8n payload layer; no direct Brevo client exists in this repository

### Environment and repository secrets

No local runtime environment variables are required to render the static website. Automation uses repository secrets/variables:

- `N8N_CONTENT_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `LH_WEBHOOK_SECRET`
- `LIFESTYLE_HIKERS_SITE_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_MESSAGE_THREAD_ID`
- `CONTENT_DISTRIBUTION_DRY_RUN` repository variable

There is naming drift: one workflow uses `LH_WEBHOOK_SECRET`, while another workflow and the CMS guide use `N8N_WEBHOOK_SECRET`. This should be consolidated or explicitly documented as two separate secrets.

### Payments, email, and maps

- No payment integration exists.
- No booking payment-status store exists.
- No map or geospatial integration exists.
- Brevo is represented only as distribution flags/IDs in content records and payloads.
- The repository contains no mail server or transactional booking-confirmation service.

## 2. Repository structure

| Path | Purpose |
| --- | --- |
| `_layouts/` | Default public page and blog-post shells |
| `_includes/` | Homepage sections, navigation, footer, events, trails, forms, and testimonials |
| `_data/` | CMS-managed events, trails, gallery, and testimonials |
| `_posts/` | CMS-managed and automated Markdown blog posts |
| `admin/` | Sveltia CMS entry point, schemas, and preview templates |
| `assets/css/` | Single global stylesheet |
| `assets/js/` | Global interactions and recovery-report logic |
| `assets/images/` | Brand and CMS-uploaded images |
| `scripts/` | Image optimization and n8n/Telegram distribution tooling |
| `.github/workflows/` | Image optimization and distribution automations |
| `docs/` | Automation and platform documentation |

There are no API-route folders, schema migrations, database definitions, hooks, typed component modules, or server-side services.

## 3. CMS architecture and compatibility report

### Login and authorization

`/admin/` loads Sveltia CMS and presents GitHub sign-in and access-token sign-in. The backend targets `willylondon/lifestyle-hikers`, branch `main`, using the configured GitHub app ID. Editors require repository write access. The admin route is public by design; content mutation is protected by GitHub authorization.

Authenticated create/edit/publish tests could not be performed because no administrator credentials were supplied. The unauthenticated CMS shell and login controls loaded without console errors.

### Content types

| CMS label | Source | Editing model |
| --- | --- | --- |
| Site Settings / Homepage Counters | `_config.yml` | File/object schema |
| Blog Posts | `_posts/*.md` | Folder collection; create/edit Markdown and front matter |
| Upcoming Hikes | `_data/events.yml` | List in one YAML file |
| Gallery | `_data/gallery.yml` | List in one YAML file |
| Trails | `_data/trails.yml` | List in one YAML file |
| Reviews | `_data/testimonials.yml` | List in one YAML file |

Homepage narrative sections, navigation, merchandise details, social destinations other than the configured social object, contact copy, and corporate-page content are hard-coded and not CMS-managed.

### Publish and rendering model

- CMS writes commits to `main`.
- GitHub Pages rebuilds the site after a commit.
- Jekyll reads content at build time.
- There is no request-time content fetch, client-side CMS fetch, ISR, revalidation endpoint, or application cache.
- Image and content-distribution workflows run after matching pushes.
- Git history provides version history and rollback; the CMS configuration does not declare an editorial workflow or separate draft branch.
- Blog `distribution_status` is automation state, not Jekyll publication state.
- Posts can use `published: false`; future-dated posts depend on Jekyll date behavior.

### Identifiers and relationships

- Trails and events are embedded list objects without stable IDs or relational links.
- Blog posts are identified by filename, optional `slug`, and optional `permalink`.
- Public blog URLs may be generated from slugs or custom permalinks.
- Event automation derives an announcement ID from name/date when not supplied.
- There are no relational constraints between trails, events, and blog guides.

### Compatibility risks

1. Renaming fields would break Liquid templates, CMS forms, and automation scripts.
2. Making new fields required would prevent old records from opening or publishing cleanly.
3. Moving list records to a new collection would disrupt existing editor workflows.
4. Changing existing slugs/permalinks would risk indexed URLs.
5. Storing private user data in YAML would expose it through Git and Git history.
6. Duplicate blog slugs currently produce route collisions.
7. Malformed front matter currently causes posts to be skipped from the deployed site.

All first-phase fields must be optional with Liquid defaults. Existing keys remain authoritative until a documented normalization migration is completed.

## 4. Current database and content models

### Database

There is no database and therefore no database records, migrations, backup tooling, or row-level authorization.

### Trails

There are 6 trail records. Current fields:

`name`, `location`, `difficulty`, `distance`, `elevation`, `time`, `rating`, `stars`, `half_star`, `reviews`, `image`, `image_width`, `image_height`, `alt`.

Issues:

- Distance and elevation are presentation strings, not normalized numbers.
- Five records use miles/feet; one mixes kilometres and feet; one embeds extensive prose in metric fields.
- `location` mixes parish, community, and region.
- Ratings/review counts have no review source or verification workflow.
- No stable ID/slug, status, route type, verification date, guide requirement, river-crossing flag, preparation note, conditions, coordinates, or linked guide exists.

### Events

There are 13 event records. Core fields:

`name`, `location`, `difficulty`, `date`, `time`, `distance`, `spots`, `description`.

Optional automation fields:

`flyer`, `registration_url`, `distribution_status`, `announcement_id`, `send_to_telegram`, `send_to_brevo`, `announcement_sent_at`, `telegram_sent`, `brevo_sent`, `telegram_message_id`, `brevo_message_id`, `announcement_error`.

Issues:

- All 13 events are in the past as of the audit date.
- 11 records have no `distribution_status`; 2 are `ready` even though their dates have passed.
- `spots` is described as available capacity but is not decremented by bookings.
- Date and time/meeting point are split inconsistently; `time` is free text.
- Price, capacity, status, deadline, payment methods, transport, and trail relationships do not exist.
- `registration_url` is empty on all audited records.

### Blog posts

There are 38 Markdown files. Observed front-matter fields include:

`layout`, `title`, `slug`, `description`, `date`, `author`, `category`, `categories`, `location`, `image`, `image_alt`, `tags`, `permalink`, `canonical`, `published`, and distribution bookkeeping fields.

Issues:

- 4 posts have invalid YAML front matter and are skipped/mishandled by Jekyll.
- 17 posts omit explicit `slug`.
- 19 omit `description`.
- 15 omit `image`.
- 18 omit singular `category`.
- Five generated public URLs collide between two posts.
- Several automated topics and slugs are duplicated across dates.
- One current post contains placeholder operating-hours copy.

### Other data

- Testimonials: 8 records; one rating is `1`, which may be genuine but warrants editorial review.
- Gallery: 6 records with image, alt text, and optional layout size.
- Homepage stats: baseline totals are stored in `_config.yml`; total/year counts are computed by adding past events.
- Merchandise: hard-coded item, sizes, and Google Form link.
- Join/contact records: stored in a third-party Google Form, outside this repository.
- Reviews shown on trails are hard-coded fields, not a review collection.

## 5. Current user-facing functionality

### Confirmed working in the deployed baseline

- Homepage renders with navigation, hero, trail cards, event history, about, gallery, Instagram, merchandise, testimonials, and join form.
- Homepage trail text search filters six cards.
- Difficulty buttons filter trail cards.
- Blog index renders.
- Blog detail URLs render for valid posts.
- Past-hikes archive renders.
- Corporate page renders.
- Recovery-report form generates an in-browser report and enables PDF printing.
- CMS login page renders.
- Desktop and mobile layouts render without framework overlays or console warnings in tested flows.

### Missing or incomplete

- `/trails/` returns GitHub Pages 404.
- No individual structured trail pages exist.
- `/hikes/` returns GitHub Pages 404.
- No event detail pages exist.
- No booking system, waitlist, confirmation, or payment tracking exists.
- No member accounts exist.
- No community trail reports exist.
- No trail-readiness score exists.
- No maps exist.
- “Save trail” changes an icon only until reload and provides no accessible pressed state.
- Homepage has no dominant “Find a Trail” and “Book a Hike” CTA pair.
- All scheduled events are past, so the homepage shows recent hikes.

### Form behavior

- The join form sends directly to Google Forms using `no-cors`.
- It declares `novalidate`, provides no custom validation, and uses placeholders instead of visible labels for most fields.
- It displays success and the Telegram link even when the fetch rejects, so it cannot confirm that a record was saved.
- The global script contains unused Formspree submission code targeting different element IDs.
- Merchandise ordering leaves the site for a Google Form.

### Error/loading/empty states

- Blog and events have simple empty states.
- Trail filtering has a hidden empty-state hook in JavaScript but no matching `#trailsEmpty` element in the current include.
- Missing routes use GitHub Pages’ generic 404; no branded error page exists.
- CMS has a loading screen and Sveltia status messages.

## 6. Current admin functionality

The configured CMS supports:

- Editing homepage counters
- Creating/editing/publishing blog posts
- Editing the event list
- Editing the trail list
- Editing gallery images
- Editing testimonials
- Uploading images to `assets/images/uploads/`
- Previewing posts, trail cards, and event cards

It does not support:

- Homepage section copy/order/navigation management
- Booking records or payment confirmation
- Attendance export
- Members or private profiles
- Moderated trail reports
- Stable trail/event relationships
- Content-stage editorial workflow
- Server-side image MIME/size enforcement

## 7. Existing problems

### Critical/high

1. Four blog posts contain invalid YAML front matter; published content is silently absent from the blog.
2. Duplicate slugs/permalinks cause five public route collisions and content overwrites.
3. Exact local builds are not reproducible with the declared lockfile on the available runtime; no CI build test protects production.
4. The join form reports success even on network failure and lacks validation.
5. The mobile navigation’s first links move above the viewport when opened after scrolling. The scrolled navbar’s backdrop filter creates a containing-block interaction with the fixed menu.

### Medium

1. Trail/event units and content are inconsistent.
2. The CMS guide’s admin URL still references the GitHub Pages project URL while production uses the custom domain.
3. Webhook secret names differ between workflows/documentation.
4. Unpinned Sveltia CMS CDN code can change without a repository commit.
5. The global JavaScript contains dead Formspree code.
6. Trail cards look interactive but do not open trail details.
7. Corporate statistics duplicate/hard-code values separately from CMS-managed stats.
8. No custom 404 page exists.

## 8. Security risks

- No committed private keys, API tokens, or passwords were found by pattern scan.
- Public analytics IDs, OAuth app ID, feed ID, and Google Form IDs are client identifiers rather than secrets.
- Sveltia CMS is loaded from an unversioned CDN path without subresource integrity.
- External fonts, icons, analytics, feed code, and images increase supply-chain and privacy exposure.
- There is no Content Security Policy.
- CMS uploads have no configured type/size restrictions; repository write access is the main control.
- Google Forms receives name, email, and phone/WhatsApp details without an adjacent privacy/retention notice or affirmative consent.
- The static site cannot safely authorize access to private bookings, emergency contacts, medical data, or member profiles.
- There is no site-controlled rate limiting or anti-spam layer for the join form.
- Public `/admin/` is not itself a vulnerability, but authorization must remain GitHub-enforced and least-privilege.

## 9. Accessibility risks

Positive baseline:

- Skip link exists.
- Global visible focus styles exist.
- Reduced-motion styles/logic exist.
- Most meaningful images have alt text.
- Menu button uses `aria-controls` and `aria-expanded`.

Risks:

- Join form inputs rely on placeholders instead of labels.
- Join form has no field-level validation or error announcements.
- Mobile menu lacks Escape handling, focus management, and reliable viewport positioning.
- Save buttons do not expose `aria-pressed` or updated labels.
- Trail filters do not declare initial `aria-pressed` in markup.
- Past-hikes uses an `h2` as the page’s primary heading.
- Repeated testimonial cards and auto-scroll require further screen-reader testing.
- Third-party CMS and Instagram widgets require separate accessibility verification.

## 10. Performance risks

- `assets/images/` contains 90 files totaling approximately 111 MB.
- Individual originals reach 14.7 MB, 12.7 MB, and 10.1 MB.
- Optimized WebP variants exist for many rendered images, but originals remain in repository history and some content still references JPEGs.
- Global CSS is approximately 2,487 lines and includes page-specific styles.
- Corporate and testimonial styles are embedded in page/includes.
- Multiple third-party domains load fonts, icons, analytics, feeds, CMS code, and images.
- The contact background depends on a remote Unsplash URL.
- No performance budget, Lighthouse CI, or page-weight regression test exists.

## 11. SEO risks

Positive baseline:

- `jekyll-seo-tag` and `jekyll-sitemap` are enabled.
- `robots.txt` points to the sitemap.
- Core pages have descriptive titles/descriptions.
- Legacy `.html` routes exist for corporate and past hikes.

Risks:

- Four malformed posts do not publish correctly.
- Duplicate slugs/permalinks overwrite or compete at the same URL.
- No Trail or Event structured data exists.
- Generic JSON-LD omits URL, image, dates, and richer entity attributes.
- No breadcrumb markup exists.
- No branded 404 page exists.
- Several posts omit descriptions and images.
- Automated duplicate content may dilute index quality.
- No structured redirects file exists; current redirects use HTML refresh.
- There are no `/trails/` or `/hikes/` landing pages.

## 12. CMS compatibility risks

- Current lists have no stable IDs; future relationships cannot rely safely on array position.
- Numeric normalization must not remove presentation strings until every old record is migrated.
- Git-backed CMS is unsuitable for sensitive/private operational data.
- Existing automation scripts inspect current event and post fields; extensions must not rename them.
- Image rewriting can update references throughout content and must be tested against spaces/encoded paths.
- A schema change that makes fields required would break old entries.

See `docs/cms-compatibility-plan.md` for field-level rules.

## 13. Recommended implementation plan

### Phase A: stabilization

1. Add supported Ruby/runtime documentation and a CI build check.
2. Repair malformed front matter without changing intended URLs.
3. Resolve duplicate publishing by retaining the established canonical page and marking later duplicates unpublished or assigning unique, justified URLs.
4. Fix mobile navigation positioning, Escape/focus behavior, and save/filter ARIA states.
5. Add join-form labels, validation, honest pending/success/error states, and a privacy notice.

### Phase B: backward-compatible discovery MVP

1. Add optional trail fields while retaining legacy display strings.
2. Add stable trail/event slugs.
3. Add `/trails/` search/filter/sort from CMS data.
4. Add trail detail pages generated from Git-managed content.
5. Add optional event booking/status/pricing fields.
6. Add `/hikes/` with external registration/manual payment instructions.
7. Add homepage “Find a Trail,” “Book a Hike,” and secondary “Join” CTAs.
8. Add the non-real-time trail-intelligence introduction and disclaimers.

### Phase C: private operational backend

Select and document a backend before implementation. It must provide:

- Authenticated users and admin roles
- Private relational storage
- Server-side validation/authorization
- Booking capacity transactions
- Payment status
- Emergency/medical data access controls and retention
- Moderated reports
- Audit logs, exports, backups, and deletion workflows

Member accounts, booking administration, trail reports, and readiness calculations should not be implemented until this decision is made.

## 14. Files expected to change

Stabilization/discovery:

- `Gemfile`, `Gemfile.lock`, `.ruby-version` or equivalent runtime declaration
- `.github/workflows/` build validation
- `_config.yml`
- `admin/config.yml`
- `admin/preview-templates.js`
- `_data/trails.yml`
- `_data/events.yml`
- `_includes/nav.html`
- `_includes/hero.html`
- `_includes/trails.html`
- `_includes/events.html`
- `_includes/contact.html`
- `_layouts/default.html`
- `assets/css/style.css`
- `assets/js/script.js`
- affected malformed/duplicate `_posts/*.md`
- new trail/hike layouts, includes, pages, and documentation

No production database files exist to change.

## 15. Database changes expected

None in the static discovery MVP.

A later booking/member/report phase requires a new private database. It must be introduced as a separate, reviewed architecture with migrations; it must not be simulated with public YAML or committed JSON.

## 16. Migration strategy

1. Preserve current YAML files and Git history as the backup.
2. Add optional fields to CMS schemas.
3. Make templates fall back to legacy fields.
4. Add stable slugs without changing existing public blog URLs.
5. Normalize metric numeric fields alongside—not in place of—legacy display strings.
6. Validate all existing records against the expanded schema.
7. Build and render representative old and new records.
8. Only make fields required after every existing record has valid values.

See `docs/database-migration-plan.md`.

## 17. Rollback strategy

- Work only on the feature branch.
- Keep changes in small logical commits.
- Revert the relevant commit(s) if validation fails.
- Restore data files from the pre-change commit if a content migration fails.
- Do not rewrite Git history or delete original media during the first phase.
- Keep existing routes and legacy field fallbacks for at least one full deployment cycle.

See `docs/rollback-plan.md`.

## 18. Testing strategy and baseline results

### Static checks completed

| Check | Result |
| --- | --- |
| Ruby syntax for 3 automation scripts | Pass |
| JavaScript syntax for public/admin scripts | Pass |
| Python optimizer syntax | Pass after directing bytecode cache to a writable temporary path |
| Secret-pattern scan | No committed secrets detected |
| Event payload dry run | Pass; 0 payloads because all ready events are past |
| Git diff check | Pass before edits |
| Exact local Jekyll build | Blocked by runtime/lockfile mismatch |

### Browser baseline

| Flow | Result |
| --- | --- |
| Homepage identity/content | Pass |
| Trail text search | Pass; one `Holywell` result |
| Trail save control | Partial; visual-only and not accessible/persistent |
| Mobile menu at top | Renders |
| Mobile menu after scroll | Fail; first four links are above viewport |
| Blog listing | Pass |
| Past hikes | Pass |
| Corporate page | Pass |
| Recovery report generation | Pass with representative metric inputs |
| CMS unauthenticated login | Pass |
| CMS authenticated CRUD/upload | Not tested; credentials not available |
| `/trails/` | Fail; 404 |
| `/hikes/` | Fail; 404 |
| Console warnings/errors on tested routes | None observed |

Production briefly returned GitHub’s “Unicorn” error on the first request, then loaded normally through the GitHub Pages URL/custom-domain redirect. This appears to be a transient hosting response, not an application console failure.

See `docs/testing-plan.md` for post-change coverage.

