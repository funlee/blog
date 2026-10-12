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
- Recommended resources and links: `src/data/friends.json`
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

Implemented features include pagination for posts and moments, article pages, code copying, a table of contents, an image lightbox, archives, categories and tags, recommended links, an About page, a 404 page, three theme modes, mobile navigation, Pagefind search, RSS, and a sitemap. The home banner uses a locally generated seaside wallpaper; the other sample illustrations are original SVGs. Images do not depend on external image services.

This version focuses on the local experience. Donations and promotions, automated deployment, real personal content, and a photo optimization workflow are deferred until the visual design is confirmed. Full cross-browser and Lighthouse acceptance testing has not been completed. The links page currently lists recommended technical resources, without implying relationships with their owners. Personal social accounts and a link-request email address have not been configured.

## Future deployment

Set `SITE_URL=https://your-domain.example` when building. For deployment under a subdirectory, also set `BASE_PATH=/repository-name/`. The default site URL points to the local preview and must not be used as the production canonical URL. The `dist/` directory contains the complete static output: replace the previous deployment instead of merging it with old files. Before launch, replace sample content, configure the domain, and verify root-path or subdirectory routing and the hosting provider’s 404 behavior.

Do not put private draft images in `public/`; every file in that directory is copied directly into the build output. Private drafts should not be committed to a public repository.
