# Database and Data Migration Plan

## Current state

The project has no database. Public content is stored in Git as YAML, Markdown, configuration, and media files.

## Discovery MVP

No database migration is required. Data evolution will be an additive Git-content migration:

1. Tag or record the pre-migration commit.
2. Add optional CMS fields.
3. Keep legacy presentation fields.
4. Add numeric metric fields alongside legacy strings.
5. Validate every existing record.
6. Render old and enriched records in the same build.
7. Commit data normalization separately from template changes.

## Future private platform

Booking, membership, payment, waiver, emergency-contact, and report data require a private relational backend. Provider selection is intentionally deferred.

Minimum future entities:

- `users`
- `member_profiles`
- `trails`
- `hike_events`
- `bookings`
- `payment_records`
- `waivers`
- `emergency_contacts`
- `trail_reports`
- `report_media`
- `saved_trails`
- `audit_events`

Minimum safeguards:

- Role-based authorization
- Row-level access controls where supported
- Encrypted transport and provider-managed encryption at rest
- Strict separation of public and private fields
- Capacity updates inside transactions
- Idempotent booking references
- Consent timestamps and versioned waiver text
- Retention/deletion rules for medical and emergency data
- Admin audit trail
- Export and backup verification

## Migration stages for a future backend

1. Approve provider, data residency, cost, and operational ownership.
2. Define schema and privacy classification.
3. Create versioned migrations.
4. Seed only public trail/event identifiers; do not copy private Google Form data without consent and a documented transfer.
5. Run representative fixtures.
6. Add server APIs and authorization tests.
7. Shadow-test booking capacity and status.
8. Pilot with non-production events.
9. Preserve the existing join and registration links during rollout.
10. Cut over only after rollback and export tests pass.

## Rollback

The static MVP rolls back through Git revert. A future database rollout must include down migrations where safe, forward-fix procedures where destructive rollback is unsafe, and point-in-time recovery verification.

