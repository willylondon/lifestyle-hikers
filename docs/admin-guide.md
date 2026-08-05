# Administrator Guide

## Sign in

1. Open `https://www.lifestylehikers.com/admin/`.
2. Choose **Sign In with GitHub**.
3. Use a GitHub account that has write access to `willylondon/lifestyle-hikers`.

Access-token sign-in should be used only under an approved administrator procedure. Never paste a token into documentation, issues, content fields, or screenshots.

## Edit homepage counters

Open **Site Settings → Homepage Counters**. Use non-negative whole numbers. Total/year hike counts combine the configured baseline with dated event records, so confirm totals before publishing.

## Manage trails

Open **Trails → Featured Trails**.

- Preserve an existing trail’s name and future slug unless a redirect is prepared.
- Use metric values for new normalized fields when available.
- Do not claim that a condition is live.
- Provide a meaningful image description.
- Use “not recorded”/“not verified” rather than guessing.

## Manage hikes/events

Open **Hikes & Events → Hike Schedule**.

- Use **Add Hike** at the top of the list; new entries open above existing records.
- Use a real calendar date.
- Past dates are allowed. Keep **Event Status** on `auto` unless the hike is sold out, members-only, cancelled, or needs another explicit exception.
- A past date is displayed as completed even if an older record still contains `upcoming`, `sold_out`, or `members_only`.
- For a quick past-hike record, only name, date, location, and difficulty are required. Add the recap details later when time allows.
- Keep meeting/time details unambiguous.
- `spots` is manually managed display data; it is not linked to bookings.
- Add a real registration URL before presenting an event as bookable.
- Set distribution to `ready` only when the announcement should be sent.
- Do not store attendee, payment, emergency, medical, or waiver data in the event record.

## Manage blog posts

- Use a unique, lowercase hyphenated slug.
- Add a 140–160-character SEO description.
- Quote titles containing a colon when editing YAML outside the CMS.
- Confirm a valid date, category, image/alt text, and unique URL.
- Use `draft` distribution state while editing.
- Preview before publishing.

## Images

- Upload images through CMS fields.
- Prefer an appropriately sized JPEG, PNG, or WebP.
- Avoid original files larger than necessary.
- Keep meaningful filenames and alt text.
- Do not upload private documents, IDs, medical information, attendee exports, or payment evidence.

## Reviews and gallery

- Publish only genuine, authorized testimonials.
- Do not invent ratings or review counts.
- Add descriptive gallery alt text.

## Rollback

Git history is the version record. If a content publish is wrong, contact the repository administrator to revert or restore the affected file. Do not delete and recreate established posts merely to change copy, because that can disrupt URLs and automation IDs.

## Pre-publish checklist

- Preview renders.
- URL/slug is unique.
- Dates and units are correct.
- Image and alt text are present where needed.
- No private data or secrets are included.
- Distribution status is intentional.
- Past hikes appear under Completed, not Upcoming.
- Public page is checked after GitHub Pages finishes rebuilding.
