# Lifestyle Hikers — CMS Compatibility Matrix 2026-08

**Date:** August 2, 2026
**CMS:** Sveltia CMS (Decap-compatible)
**Backend:** GitHub (`willylondon/lifestyle-hikers`, branch `main`)
**Source:** `admin/config.yml`

## Collection: Site Settings

| CMS Field | Name | Type | Required | Default | Source File | Used In | Backward Compat? |
|---|---|---|---|---|---|---|---|
| Site Title | `title` | string | yes | — | `_config.yml` | `_layouts/default.html` (seo), nav | ✅ |
| Site Description | `description` | string | yes | — | `_config.yml` | `_layouts/default.html` (seo, og) | ✅ |
| Default OG Image | `image` | image | no | — | `_config.yml` | `_layouts/default.html`, index.html | ✅ |
| Logo | `logo` | image | no | — | `_config.yml` | nav.html | ✅ |
| Base Total Hikes | `stats.base_total_hikes` | number | yes | 0 | `_config.yml` | hero.html, about.html, corporate.html | ✅ |
| Base Hikes This Year | `stats.base_hikes_this_year` | number | yes | 0 | `_config.yml` | hero.html | ✅ |
| Active Members | `stats.active_members` | number | yes | 0 | `_config.yml` | hero.html, about.html, corporate.html | ✅ |
| Trails Explored | `stats.trails_explored` | number | yes | 0 | `_config.yml` | hero.html, about.html | ✅ |
| Email | `email` | string | yes | — | `_config.yml` | footer.html, corporate.html | ✅ |
| Instagram URL | `social.instagram` | string | no | — | `_config.yml` | footer.html, instagram.html | ✅ |

## Collection: Blog Posts

| CMS Field | Name | Type | Required | Default | Source File | Used In | Backward Compat? |
|---|---|---|---|---|---|---|---|
| Title | `title` | string | yes | — | `_posts/*.md` (front matter) | `_layouts/post.html` | ✅ |
| Layout | `layout` | hidden | yes | `post` | `_posts/*.md` | Jekyll | ✅ |
| Description | `description` | string | no | — | `_posts/*.md` | `_layouts/post.html` (seo, og) | ✅ |
| Author | `author` | string | no | — | `_posts/*.md` | `_layouts/post.html` | ✅ |
| Date | `date` | datetime | yes | — | `_posts/*.md` | `_layouts/post.html`, blog.html | ✅ |
| Featured Image | `image` | image | no | — | `_posts/*.md` | `_layouts/post.html`, blog.html | ✅ |
| Categories | `categories` | list | no | — | `_posts/*.md` | blog.html (filtering) | ✅* |
| Tags | `tags` | list | no | — | `_posts/*.md` | (limited usage) | ✅ |
| Body | `body` | markdown | yes | — | `_posts/*.md` | `_layouts/post.html` | ✅ |

\* Categories used for blog filtering but may have inconsistent values.

## Collection: Trails

| CMS Field | Name | Type | Required | Default | Source File | Used In | Backward Compat? |
|---|---|---|---|---|---|---|---|
| Trail Name | `name` | string | yes | — | `_data/trails.yml` | trails.html, trail-*.html, hero.html | ✅ |
| Slug | `slug` | string | yes | — | `_data/trails.yml` | trail URL generation | ✅ |
| Parish | `parish` | string | yes | — | `_data/trails.yml` | trails.html (filter), trail-*.html | ✅ |
| Location | `location` | string | yes | — | `_data/trails.yml` | trail-*.html | ✅ |
| Difficulty | `difficulty` | select | yes | — | `_data/trails.yml` | trails.html, trail-*.html, hero.html | ✅ |
| Trail Status | `trail_status` | select | no | `not_verified` | `_data/trails.yml` | trail-*.html | ✅ (default safe) |
| Verification Level | `verification_level` | select | no | `planning` | `_data/trails.yml` | trail-*.html | ✅ (default safe) |
| Last Verified Date | `last_verified_date` | date | no | — | `_data/trails.yml` | trail-*.html | ✅ |
| Verification Source | `verification_source` | string | no | — | `_data/trails.yml` | trail-*.html | ✅ |
| Distance | `distance` | string | yes | — | `_data/trails.yml` | trails.html, trail-*.html | ✅ |
| Distance (km) | `distance_km` | number | no | — | `_data/trails.yml` | trail-explorer.js (sort/filter) | ✅ |
| Elevation | `elevation` | string | no | — | `_data/trails.yml` | trail-*.html | ✅ |
| Duration | `time` | string | yes | — | `_data/trails.yml` | trails.html, trail-*.html | ✅ |
| Duration (min) | `duration_minutes_min/max` | number | no | — | `_data/trails.yml` | trail-explorer.js | ✅ |
| Guide Requirement | `guide_requirement` | select | no | — | `_data/trails.yml` | trail-*.html | ✅ |
| River Crossing | `river_crossing` | select | no | — | `_data/trails.yml` | trail-*.html | ✅ |
| Route Type | `route_type` | select | no | — | `_data/trails.yml` | trail-*.html | ✅ |
| Preparation Note | `preparation_note` | text | no | — | `_data/trails.yml` | trails.html, trail-*.html | ✅ |
| Feature on Homepage | `featured` | boolean | no | false | `_data/trails.yml` | hero.html, trails.html | ✅ |
| Bookable | `bookable` | boolean | no | false | `_data/trails.yml` | trail-*.html | ✅ |
| Image | `image` | image | no | — | `_data/trails.yml` | trails.html, trail-*.html | ✅ |
| Image Width | `image_width` | number | no | 700 | `_data/trails.yml` | trail-*.html, trails.html | ✅ |
| Image Height | `image_height` | number | no | 500 | `_data/trails.yml` | trail-*.html, trails.html | ✅ |
| Alt Text | `alt` | string | no | — | `_data/trails.yml` | trail-*.html, trails.html | ✅ |

