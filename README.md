# Li Yichen’s Blog

English | [简体中文](README-ZH.md)

A fully static personal blog built with Astro. This initial version is designed for local preview, with no database, comments, or visitor analytics.

## Run locally

Requires Node.js 22.19 or later (`.nvmrc` pins version 22.23.3). The project uses npm and `package-lock.json` to lock dependencies.

```bash
nvm use
npm install
npm start
```

Open the URL printed in the terminal, usually http://localhost:4321. `npm start` builds the site and full-text search index before starting the complete preview.

Use `npm run dev` for live updates while editing styles and pages. The development server displays a notice if the search index has not been generated. After editing articles, run `npm start` again to update the complete preview.

```bash
npm run check   # Astro / TypeScript checks
npm test        # Content filtering, pagination, and sorting checks
npm run build   # Static output and Pagefind Chinese search index
npm run preview # Preview the existing dist directory
```

## Edit content

- Site name, author details, categories, and tags: `src/config/site.ts`
- Posts: `src/content/posts/*.md`
- Moments (short updates): `src/content/moments/*.md`
- About page: `src/content/pages/about.md`
- Garden phone backup: `src/data/garden.json` (replace with the original app export)
- Colors and layout: `src/styles/global.css`
- Local sample illustrations: `public/images/`

```bash
npm run new -- post my-new-post "My new post"
npm run new -- moment a-small-moment "A note from today"
```

New content starts as a draft. After reviewing it, set `draft` to `false`. Content is published only if its publication date is no later than the build time. Categories and tags must reference IDs defined in the configuration, and slugs must be unique. All sample posts, moments, avatars, and biographical details are preview material and should be replaced before launch.

## Home banner and typewriter effect

Edit `site.banner` in `src/config/site.ts`:

- `quotes`: An array of sentences displayed in order. Each sentence is typed character by character, held on screen, and then deleted before the next one begins. The sequence repeats.
- `typewriter.typeSpeed` and `typewriter.deleteSpeed`: The interval between typed or deleted characters, in milliseconds.
- `typewriter.holdTime`, `typewriter.startDelay`, and `typewriter.nextDelay`: The time to hold a completed sentence, the initial delay, and the pause between sentences, in milliseconds.
- `typewriter.enabled`: Set to `false` to display the first sentence without animation. An empty quote list falls back to the site description.
- `image`: The image path relative to `public/`. `position` and `mobilePosition` control the framing on desktop and mobile.

A complete sentence remains visible when JavaScript is disabled or the system’s reduced-motion preference is enabled. Animation timers are cleaned up during page navigation, and the animation pauses in background tabs. Run `npm start` again to load configuration changes in the complete preview.

The wallpaper is stored locally at `public/images/seaside-banner.png` and was generated with the built-in `image_gen` tool. English translation of the generation prompt:

> Generate a photorealistic seaside wallpaper for a blog banner: an open blue sea, gentle white waves, pale sand, and a distant coastline beneath a clear sky. Use blue-gray tones and natural lighting for a fresh, peaceful atmosphere. Use an ultrawide horizontal composition, keeping the important scenery within the central horizontal band so it can be cropped into an approximately 4:1 website banner. Leave uncluttered water in the center for white text overlaid by the webpage. Do not include text, watermarks, people, or cars.

## Current scope

Implemented features include pagination for posts and moments, article pages, code copying, a table of contents, an image lightbox, archives, categories and tags, reading and garden sections, an About page, a 404 page, three theme modes, mobile navigation, Pagefind search, RSS, and a sitemap. The home banner uses a locally generated seaside wallpaper; the other sample illustrations are original SVGs. Images do not depend on external image services.

This version focuses on the local experience. Donations and promotions, automated deployment, real personal content, and a photo optimization workflow are deferred until the visual design is confirmed. Full cross-browser and Lighthouse acceptance testing has not been completed. The links section has been removed, and `/friends/` no longer serves a page. Personal social accounts and a contact email address have not been configured.

## Future deployment

Set `SITE_URL=https://your-domain.example` when building. For deployment under a subdirectory, also set `BASE_PATH=/repository-name/`. The default site URL points to the local preview and must not be used as the production canonical URL. The `dist/` directory contains the complete static output: replace the previous deployment instead of merging it with old files. Before launch, replace sample content, configure the domain, and verify root-path or subdirectory routing and the hosting provider’s 404 behavior.

Do not put private draft images in `public/`; every file in that directory is copied directly into the build output. Private drafts should not be committed to a public repository.

## Reading data on GitHub Pages

The `Deploy blog to GitHub Pages` workflow (`.github/workflows/deploy-pages.yml`) refreshes WeRead data before every build triggered by a push to `main` or `workflow_dispatch`. Enable **Settings → Pages → Source → GitHub Actions** and add the repository Actions secret **WEREAD_API_KEY**. The workflow derives the site origin/base path from Pages settings.

Sync errors stop publication, preserving the last deployed site. The fresh JSON is used in the build without committing it back. Sync, build, and deployment share one job, so re-running it also refreshes the data. Local builds remain offline; use `npm run sync:reading` with the key in your environment or ignored `.env` to refresh locally. See [the Chinese guide](README-ZH.md#读书栏目与部署时同步) for data rules and setup details.

## Garden: a read-only view of the phone backup

The `/garden/` section displays habit plants, completion totals, distinct action days and monthly history. Select a plant to view its history and expand a month to read the calendar. Everyone sees the same page; habits and check-ins are managed in the phone app.

Replace `src/data/garden.json` with the complete Habit Garden export (`kind: "habit-garden-backup"`, `formatVersion: 2`). Keep the native structure, including `exportedAt`, `schedule`, `position`, `pauses`, `createdOn` and each habit's `days` map. The build validates the backup without rewriting it. There is no editing API, login, browser storage or data-maintenance skill.

Run `npm run check`, `npm test` and `npm run build`, then publish through the existing Pages workflow. `npm run dev` previews local edits immediately; online content changes only after deployment. Snapshot dates come from `exportedAt`, displayed in Asia/Shanghai time, rather than the build or visitor's date.

Completed days drive the blog's visual growth stages: seed at 0, sprout at 1–6, bud at 7–20, bloom at 21 or more. These are presentation rules, not a reproduction of the app's growth algorithm. Rest is counted separately; absent dates remain unrecorded. The supplied daily schedule is supported; other schedule kinds retain their data and use a generic label. Pause metadata is retained without inventing interval semantics. Unsupported backup versions or record states stop the build. Only include a backup intended for public display.
