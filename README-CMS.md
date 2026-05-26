# 📝 Sveltia CMS — Content Management Guide

> **Lifestyle Hikers** uses [Sveltia CMS](https://github.com/sveltia/sveltia-cms), a Decap-compatible CMS, so anyone on the team can add blog posts, update hikes, manage the gallery, and edit trails — **no coding required**.

---

## 🚀 Quick Start (For Content Editors)

Once the CMS is set up (see Setup section below), here's how to use it:

1. Go to **`https://willylondon.github.io/lifestyle-hikers/admin/`**
2. Log in with your **GitHub account**
3. You'll see the content dashboard with 4 sections:
   - 📝 **Blog Posts** — Trail stories, recaps, tips
   - 🥾 **Upcoming Hikes** — Group hike schedule
   - 📸 **Gallery** — Photo gallery
   - 🗺️ **Trails** — Featured trail listings

### Creating a Blog Post

1. Click **📝 Blog Posts** → **New Blog Post**
2. Fill in the fields:
   - **Title** — Your post headline
   - **Slug** — The short URL name, like `blue-mountain-peak-hike`
   - **Date** — When the post should be dated
   - **Author** — Your name (defaults to "Lifestyle Hikers")
   - **Category** — Pick from: Trail Stories, Trail Guides, Hike Recaps, Trail Tips, Gear Reviews, Community News
   - **Permalink** — Optional. Leave blank to use `/blog/<slug>/`, or enter a custom path like `/waterfalls-in-jamaica/`
   - **Location** — Where the hike was (optional)
   - **Featured Image** — Upload a photo or paste a URL
   - **Distribution Status** — Leave as `Draft` until you want Telegram to announce the post, then set to `Ready`
   - **Send to Telegram** — Keep enabled for blog link announcements
   - **Send to Brevo** — Leave disabled for blogs unless a blog email workflow is configured
   - **Body** — Write your post using the rich text editor (supports bold, headings, lists, images)
   - **Tags** — Add tags like "blue-mountains", "waterfall"
3. Click **Publish** when ready (or **Save Draft** to finish later)

### Updating Upcoming Hikes

1. Click **🥾 Upcoming Hikes** → **Upcoming Hikes List**
2. You'll see all current hikes listed
3. Click one to edit, or click **Add Hike** to create a new one
4. Fill in: name, location, difficulty, date, meeting time, distance, spots, description
5. Optional: add a flyer image and registration link for Telegram/Brevo announcements
6. Leave **Distribution Status** as `Draft` while editing
7. Set **Distribution Status** to `Ready` only when the hike should be announced
8. Click **Publish** to save changes

### Managing the Gallery

1. Click **📸 Gallery** → **Gallery Photos**
2. Click **Add Photo** to add new images
3. Upload the photo, add a caption, and optionally set the size to **Tall** or **Wide** for featured photos
4. Reorder by dragging photos up/down in the list
5. Click **Publish** to save

### Editing Trails

1. Click **🗺️ Trails** → **Featured Trails**
2. Edit existing trails or add new ones
3. Each trail has: name, parish, difficulty, distance, elevation, duration, rating, and photo

### Uploading Images

- Click the **image icon** in any image field
- Choose **Upload** to add from your computer, or **Insert from URL** to paste a link
- Uploaded images are stored in `assets/images/uploads/`
- After publish, GitHub Actions automatically creates optimized WebP versions for CMS uploads and rewrites matching content references when needed
- New blog posts notify the n8n content distributor automatically once the GitHub Action secrets are configured

### n8n Blog Distribution

CMS publishes work in tandem with the existing **Lifestyle Hikers Content Distributor** n8n workflow:

1. Sveltia CMS saves the blog post into `_posts/` on the `main` branch
2. GitHub Actions runs **Notify n8n Blog Publish**
3. The action sends the blog title, description, URL, absolute `image_url`, tags, and Telegram caption to the n8n webhook
4. n8n decides which channels to send to and posts to Telegram from the **Send Telegram Photo** or **Send Telegram Message** nodes

Save these GitHub repository secrets:

- `N8N_CONTENT_WEBHOOK_URL` - the production webhook URL from the n8n **Content Webhook** node
- `N8N_WEBHOOK_SECRET` - the shared secret validated by the n8n workflow, sent as the `x-lh-secret` header

The payload includes n8n's required `content_type: blog` and `announcement_id`, plus `send_to_telegram: true`. It also includes `image_url`, `image`, `flyer_url`, and `flyer` as direct raw GitHub image URLs when the CMS image is local. The `site_image_url` field keeps the public website image path for reference. This avoids a timing issue where n8n fires before the website deployment has finished publishing the new uploaded image.

### Telegram Photo Reliability Fix

Telegram can reject otherwise valid-looking image URLs with `Bad Request: failed to get HTTP URL content`. To make the n8n workflow resilient, the photo branch should download the image first and upload the binary file to Telegram:

1. Add **Download Telegram Photo** between **Has Telegram Photo?** and **Send Telegram Photo**
2. Set **Download Telegram Photo** to `GET`, URL `={{ $json.image_url }}`, response format `File`, binary field `data`, and follow redirects
3. Change **Send Telegram Photo** to upload binary field `data`
4. Keep the caption as `={{ $('Validate and Prepare').first().json.telegram_caption }}`
5. Keep the chat ID as `={{ $('Validate and Prepare').first().json.telegram_chat_id }}`
6. Set the photo download/photo send path to continue on error and fall back to **Send Telegram Message**

### Manual Telegram Fallback

The **Manual Telegram Blog Notification** workflow is kept as an emergency fallback only. It does not run automatically, so the repaired n8n workflow remains the single automatic distributor and avoids duplicate Telegram posts.

Save these GitHub repository secrets only if the manual fallback is needed:

- `TELEGRAM_BOT_TOKEN` - your bot token
- `TELEGRAM_CHAT_ID` - the target group chat ID
- `TELEGRAM_MESSAGE_THREAD_ID` - optional, only if posts should go into a specific forum topic

---

## ⚙️ Setup Guide (One-Time, for the Admin)

### Step 1: Create a GitHub OAuth App

The CMS needs GitHub authentication so editors can log in.

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: `Lifestyle Hikers CMS`
   - **Homepage URL**: `https://willylondon.github.io/lifestyle-hikers`
   - **Authorization callback URL**: `https://api.netlify.com/auth/done` *(if using Netlify as OAuth proxy — see below)*
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret** — save both somewhere safe

### Step 2: Set Up an OAuth Proxy

GitHub OAuth requires a server-side component. The easiest free option:

#### Option A: Netlify (Recommended — Free)

1. Create a free account at [netlify.com](https://www.netlify.com/)
2. Create a new site (can be a blank site — it's just for OAuth handling)
3. Go to **Site Settings → Access Control → OAuth**
4. Under **GitHub**, click **Install provider**
5. Enter your **Client ID** and **Client Secret** from Step 1
6. In your `admin/config.yml`, add under `backend`:
   ```yaml
   backend:
     name: github
     repo: willylondon/lifestyle-hikers
     branch: main
     base_url: https://api.netlify.com
   ```

#### Option B: Sveltia CMS Auth (Free, no Netlify)

1. Deploy [sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) to Cloudflare Workers (free) or similar
2. Follow their README for setup
3. Update `base_url` in `admin/config.yml` to your deployed URL

### Step 3: Add Collaborators

- Editors need **write access** to the GitHub repo
- Go to **Repo Settings → Collaborators** and invite your friends' GitHub accounts
- They can then log in at `/admin` with their GitHub credentials

---

## 🔄 Alternative: Netlify Identity + Git Gateway

If your friends don't have (or want) GitHub accounts, you can use **Netlify Identity** instead:

1. Deploy the site to Netlify
2. Enable **Identity** in Netlify dashboard
3. Enable **Git Gateway**
4. Replace the backend config in `admin/config.yml`:
   ```yaml
   backend:
     name: git-gateway
     branch: main
   ```
5. Add this script to `admin/index.html` before the CMS script:
   ```html
   <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
   ```
6. Invite users via email through Netlify Identity dashboard

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| "Failed to load config" | Check that `admin/config.yml` exists and YAML syntax is valid |
| "Authentication error" | Verify GitHub OAuth app credentials and callback URL |
| White screen at `/admin` | Open browser console (F12) for error details |
| Images not showing | Check that image paths start with `/assets/images/uploads/` |
| Changes not appearing on site | GitHub Pages can take 1-2 minutes to rebuild after a commit |
| "Branch not found" | Make sure the `branch` in config matches your default branch name |

---

## 📁 File Structure

```
lifestyle-hikers/
├── admin/
│   ├── index.html          ← CMS admin page
│   ├── config.yml          ← CMS collection & backend config
│   └── preview-templates.js ← Custom post preview styling
├── _data/
│   ├── events.yml          ← Upcoming hikes (managed by CMS)
│   ├── gallery.yml         ← Gallery photos (managed by CMS)
│   └── trails.yml          ← Featured trails (managed by CMS)
├── _posts/                 ← Blog posts (managed by CMS)
└── assets/images/uploads/  ← CMS-uploaded images
```

---

*Need help? Contact the site admin or open an issue on the GitHub repo.*
