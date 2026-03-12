# 📝 Decap CMS — Content Management Guide

> **Lifestyle Hikers** uses [Decap CMS](https://decapcms.org/) (formerly Netlify CMS) so anyone on the team can add blog posts, update hikes, manage the gallery, and edit trails — **no coding required**.

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
   - **Date** — When the post should be dated
   - **Author** — Your name (defaults to "Lifestyle Hikers")
   - **Category** — Pick from: Trail Stories, Hike Recaps, Trail Tips, Gear Reviews, Community News
   - **Location** — Where the hike was (optional)
   - **Featured Image** — Upload a photo or paste a URL
   - **Body** — Write your post using the rich text editor (supports bold, headings, lists, images)
   - **Tags** — Add tags like "blue-mountains", "waterfall"
3. Click **Publish** when ready (or **Save Draft** to finish later)

### Updating Upcoming Hikes

1. Click **🥾 Upcoming Hikes** → **Upcoming Hikes List**
2. You'll see all current hikes listed
3. Click one to edit, or click **Add Hike** to create a new one
4. Fill in: name, location, difficulty, date, meeting time, distance, spots, description
5. Click **Publish** to save changes

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
5. Add this script to `admin/index.html` before the Decap CMS script:
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
