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

Open **Upcoming Hikes → Upcoming Hikes List**.

- Use a real calendar date.
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
- Public page is checked after GitHub Pages finishes rebuilding.

