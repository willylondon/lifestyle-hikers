# Lifestyle Hikers — Rollback Plan

**Date:** August 2, 2026

## Rollback strategy

The site is a static Jekyll + GitHub Pages deployment. Rollback means reverting Git commits on `main`. There is no database migration, no server-side state, and no cache invalidation needed beyond GitHub Pages rebuild.

## Rollback procedures

### Option A: Revert specific commit(s)
```bash
git checkout main
git revert <commit-sha>  # Creates a revert commit
git push origin main
# GitHub Pages auto-rebuilds
```

### Option B: Reset to a known-good commit (emergency)
```bash
git checkout main
git reset --hard <known-good-sha>
git push --force origin main
# GitHub Pages auto-rebuilds
```
⚠️ Force push should only be used in emergencies. Prefer `git revert`.

### Option C: Roll back to previous deployment via GitHub UI
1. Go to https://github.com/willylondon/lifestyle-hikers/deployments
2. Find the last successful deployment
3. The repo is always deployable from any commit on main

## Rollback verification

After rollback:
1. Visit https://www.lifestylehikers.com/
2. Check GitHub Pages build status: `gh api repos/willylondon/lifestyle-hikers/pages`
3. Verify key pages load: `/`, `/trails/`, `/hikes/`, `/blog/`
4. Verify CMS loads: `/admin/`

## Known-good commits
| Commit SHA | Date | Description |
|---|---|---|
| `3423567` | Jul 31, 2026 | Last known-good before audit branch |
| `394ebc2` | Aug 2, 2026 | Hero and schedule copy refresh |

## What CANNOT be rolled back easily
- CMS content changes made through Sveltia CMS (are separate commits)
- External form submissions (Google Forms — outside git)
- External service state (n8n, Telegram, Brevo)
- Image uploads (committed to repo but managed by CMS)

## Rollback risks
- **Low risk:** All changes are in static files; no database
- **Medium risk:** CMS content changes may be interleaved with code changes
- **No risk:** No server-side state, no cache to invalidate beyond GitHub Pages
