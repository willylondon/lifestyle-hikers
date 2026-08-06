# Lifestyle Hikers — Implementation Plan 2026-08

**Date:** August 2, 2026
**Branch:** `feature/current-site-audit-and-platform-improvements`

## Phased approach

### Phase 1: Fix defects (Stage 8)
Priority: High. No new features. Fix what's broken.

| # | Task | File(s) | Risk | Effort |
|---|---|---|---|---|
| 1 | Fix hike.html OG image → hero-group-2026.jpg | hikes.html | None | 1 line |
| 2 | Fix corporate page stat card values | corporate.html | None | ~10 lines |
| 3 | Create /join/ redirect page | join/index.html (new) | None | 1 file |
| 4 | Fix stale event descriptions (remove "upcoming" language from past events) | _data/events.yml | Low | ~5 edits |
| 5 | Handle spaces in uploaded filenames (add URL encoding or rename utility) | scripts/ | Medium | ~20 lines |
| 6 | Remove/hide duplicate blog posts | _posts/*.md | Low | File ops |
| 7 | Add `csv` and `base64` to Gemfile for future Ruby compatibility | Gemfile | None | 2 lines |
| 8 | Fix heroes.html hero-actions Liquid indentation | _includes/hero.html | Low | ~5 lines |

### Phase 2: Conversions & enquiry flows (Stages 9-13)
Priority: Medium. Improve revenue paths.

| # | Task | Files | Risk | Effort |
|---|---|---|---|---|
| 1 | Create dedicated trail-alert page with form | trail-alert.html (new) | Low | ~60 lines |
| 2 | Update all "Join the next trail alert" links to dedicated page | _includes/*, index.html | Low | ~5 edits |
| 3 | Add private hike enquiry form | corporate.html | Low | ~40 lines |
| 4 | Add school hike enquiry page | school-hikes.html (new) | Low | ~80 lines |
| 5 | Add privacy notices and consent wording to all forms | _includes/contact.html, new pages | Low | ~20 lines |
| 6 | Update hike schedule to show "No upcoming hikes" when empty instead of all-completed | hikes.html | Low | ~5 lines |

### Phase 3: Trail discovery improvements (Stage 10)
Priority: Medium. Improve key product experience.

| # | Task | Files | Risk | Effort |
|---|---|---|---|---|
| 1 | Add guide requirement filter | trail-explorer.js, trails.html | Low | ~30 lines |
| 2 | Add river crossing filter | trail-explorer.js, trails.html | Low | ~20 lines |
| 3 | Add route type filter | trail-explorer.js, trails.html | Low | ~20 lines |
| 4 | Expand "More filters" section | trail-explorer.js, trails.html | Medium | ~50 lines |
| 5 | Add shareable trail URLs (copy-to-clipboard) | trail-*.html | Low | ~20 lines |
| 6 | Add clear reset-filters action | trail-explorer.js | Low | ~10 lines |

### Phase 4: Trail condition foundation (Stage 14)
Priority: Low-Medium. Adds value without false promises.

| # | Task | Files | Risk | Effort |
|---|---|---|---|---|
| 1 | Add optional CMS fields for trail conditions | admin/config.yml, _data/trails.yml | Medium | ~30 lines |
| 2 | Update trail page layout to show condition block | _layouts/trail.html | Low | ~40 lines |
| 3 | Add Liquid defaults for all new fields | _layouts/trail.html | Low | ~10 lines |
| 4 | Update content-schema.md | docs/content-schema.md | None | ~30 lines |

### Phase 5: Accessibility & SEO (Stages 17-18)
Priority: Medium. Improve for all users.

| # | Task | Files | Risk | Effort |
|---|---|---|---|---|
| 1 | Add visible focus styles to all interactive elements | assets/css/style.css | Low | ~15 lines |
| 2 | Add explicit `for`/`id` associations on trails page forms | trails.html | Low | ~10 lines |
| 3 | Add breadcrumb navigation to trail pages | _layouts/trail.html | Low | ~15 lines |
| 4 | Add missing meta descriptions where needed | various pages | Low | ~5 edits |
| 5 | Verify color contrast ratios | (audit task) | None | Manual |

### Phase 6: Performance (Stage 19)
Priority: Low. Site is already fast.

| # | Task | Files | Risk | Effort |
|---|---|---|---|---|
| 1 | Convert hero-group-2026.jpg to WebP | assets/images/ | None | Image op |
| 2 | Add responsive image variants to trail cards | trails.html, trail-*.html | Medium | ~30 lines |
| 3 | Defer non-critical JS | _layouts/default.html | Low | ~5 lines |
| 4 | Add explicit lazy loading to below-fold images | various | Low | ~10 edits |
| 5 | Subset Font Awesome (only used icons) | _layouts/default.html | Low | ~5 lines |

### Phase 7: Documentation & backend options (Stages 16, 22)
Priority: Low. Planning only.

| # | Task | Files | Risk | Effort |
|---|---|---|---|---|
| 1 | Create private platform backend options document | docs/private-platform-backend-options.md | None | ~200 lines |
| 2 | Update README.md | README.md | None | ~30 lines |
| 3 | Update admin-guide.md | docs/admin-guide.md | None | ~50 lines |
| 4 | Create rollback plan | docs/rollback-plan.md | None | ~40 lines |
| 5 | Create deployment checklist | docs/deployment-checklist.md | None | ~30 lines |

## Testing strategy

### Per-commit testing
1. `bundle exec jekyll build` — must pass
2. `ruby scripts/validate_content.rb` — must pass
3. Visual check on local server

### Pre-PR testing
1. Full production build (`JEKYLL_ENV=production bundle exec jekyll build`)
2. Manual check of all modified pages
3. CMS regression: can trails/events/posts still be edited?
4. Mobile navigation test
5. Link checker on _site output
6. Image existence check

### GitHub Actions
- Validate site workflow already runs on push
- Enhancement needed: add content linting (duplicate posts, stale events)

## CMS compatibility safeguards

For every change:
1. ✅ Add optional fields only (never make new fields required)
2. ✅ Provide Liquid defaults for all new fields
3. ✅ Don't rename existing CMS fields
4. ✅ Don't remove existing CMS widgets
5. ✅ Don't break admin/config.yml structure
6. ✅ Test preview templates after changes

## Rollback strategy

Each phase produces its own commit. Rollback means:
1. Revert the specific phase commit(s)
2. GitHub Pages auto-rebuilds from reverted commit
3. No database migration needed (static site)

Full rollback: `git revert <commit-range>` on main.
