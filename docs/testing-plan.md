# Testing Plan

## Baseline

The baseline evidence and current failures are recorded in `docs/lifestyle-hikers-audit.md`.

## Required automated checks

### Content integrity

- Parse `_config.yml` and every `_data/*.yml` file.
- Parse front matter for every post/page.
- Fail on duplicate generated public URLs.
- Fail on missing locally referenced assets.
- Validate trail/event enum values.
- Validate non-negative statistics/capacity/pricing.
- Validate metric ranges when numeric fields are present.

### Build

- Use a declared supported Ruby version.
- Install from `Gemfile.lock`.
- Run `bundle exec jekyll build`.
- Fail on Liquid/YAML warnings relevant to content.
- Confirm sitemap and expected routes exist in `_site`.

### Script checks

- Ruby syntax and dry runs for distribution scripts.
- Python syntax and optimizer dry run.
- JavaScript syntax checks.

### Browser and accessibility

Test desktop (at least 1280×720), tablet (768×1024), and mobile (390×844):

- Page identity and non-blank content
- No framework/error overlay
- No relevant console error/warning
- Keyboard skip link
- Mobile menu open/close, Escape, focus, and link activation
- Trail search/filter/sort and empty state
- Trail detail actions
- Hike status filters and registration links
- Join validation and honest network-error state
- Recovery report validation/generation
- Visible focus and reduced motion
- Automated axe/WCAG checks when tooling is added

## Critical end-to-end flows

### Available in static MVP

1. Homepage → Find a Trail → filter → trail detail → registration/private-hike link.
2. Homepage → Book a Hike → `/hikes/` → status filter → external registration link.
3. CMS login → edit trail/event → upload image → publish → GitHub Pages update.
4. Blog create/edit → publish → public page → distribution dry run.

### Deferred until private backend exists

- Booking creation/confirmation/payment state
- Admin attendee/payment/export flow
- Member account and saved-trail persistence
- Moderated community report flow

## Manual test data

Use:

- One legacy trail with only current fields
- One fully enriched trail
- One upcoming event
- One sold-out event
- One cancelled event
- One completed event
- A newly entered event with a past date and `event_status: auto`; it must render under Completed.
- A past legacy event still marked `upcoming`; it must render under Completed.
- Confirm **Add Hike** appears above the event list and new event cards are collapsed by default in the CMS.
- One event with no price/registration URL
- One post with a custom permalink
- One post using the default permalink

Never submit real personal, medical, emergency, or payment data during testing.

## Release gate

A release is blocked if:

- Jekyll build fails or warns about invalid front matter.
- Any existing public URL disappears without a documented redirect.
- CMS legacy records cannot be edited.
- CMS media paths change.
- Mobile navigation hides controls.
- Forms falsely report success.
- Private data is written to Git.
- Critical desktop/mobile flows fail.
