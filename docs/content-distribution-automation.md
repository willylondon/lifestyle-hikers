# Lifestyle Hikers Content Distribution Automation

This repo now supports a single source-of-truth flow for announcing hikes and blog posts from the CMS.

## Architecture

```text
Sveltia/Decap CMS
  -> GitHub commit to main
  -> Content Distribution Webhook GitHub Action
  -> scripts/build_content_distribution_payload.rb
  -> n8n webhook
  -> Telegram and Brevo
```

Hikes live in `_data/events.yml`.
Blog posts live in `_posts/`.

The website does not render the new automation fields. Existing homepage hike cards and blog pages should continue to behave the same way.

## Existing n8n Workflows To Audit

The local second brain notes list two related live workflows:

- `Hike Announcement Auto-Broadcaster`, workflow ID `IlWbcMoDLTHVDPKE`
- `Lifestyle Hikers Telegram Updates`, workflow ID `uMs9wPpFYVksCxfz`

Before changing live n8n behavior, audit both workflows and decide whether to merge, replace, or preserve their current responsibilities.

## Required GitHub Secrets

Set these in the GitHub repository settings:

- `N8N_CONTENT_WEBHOOK_URL`: production n8n webhook URL for the content distributor workflow
- `LH_WEBHOOK_SECRET`: shared secret checked by n8n from the `X-LH-SECRET` header
- `LIFESTYLE_HIKERS_SITE_URL`: usually `https://www.lifestylehikers.com`

Optional GitHub repository variable:

- `CONTENT_DISTRIBUTION_DRY_RUN`: set to `true` while testing

## CMS Fields

Hikes have these optional automation fields:

- `flyer`
- `registration_url`
- `distribution_status`
- `announcement_id`
- `send_to_telegram`
- `send_to_brevo`
- `announcement_sent_at`
- `telegram_sent`
- `brevo_sent`
- `telegram_message_id`
- `brevo_message_id`
- `announcement_error`

Blog posts have these optional automation fields:

- `distribution_status`
- `announcement_id`
- `send_to_telegram`
- `send_to_brevo`
- `announcement_sent_at`
- `telegram_sent`
- `brevo_sent`
- `telegram_message_id`
- `brevo_message_id`
- `announcement_error`

## Publishing A Hike Announcement

1. Open the CMS.
2. Edit `Upcoming Hikes`.
3. Fill in the normal hike details.
4. Add a flyer and registration link if available.
5. Set `Distribution Status` to `Ready`.
6. Leave `Send to Telegram` on.
7. Leave `Send to Brevo` on if the email should go out.
8. Publish the CMS change.

The GitHub Action will only build payloads for hikes where `distribution_status: ready`.

## Publishing A Blog Telegram Announcement

1. Open the CMS.
2. Create or edit a blog post.
3. Add the title, slug, date, description, image, and body.
4. Set `Distribution Status` to `Ready`.
5. Leave `Send to Telegram` on.
6. Leave `Send to Brevo` off unless blog email delivery has been explicitly configured in n8n.
7. Publish the CMS change.

The GitHub Action only builds blog payloads for changed blog posts where `distribution_status: ready`.

## Dry Run

Dry run mode builds payloads without sending to n8n.

Use one of these:

- Run the workflow manually and leave `dry_run` as `true`.
- Set the repository variable `CONTENT_DISTRIBUTION_DRY_RUN` to `true`.

Local dry-run examples:

```bash
ruby scripts/build_content_distribution_payload.rb --root . --changed-files "_data/events.yml"
ruby scripts/build_content_distribution_payload.rb --root . --changed-files "_posts/2026-02-15-kwame-falls-first-hike-2026.md"
```

## n8n Webhook Contract

n8n should:

- Accept `POST` requests from the GitHub Action.
- Validate the `X-LH-SECRET` header.
- Reject missing or invalid shared secrets.
- Route by `content_type`.
- Check duplicate sends by `announcement_id`.
- Send Telegram for hikes and blogs when `send_to_telegram` is true.
- Send Brevo for hikes when `send_to_brevo` is true.
- Keep Brevo disabled for blog posts unless intentionally configured.
- Log every result safely without storing secrets.

Recommended log fields:

- `announcement_id`
- `content_type`
- `title` or `name`
- `source_file`
- `source_commit_sha`
- `telegram_status`
- `telegram_message_id`
- `brevo_status`
- `brevo_message_id`
- `sent_at`
- `last_error`

## Telegram Behavior

For hikes:

```text
New Lifestyle Hikers Adventure

{{name}}

Date: {{date}}
Time: {{time}}
Location: {{location}}
Difficulty: {{difficulty}}
Distance: {{distance}}
Spots: {{spots}}

{{description}}

Register:
{{registration_url}}
```

For blogs:

```text
New Lifestyle Hikers Blog Post

{{title}}

{{description}}

Read here:
{{url}}
```

If an image exists, n8n should use Telegram `sendPhoto`.
If no image exists, n8n should use Telegram `sendMessage`.

## Brevo Behavior

For hikes, Brevo email should include:

- hike name
- flyer image if available
- date
- time
- location
- difficulty
- distance
- spots
- description
- registration link

Use test-recipient mode before sending to the live list.

## Duplicate Protection

The GitHub Action may rerun, and CMS edits may happen more than once. n8n must treat `announcement_id` as the idempotency key.

If the same `announcement_id` has already succeeded, n8n should skip sending and return a safe success response.

## Troubleshooting

If nothing sends:

- Confirm `distribution_status` is exactly `ready`.
- Confirm the changed file is `_data/events.yml` or a file inside `_posts/`.
- Confirm the GitHub Action was not in dry-run mode.
- Confirm `N8N_CONTENT_WEBHOOK_URL` and `LH_WEBHOOK_SECRET` are set.
- Confirm the n8n workflow is active and its production webhook URL is being used.

If Telegram fails:

- Confirm the `Lifestyle Hikers Bot` credential still exists in n8n.
- Confirm the bot is still admin in the target Telegram channel.
- Confirm the Telegram chat ID is correct.

If Brevo fails:

- Confirm the Brevo credential still exists in n8n.
- Confirm the sender is verified.
- Confirm the workflow is using a test recipient before live list delivery.