## Collection: Events / Hikes

| CMS Field | Name | Type | Required | Default | Source File | Used In | Backward Compat? |
|---|---|---|---|---|---|---|---|
| Event Name | `name` | string | yes | — | `_data/events.yml` | events.html, hikes.html | ✅ |
| Date | `date` | date | yes | — | `_data/events.yml` | events.html, hikes.html | ✅ |
| Location | `location` | string | yes | — | `_data/events.yml` | events.html, hikes.html | ✅ |
| Difficulty | `difficulty` | select | yes | — | `_data/events.yml` | events.html, hikes.html | ✅ |
| Departure Time | `departure_time` | string | no | — | `_data/events.yml` | hikes.html | ✅ |
| Distance | `distance` | string | no | — | `_data/events.yml` | events.html, hikes.html | ✅ |
| Event Status | `event_status` | select | no | auto-calculated | `_data/events.yml` | hikes.html (filtering) | ✅ |
| Spots | `spots` | number | no | — | `_data/events.yml` | events.html, hikes.html | ✅ |
| Spaces Remaining | `spaces_remaining` | number | no | — | `_data/events.yml` | hikes.html | ✅ |
| Transport Info | `transport_information` | string | no | — | `_data/events.yml` | hikes.html | ✅ |
| Meeting Point | `meeting_point` | string | no | — | `_data/events.yml` | hikes.html | ✅ |
| Price (JMD) | `price_jmd` | number | no | — | `_data/events.yml` | hikes.html | ✅ |
| Description | `description` | text | no | — | `_data/events.yml` | events.html, hikes.html | ✅ |
| Registration URL | `registration_url` | string | no | — | `_data/events.yml` | hikes.html | ✅ |
| Registration ID | `registration_id` | string | no | — | `_data/events.yml` | (automation) | ✅ |
| Flyer | `flyer` | image | no | — | `_data/events.yml` | (automation) | ✅ |
| Distribution Flag | `send_to_telegram` | boolean | no | — | `_data/events.yml` | scripts/ | ✅ |
| Distribution Flag | `send_to_brevo` | boolean | no | — | `_data/events.yml` | scripts/ | ✅ |
| Announcement Fields | `announcement_*` | various | no | — | `_data/events.yml` | scripts/ | ✅ |

## Collection: Gallery

| CMS Field | Name | Type | Required | Default | Source File | Used In | Backward Compat? |
|---|---|---|---|---|---|---|---|
| Image | `src` | image | yes | — | `_data/gallery.yml` | gallery.html | ✅ |
| Alt Text | `alt` | string | no | — | `_data/gallery.yml` | gallery.html | ✅ |
| Size | `size` | select | no | — | `_data/gallery.yml` | gallery.html (layout) | ✅ |

## Collection: Testimonials

| CMS Field | Name | Type | Required | Default | Source File | Used In | Backward Compat? |
|---|---|---|---|---|---|---|---|
| Name | `name` | string | yes | — | `_data/testimonials.yml` | testimonials.html | ✅ |
| Role | `role` | string | no | — | `_data/testimonials.yml` | testimonials.html | ✅ |
| Rating | `rating` | number | no | — | `_data/testimonials.yml` | testimonials.html | ✅ |
| Text | `text` | text | yes | — | `_data/testimonials.yml` | testimonials.html | ✅ |
| Avatar | `avatar` | image | no | — | `_data/testimonials.yml` | testimonials.html | ✅ |

## CMS Compatibility Risks

### Low Risk
- All fields use standard Decap widgets (string, text, image, boolean, number, select, date, datetime, list, markdown)
- No custom widgets or editor components
- GitHub backend is standard
- All data files use straightforward YAML lists/objects

### Medium Risk
- **Automation fields** (`send_to_telegram`, `send_to_brevo`, `announcement_*`) depend on external scripts that may break if field names change
- **Slug fields** on trails — changing a slug breaks existing URLs
- **CMS preview templates** (`admin/preview-templates.js`) may not reflect all current template logic

### High Risk
- **Trail page generator** (`_layouts/trail.html`) expects specific field names from `_data/trails.yml`; renaming fields breaks all 22 trail pages
- **Events page** (`hikes.html`) derives `event_status` from date if `event_status` field is missing; relying on this default behavior

## Field Migration Safety Rules

1. **Never rename existing fields** — add new fields alongside old ones
2. **Always provide Liquid defaults** — `{{ field | default: "..." }}` for new optional fields
3. **Use boolean with `false` default** — new boolean fields won't break old records
4. **Date fields accept any format** — YAML dates parse automatically
5. **Image fields** — CMS stores path, template renders with `relative_url`
6. **Never make optional fields required** after launch — old records need to remain valid

## Verification Checklist

- [x] CMS loads at /admin/
- [x] GitHub OAuth sign-in appears
- [x] Collections defined for all content types
- [x] Preview templates exist
- [x] Media folder configured
- [x] All required fields have defaults or are truly required
- [x] No field renames without backward compatibility
- [x] All new fields are optional
- [ ] CMS records open correctly (needs auth)
- [ ] Images upload correctly (needs auth)
- [ ] Preview renders correctly (needs auth)
