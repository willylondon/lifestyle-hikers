# CMS Compatibility Plan

## Compatibility contract

Sveltia CMS remains the public-content source of truth. Existing collections, files, field names, media paths, branch, repository, and public URLs remain valid.

The first implementation will:

- Add fields as optional.
- Supply defaults in Liquid rather than rewriting old records.
- Keep existing `location`, `distance`, `elevation`, `time`, `spots`, and distribution fields.
- Preserve all blog permalinks and legacy redirects.
- Avoid storing private user data in Git.
- Validate old records before making any new field required.

## Existing collections preserved

1. Site Settings / Homepage Counters
2. Blog Posts
3. Upcoming Hikes
4. Gallery
5. Trails
6. Reviews

Collection names and backing files will not change in the first phase.

## Proposed optional trail fields

| Field | Type | Default/fallback |
| --- | --- | --- |
| `slug` | string | Slugified `name` at render time |
| `parish` | select/string | Derived/displayed from `location` only when missing |
| `summary` | text | Empty |
| `distance_km` | number | Parse/display legacy `distance` unchanged when missing |
| `elevation_gain_m` | number | Display legacy `elevation` when missing |
| `duration_minutes_min` | integer | Display legacy `time` when missing |
| `duration_minutes_max` | integer | Same as minimum when missing |
| `route_type` | select | `unknown` |
| `trail_status` | select | `unknown` |
| `last_verified_date` | date | Not verified |
| `river_crossing` | boolean | `false`, labelled “not recorded” for old records where needed |
| `guide_requirement` | select | `not_recorded` |
| `preparation_note` | text | Empty |
| `water_litres` | number | Empty |
| `footwear` | string | Empty |
| `equipment` | list | Empty |
| `known_hazards` | list | Empty |
| `trailhead` | text | Empty |
| `directions` | text | Empty |
| `parking` | text | Empty |
| `mobile_coverage` | text | Empty |
| `map_url` | string | Empty |
| `guide_url` | string | Empty |
| `popularity` | integer | `0`; do not infer from unsupported review counts |

No condition will be described as real-time. Unknown fields will render as “Not yet verified” or be omitted.

## Proposed optional event fields

| Field | Type | Default/fallback |
| --- | --- | --- |
| `slug` | string | Name/date-derived at render time |
| `trail_slug` | string | Empty; legacy free-text name/location remain |
| `event_status` | select | Derived from date: upcoming/completed |
| `capacity` | integer | Legacy `spots` when available |
| `spaces_remaining` | integer | Legacy `spots`; labelled as CMS-managed, not live inventory |
| `price_jmd` | number | Empty / contact organizer |
| `booking_deadline` | datetime | Empty |
| `meeting_point` | string | Legacy `time` remains visible |
| `departure_time` | string | Legacy `time` remains visible |
| `transport_information` | text | Empty |
| `members_only` | boolean | `false` |
| `payment_methods` | list/select | Manual/contact organizer |
| `waitlist_url` | string | Empty |
| `private_hike_url` | string | Empty |

`registration_url` remains the booking action. No CMS value will be represented as transactional availability unless a later backend owns that value.

## Statistics compatibility

Current baseline fields remain:

- `base_total_hikes`
- `base_hikes_this_year`
- `active_members`
- `trails_explored`

Templates will clamp invalid negative values to zero and avoid showing totals that conflict with derived completed events. Schema widgets will add `min: 0`.

## Blog compatibility

- Preserve folder, filename convention, `slug`, and `permalink`.
- Quote YAML strings containing colons.
- Require a valid closing front-matter delimiter.
- Detect duplicate generated URLs in CI.
- Do not delete duplicate files automatically.
- Resolve collisions by editorially selecting the canonical article and marking later duplicates `published: false` until rewritten with a unique purpose and URL.

## Media compatibility

- Keep `media_folder: assets/images/uploads`.
- Keep `public_folder: /assets/images/uploads`.
- Do not move or delete existing images.
- Add editor guidance for WebP/JPEG/PNG, maximum dimensions, and maximum upload size.
- Continue generating optimized variants.
- Test encoded paths and filenames containing spaces before any rewrite.

## Auth and publishing compatibility

- Keep the GitHub backend, repository, and `main` branch.
- Do not remove GitHub collaborator requirements.
- Do not enable an editorial workflow without testing the team’s current publish process.
- Keep automation fields used by n8n/Telegram.
- Consolidate webhook-secret documentation without changing a working secret name silently.

## Private-data boundary

The following must never be added to public Git-backed CMS files:

- Booking attendee lists
- Emergency contacts
- Medical information
- Payment confirmations or bank references
- Private member profiles
- Precise reporter locations
- Waiver records/signatures

Those require a private backend with authorization, retention, audit, and deletion controls.

## Compatibility test gate

Before merging any schema extension:

1. Parse all YAML and Markdown front matter.
2. Open each CMS collection schema.
3. Render a record containing only legacy fields.
4. Render a record containing the new fields.
5. Confirm public URLs are unchanged.
6. Confirm image upload paths are unchanged.
7. Dry-run distribution payloads.
8. Build the production site.
9. Test admin edit/publish with an authorized test account.

