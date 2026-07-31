# Content Schema Reference

## Storage model

Public content is committed to Git and rendered by Jekyll at build time. Fields not listed as required must be treated as optional by templates.

## Site statistics

File: `_config.yml`  
CMS: Site Settings → Homepage Counters

| Field | Type | Meaning |
| --- | --- | --- |
| `stats.base_total_hikes` | non-negative integer | Historical baseline added to completed event records |
| `stats.base_hikes_this_year` | non-negative integer | Annual baseline added to current-year completed event records |
| `stats.active_members` | non-negative integer | CMS-managed display count |
| `stats.trails_explored` | non-negative integer | CMS-managed display count |

## Trails

File: `_data/trails.yml`  
Root: `items`

Current required display fields:

- `name`
- `location`
- `difficulty`: `easy`, `moderate`, or `hard`
- `distance`
- `elevation`
- `time`
- `rating`
- `stars`
- `half_star`
- `reviews`
- `image`
- `alt`

Optional image dimensions:

- `image_width`
- `image_height`

Planned additive fields and defaults are defined in `docs/cms-compatibility-plan.md`.

## Events/hikes

File: `_data/events.yml`  
Root: `items`

Current core fields:

- `name`
- `location`
- `difficulty`
- `date` (`YYYY-MM-DD`)
- `time` (legacy free-text time and/or meeting point)
- `distance`
- `spots`
- `description`

Optional public/automation fields:

- `flyer`
- `registration_url`
- `distribution_status`: `draft`, `ready`, `sent`, or `failed`
- `announcement_id`
- `send_to_telegram`
- `send_to_brevo`
- `announcement_sent_at`
- `telegram_sent`
- `brevo_sent`
- `telegram_message_id`
- `brevo_message_id`
- `announcement_error`

`spots` is CMS-managed display data, not transactional availability.

## Blog posts

Folder: `_posts/`

CMS-created posts use:

- `title`
- `slug`
- `description` (optional)
- `date`
- `author`
- `category`
- `location` (optional)
- `image` (optional)
- `tags` (optional list)
- `body`
- distribution fields matching the CMS configuration

Legacy/automated posts may use `categories`, `excerpt`, `canonical`, `permalink`, and `published`. Templates and validators must support both legacy and CMS-created records.

## Gallery

File: `_data/gallery.yml`  
Fields: `image`, `alt`, optional `size` (`""`, `tall`, `wide`).

## Testimonials

File: `_data/testimonials.yml`  
Fields: `name`, `handle`, `text`, optional `avatar`, optional integer `rating` from 1 to 5.

## Private data prohibition

Public Git content must not contain attendee lists, emergency contacts, medical details, payments, waiver signatures, private profiles, or precise private report locations.

