# Project images go here (JPG / PNG)

Drop your renders, drawings, diagrams, model photos and site photos in this
folder. Use **one subfolder per project**, for example:

```
src/assets/casa-llindar/hero.jpg
src/assets/casa-llindar/ground-plan.jpg
src/assets/casa-llindar/model-01.jpg
```

Use the **high-resolution originals** — you don't need to shrink or compress
them first. Astro automatically resizes, compresses and lazy-loads every image
at build time.

## How they get onto the site

Either **tell Claude** which images belong to which project (Claude wires them
in for you), or do it yourself in `src/data/projects.ts`:

```ts
import hero from '../assets/casa-llindar/hero.jpg';        // 1. import at top
// ...
hero: { kind: 'render', alt: { en: '…', ca: '…', es: '…' }, src: hero },  // 2. set src
```

As soon as a media item has a `src`, the elegant grey placeholder is replaced
by your real (optimized) image. No other change needed.

## PDFs do NOT go here

Put PDFs (your CV, or a full portfolio booklet) in the **`public/`** folder at
the project root instead — anything there is served as-is at that path:

```
public/cv.pdf         → already linked by the "Download CV" button
public/portfolio.pdf  → e.g. your full booklet (ask Claude to add a link)
```
