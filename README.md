# Lifestyle Hikers

Production website and Git-based content system for [LifestyleHikers.com](https://www.lifestylehikers.com).

## Architecture

- Jekyll 4.3 static site
- Liquid, HTML, CSS, and vanilla JavaScript
- Sveltia CMS with a GitHub backend
- YAML/Markdown content stored in this repository
- GitHub Pages hosting
- GitHub Actions for image optimization and content-distribution webhooks

There is no application database or server backend. Do not store bookings, emergency contacts, medical information, payment records, or private member profiles in this repository.

## Local setup

Use a current Ruby version compatible with Bundler 4 and the checked-in lockfile. The project should declare and enforce the exact supported version before production development continues.

```sh
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000`.

Production build:

```sh
JEKYLL_ENV=production bundle exec jekyll build
```

## Content management

The CMS is available at `/admin/`. Authorized editors sign in with GitHub and edit:

- Homepage counters
- Blog posts
- Hike/event listings
- Gallery images
- Trails
- Reviews/testimonials

See:

- [CMS guide](README-CMS.md)
- [Admin guide](docs/admin-guide.md)
- [Content schema](docs/content-schema.md)
- [CMS compatibility plan](docs/cms-compatibility-plan.md)

## Automation

Repository workflows optimize CMS images and send selected event/blog payloads to n8n or Telegram. Copy `.env.example` for local dry-run variable names; never commit real secrets.

See [API and integration documentation](docs/api-integrations.md).

## Testing

Run syntax/content/build checks and then test the rendered site on desktop and mobile. The full release gate is in [docs/testing-plan.md](docs/testing-plan.md).

## Platform upgrade

The current architecture and risks are documented in [docs/current-site-audit-2026-08.md](docs/current-site-audit-2026-08.md). Private booking, account, payment, waiver, emergency-contact, and moderated-report features require a private backend and authorization layer; they must not be implemented as public Git content.

## August 2026 audit & improvements

Branch: `feature/current-site-audit-and-platform-improvements`

Key documents:
- [Current site audit](docs/current-site-audit-2026-08.md)
- [CMS compatibility matrix](docs/current-cms-compatibility-matrix.md)
- [Implementation plan](docs/current-implementation-plan.md)
- [Testing report](docs/current-testing-report.md)
- [Private backend options](docs/private-platform-backend-options.md)
- [Rollback plan](docs/rollback-plan.md)

