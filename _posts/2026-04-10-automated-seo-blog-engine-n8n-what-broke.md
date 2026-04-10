---
title: "I Built an Automated SEO Blog Engine for 5 Sites — Here's What Actually Broke"
date: 2026-04-10
slug: automated-seo-blog-engine-n8n-what-broke
layout: post
migrated_from: medium
---

# I Built an Automated SEO Blog Engine for 5 Sites — Here's What Actually Broke

> Using n8n, OpenAI, and GitHub to publish SEO content automatically — and the debugging session nobody tells you about.

I spent today wiring up something I've been thinking about for a while: a single n8n workflow that generates, formats, and publishes SEO blog posts to five different websites — automatically, every Monday morning.

One trigger. One AI writer. Five publishing destinations.

The idea was clean. The execution was messier. The lessons were worth it.

---

## What I Built

The SEO Content Factory is a 9-node n8n pipeline:

**Schedule → Keyword → Site Router → Generate Outline → Write Post → Format Adapter → GitHub Commit → Tweet → Telegram**

Every Monday at 9 AM it:
1. Picks a target keyword for a specific site
2. Generates an SEO-optimized outline with GPT-4o-mini
3. Writes a 2000+ word post
4. Converts it to the correct format for that site's architecture
5. Commits it to GitHub (which auto-deploys)
6. Posts a promo tweet
7. Sends a Telegram notification

One workflow. Five sites. Zero manual publishing.

---

## The Problem: Five Sites, Five Architectures

Here's where it gets interesting. The five sites run completely different publishing systems:

| Site | Stack | Expected Format |
|------|-------|-----------------|
| Farika Atkins | Jekyll / GitHub Pages | `.md` with Jekyll frontmatter |
| Lifestyle Hikers | Jekyll / GitHub Pages | `.md` with Jekyll frontmatter |
| The Creative Technician | Jekyll / GitHub Pages | `.md` with Jekyll frontmatter |
| Master Bryan Kukibo | Plain static HTML | Full standalone `.html` file |
| The Source Arena JA | Custom Node.js SSG | `.md` with specific gray-matter fields |

The AI writes everything in Markdown. That's fine for Jekyll sites. But Bryan's site is just raw HTML files served by GitHub Pages — no build step. Drop a `.md` file in his `blog/` folder and the browser renders it as a wall of raw text.

So I added a **Format Adapter** node — middleware that takes the AI's Markdown output and converts it to whatever each destination site actually needs, before committing to GitHub.

---

## Bug 1: The Silent Domain Detection Failure

The Format Adapter reads which site it's processing like this:

```js
const routerData = $node['Site Router'].json;
const domain = routerData.site_config?.domain || '';
```

This works in n8n expression fields. It does **not** reliably work inside Code nodes.

When `$node['Site Router']` returns `undefined` inside a Code node sandbox, `domain` becomes an empty string. The code falls into the else-branch and passes the raw Markdown through untouched. That raw Jekyll Markdown then gets committed to Bryan's repo with an `.html` extension — correct filename, completely wrong content.

The fix is to use the proper Code node API with multiple fallback layers:

```js
let domain = '';

// Layer 1: correct Code node syntax
try { domain = $('Site Router').first().json?.site_config?.domain || ''; } catch(e) {}

// Layer 2: legacy $node syntax
if (!domain) {
  try { domain = $node['Site Router']?.json?.site_config?.domain || ''; } catch(e) {}
}

// Layer 3: check if data was forwarded through $json
if (!domain) domain = $json.site_config?.domain || '';
```

n8n has two separate evaluation contexts: the expression context (node parameters) and the Code node JS runtime. They don't share the same accessor API. This is the kind of thing that bites you — a 200 OK from GitHub while the deployed content is completely broken.

---

## Bug 2: The Roman Numeral Regex Problem

The AI sometimes structures posts with Roman numeral section headers:

```
## VI. Image Placement Suggestions
## VIII. Meta Details
## IX. Internal Links
```

My cleanup regex was:

```js
body = body.replace(/## Image (Suggestions|Placement)[\s\S]*?(?=## |$)/gi, '');
```

This looks for headings that **start** with `## Image`. It completely misses `## VI. Image Placement Suggestions` because the Roman numeral comes first.

The fix — make the prefix optional:

```js
const PREFIX = '(?:[IVX]+\\.|[0-9]+\\.)?\\s*';
body = body.replace(new RegExp('##\\s+' + PREFIX + 'Image\\s+(?:Placement\\s+)?Suggestions?[\\s\\S]*?(?=##\\s|$)', 'gi'), '');
```

Your regex should handle whatever the model decides to generate on a given day. The AI is not consistent with its output structure. Build defensively.

---

## Bug 3: n8n REST API Strips Credentials Silently

This one cost me the most time.

When you update a workflow via `PUT /workflows/{id}`, the n8n API **silently removes all credential bindings** from nodes if the `credentials` field is not included in your JSON payload.

A credential binding on a node looks like this:

```json
{
  "credentials": {
    "googleSheetsOAuth2Api": {
      "id": "HVNzZnwvqx321S1M",
      "name": "Google Sheets account"
    }
  }
}
```

Omit that object when you PUT the workflow back, and the node silently loses its credentials. The workflow looks fine in the UI. The trigger fires correctly. But every credentialed node fails at runtime with an auth error — with no warning during the update.

**The fix:** Always `GET` the full workflow first, modify only what you need, and PUT the complete object back with the `credentials` field intact on every node.

---

## What's Working Now

- SEO posts generate and deploy every Monday for all 5 sites
- Bryan's site gets proper standalone HTML with dark theme, Russo One font, red #e30613 accents
- The Source Arena gets gray-matter frontmatter for the custom SSG
- Jekyll sites get standard frontmatter pass-through
- A promo tweet fires after each GitHub commit
- Telegram confirms every successful post

One workflow. Unattended. All five sites covered.

---

## Three Lessons I'm Carrying Forward

**1. Verify committed content, not just status codes.**
A 200 from GitHub means the file was committed — it does not mean the content is correct. Always inspect the actual file. I was chasing a bug for two hours because the commit succeeded but the HTML was raw Markdown.

**2. Never trust `$node['Name'].json` inside Code nodes.**
Use `$('Node Name').first().json` and add fallbacks. The Code node runtime and the expression context are different environments.

**3. Keep your cleanup regexes defensive.**
AI models don't always format output the same way twice. Add optional prefix patterns. Assume the model will generate Roman numerals, numbered sections, or variations you didn't anticipate.

---

If you're building a multi-site content pipeline, a blog automation engine, or just learning n8n — the pattern in this post will save you the debug session I just had.

Go build something automatic.

---

*Building systems, not just content — thecreativetechnician.online*
