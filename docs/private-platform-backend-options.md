# Lifestyle Hikers — Private Platform Backend Options

**Date:** August 2, 2026
**Status:** Proposal — do not implement without explicit approval

## Context

The current Lifestyle Hikers site is a static Jekyll + GitHub Pages setup with no database, no authentication, and no private data storage. As the community grows, the following private-data needs will emerge:

- Member profiles and accounts
- Booking management
- Emergency contacts
- Medical information
- Waiver records
- Payment records
- Moderation tools
- Community trail reports

This document evaluates low-cost backend options for the **future**. None of these should be implemented in the current audit-improvement phase.

## Evaluation criteria

| Criterion | Weight | Notes |
|---|---|---|
| Free tier adequacy | High | Must support 50-200 active users initially |
| Authentication | High | Email/password + social OAuth |
| Row-level security | High | Must prevent data leaks between members |
| Private file storage | Medium | Waiver PDFs, member photos |
| Jamaica payment compatibility | Medium | JMD support, local payment methods |
| Jekyll integration ease | Medium | Static site remains the public face |
| Migration risk | High | How hard to move away later |
| Operating cost at scale | Medium | What happens at 500+ members |

## Options compared

### 1. Supabase
| Criterion | Assessment |
|---|---|
| Free tier | ✅ Generous (500MB DB, 1GB storage, 50K monthly active users) |
| Auth | ✅ Built-in (email, OAuth, magic link, phone) |
| Row-level security | ✅ PostgreSQL RLS, well-documented |
| File storage | ✅ Built-in storage buckets |
| Payments | ⚠️ No built-in payments; Stripe integration via Edge Functions |
| Jekyll integration | ✅ REST API + JavaScript SDK; can embed member portal as separate subdomain |
| Migration risk | ✅ Open-source; can self-host PostgreSQL; standard SQL |
| Operating cost | $25/mo Pro tier for larger usage |

**Verdict:** Strongest all-around option. Open-source, uses standard PostgreSQL, generous free tier.

### 2. Firebase (Google)
| Criterion | Assessment |
|---|---|
| Free tier | ✅ Spark plan: 1GB storage, 50K reads/day |
| Auth | ✅ Built-in (email, Google, phone, anonymous) |
| Row-level security | ✅ Firestore security rules |
| File storage | ✅ Cloud Storage |
| Payments | ⚠️ Stripe extension available |
| Jekyll integration | ✅ REST API + JS SDK |
| Migration risk | ⚠️ Vendor lock-in; NoSQL makes relational queries harder |
| Operating cost | Can get expensive quickly with reads |

**Verdict:** Good if already in Google ecosystem. NoSQL limitation for relational data (members, bookings, payments).

### 3. Appwrite
| Criterion | Assessment |
|---|---|
| Free tier | ✅ Self-hosted free; Cloud free tier: 75K MAU, 2GB storage |
| Auth | ✅ 30+ auth methods |
| Row-level security | ✅ Collection-level permissions |
| File storage | ✅ Built-in |
| Payments | ❌ No built-in payments |
| Jekyll integration | ✅ REST API + JS SDK |
| Migration risk | ✅ Open-source, self-hostable |
| Operating cost | $15/mo Cloud Pro |

**Verdict:** Good open-source option. Less mature ecosystem than Supabase.

### 4. Cloudflare D1 + Workers
| Criterion | Assessment |
|---|---|
| Free tier | ✅ D1: 5GB storage, 5M reads/day; Workers: 100K requests/day |
| Auth | ⚠️ Must build or use Cloudflare Access |
| Row-level security | ⚠️ Must implement in Worker code |
| File storage | ✅ R2 storage |
| Payments | ❌ No built-in |
| Jekyll integration | ✅ Workers can serve API endpoints |
| Migration risk | ⚠️ D1 is SQLite-based, not standard PostgreSQL |
| Operating cost | $5/mo Workers Paid |

**Verdict:** Very cheap but requires more custom development. SQLite limits relational complexity.

### 5. Airtable (as operational system)
| Criterion | Assessment |
|---|---|
| Free tier | ✅ 1,000 records/base, 1GB attachments |
| Auth | ⚠️ No user auth; team-only |
| Row-level security | ❌ Not designed for per-user data isolation |
| File storage | ✅ Attachment fields |
| Payments | ❌ No built-in |
| Jekyll integration | ✅ REST API |
| Migration risk | ✅ Easy CSV export |
| Operating cost | $20/user/mo for Team plan |

**Verdict:** Good for internal ops (event planning, member tracking spreadsheet replacement). NOT suitable for member-facing private data.

### 6. Secure form providers (Tally, Fillout, Jotform)
| Criterion | Assessment |
|---|---|
| Free tier | ✅ Most have generous free tiers |
| Auth | ❌ No user accounts; form submissions only |
| Row-level security | ❌ Not applicable |
| File storage | ✅ File upload fields |
| Payments | ✅ Some have payment integrations (Stripe) |
| Jekyll integration | ✅ Embed forms via iframe or link |
| Migration risk | ✅ Export submissions to CSV |
| Operating cost | $0-$30/mo for paid plans |

**Verdict:** Best for the **current phase** — collecting bookings, enquiries, and member signups without building a backend at all.

## Recommended architecture

### Current phase (today)
```
┌─────────────────────────────┐
│  Jekyll static site         │  ← Public content (trails, events, blog)
│  GitHub Pages               │
│  Sveltia CMS                │
└─────────────────────────────┘
         │
         │ Links to external forms
         ▼
┌─────────────────────────────┐
│  Tally / Fillout / Jotform  │  ← Private submissions
│  (bookings, enquiries)      │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Telegram / WhatsApp        │  ← Community communication
└─────────────────────────────┘
```

### Future phase (proposed, not approved)
```
┌─────────────────────────────┐
│  Jekyll static site         │  ← Public content
│  lifestylehikers.com        │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Supabase backend           │  ← Private data
│  app.lifestylehikers.com    │     - Member profiles
│  (or /app/ subfolder via    │     - Bookings
│   Netlify/Vercel rewrite)   │     - Emergency contacts
│                             │     - Payments (Stripe)
│                             │     - Waivers
│                             │     - Community reports
└─────────────────────────────┘
```

## Recommendation

1. **Stay with external forms** (Tally/Fillout) for private bookings and enquiries during this improvement phase
2. **Design the CMS fields** to support linking to external booking providers
3. **When the community hits ~100 active requesting members**, evaluate Supabase as the primary private backend
4. **Do not build private member storage into the Jekyll/GitHub repo**

## Cost projection

| Phase | Monthly cost |
|---|---|
| Current (static + form providers) | $0 |
| Future (Supabase free tier + custom domain) | $0-25 |
| Scaling (Supabase Pro + increased usage) | $25-75 |
