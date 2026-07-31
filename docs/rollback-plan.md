# Rollback Plan

## Branch and release controls

- Develop on `feature/lifestyle-hikers-platform-upgrade`.
- Do not commit directly to `main`.
- Keep content repair, CMS schema, UI, and documentation changes in separate commits.
- Record the last known-good production commit before deployment.

## Static site rollback

1. Revert the failing logical commit on the feature/release branch.
2. Run the production build and smoke tests.
3. Merge the revert through the normal review path.
4. Confirm GitHub Pages redeploys the prior routes/content.

Do not rewrite history or force-push `main`.

## CMS data rollback

- Restore `_config.yml`, `_data/*.yml`, or affected `_posts/*.md` from the last known-good commit.
- Keep new fields optional so old records remain renderable.
- Do not delete original images during the first migration.
- If the CMS cannot open a new schema, revert `admin/config.yml` and preview-template changes together.

## Automation rollback

- Enable `CONTENT_DISTRIBUTION_DRY_RUN=true` before testing payload changes.
- Revert workflow and script changes as one logical unit.
- Keep duplicate-protection announcement IDs stable.
- Do not resend notifications during rollback unless an administrator explicitly requests it.

## Route rollback

- Keep old routes and redirect pages.
- If a new page fails, remove its navigation link first while preserving existing pages.
- Never remove an indexed URL without a permanent replacement/redirect plan.

## Future backend rollback

No backend is part of the static MVP. A future backend release must document:

- Database backup identifier
- Migration version
- Forward-fix and rollback conditions
- Secret/config rollback
- Read-only maintenance mode
- Export/reconciliation of bookings created during the release window

