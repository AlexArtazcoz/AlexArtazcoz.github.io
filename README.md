# Architecture Portfolio

A minimal, image-first architecture portfolio in the manner of
rubencasquero.com / harquitectes.com / hicarquitectura.com: the homepage is the
project index (3-column grid), each project has its own page (title + fact
sheet + concept + a free-canvas image sequence), plus an `info` page. Trilingual
(English · Català · Español), built with [Astro](https://astro.build). It ships
almost no JavaScript and optimizes images at build time.

Routes: `/` (index) · `/projects/<slug>/` · `/info/` — same under `/ca/` and
`/es/`. In dev, each project page has a free-canvas layout editor ("Editar
disposició") that saves to `src/data/layout.json`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build

```bash
npm run build      # static site → dist/
npm run preview    # preview the production build locally
```

## Make it yours

Everything personal lives in three files:

1. **`src/data/site.ts`** — your name, role, location, email, socials, CV link,
   bio, education and skills.
2. **`src/data/projects.ts`** — your projects. Copy an entry and edit its text;
   each project can have any mix of media (renders, plans, models, diagrams).
3. **`src/i18n/ui.ts`** — interface wording (nav labels, buttons) in the three
   languages.

**Images:** drop files into `src/assets/`, `import` them in
`src/data/projects.ts`, and set them as a media item's `src`. Astro then serves
responsive, lazy-loaded, optimized images automatically. Until you do, elegant
placeholders stand in — the layout is identical either way.

**CV:** put your PDF at `public/cv.pdf` (the About button links to `/cv.pdf`).

## Languages

English is served at `/`, Català at `/ca/`, Español at `/es/`. To change the set
of languages, edit the `languages` array and `ui` strings in `src/i18n/ui.ts` and
add/remove a matching page under `src/pages/`. Set your real domain in
`astro.config.mjs` (`site:`) before deploying so canonical URLs, `hreflang` and
the sitemap are correct.

## Deploy

Static output — host it anywhere. On **Netlify** or **Vercel**, import the repo;
build command `npm run build`, publish directory `dist/`. The Node version is
pinned in `.nvmrc`.

## Structure

```
src/
  data/         site + projects text, assets registry, canvas layouts
  i18n/         languages, UI strings, helpers
  layouts/      BaseLayout — <head>, SEO (per-page hreflang), fonts
  components/    SiteHeader, SiteFooter, LanguageSwitcher,
                 IndexPage, ProjectPageLayout, InfoPage,
                 ProjectCanvas, CanvasEditor (dev-only)
  pages/        index, projects/[slug], info — ×3 locales
  styles/       global.css — white ground, small quiet type
```

## Deferred (easy to add later)

Image lightbox/zoom, a real downloadable PDF portfolio, a contact form, dark
mode, and richer motion were intentionally left out to keep this first version
lean and well-structured.
