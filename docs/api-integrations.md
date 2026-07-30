# API and Integration Reference

The public website has no server API.

## Google Forms: community join

Source: `_includes/contact.html`

The browser posts form-encoded fields directly to a Google Forms `formResponse` URL using `mode: no-cors`. The website cannot inspect the HTTP response and must not claim confirmed storage solely from that request.

Data includes name, email, optional phone/WhatsApp, hiking experience, and referral source. Add clear privacy/retention language before collecting production data.

## Google Forms: merchandise

Source: `_includes/merch.html`

The order button opens an external Google Form. Inventory/payment/order status are outside this repository.

## n8n content distribution

Sources:

- `.github/workflows/content-distribution-webhook.yml`
- `.github/workflows/notify-n8n-blog-publish.yml`
- `scripts/build_content_distribution_payload.rb`
- `scripts/notify_n8n_blog_posts.rb`

Events and eligible blog posts produce JSON payloads. Requests use HTTPS and a shared `X-LH-SECRET`/`x-lh-secret` header.

Required configuration:

- `N8N_CONTENT_WEBHOOK_URL`
- `LH_WEBHOOK_SECRET` for `content-distribution-webhook.yml`
- `N8N_WEBHOOK_SECRET` for `notify-n8n-blog-publish.yml`

The two secret names must not be treated as interchangeable without checking repository settings and the n8n verifier.

## Telegram fallback

Sources:

- `.github/workflows/send-telegram-blog-notification.yml`
- `scripts/notify_telegram_blog_posts.rb`

Uses the Telegram Bot API with:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- optional `TELEGRAM_MESSAGE_THREAD_ID`

The manual workflow should remain disabled unless an administrator intentionally dispatches it, preventing duplicate notifications.

## Image optimization

Source: `.github/workflows/optimize-cms-images.yml`

On matching pushes, Python invokes ImageMagick and WebP tools, writes optimized variants, rewrites matching content references, and commits changes as `github-actions[bot]`.

## Analytics and embedded services

- Google Analytics
- Ahrefs Web Analytics
- Curator.io Instagram feed
- Sveltia CMS
- Google Fonts
- Font Awesome/cdnjs
- Unsplash

There is no consent manager or Content Security Policy in the current repository.

## Future API boundary

Booking/member/report APIs must be server-side, authenticated, authorized, validated, rate-limited, and backed by private storage. Static client code must never hold privileged service keys.

