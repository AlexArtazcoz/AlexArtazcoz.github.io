/**
 * Free-canvas layout system.
 *
 * Each project is a scalable artboard. The artboard is `CANVAS_W` units wide and
 * `h` units tall; every image is placed with `x`, `y`, `w` in those units (plus a
 * stacking `z` and a non-destructive `crop`). Because the rendered stage keeps a
 * fixed aspect-ratio, expressing everything in canvas units makes the whole
 * composition scale down cleanly on phones.
 *
 * Saved layouts live in `layout.json` (written by the in-app editor). Projects
 * without a saved layout fall back to a tidy default (images stacked full-width).
 */
import type { ImageMetadata } from 'astro';
import layoutData from './layout.json';
import { imagesFor, findImage, type Img } from './assets';
import { defaultCrop, frameGeometry, type Crop } from './frame';

export type { Crop };
export { defaultCrop };

export const CANVAS_W = 1000;
export const GAP = 22;

export interface Item {
  img: string;
  x: number;
  y: number;
  w: number;
  z: number;
  hidden?: boolean;
  crop: Crop;
}

export interface Canvas {
  h: number;
  items: Item[];
  /** Image name shown as the index cover (chosen in the layout editor). */
  cover?: string;
  /** Up to 4 hand-picked images (editor "◈ Selecció"): they cycle on the
   * index-card hover and become the project's pages in the PDF booklet. */
  picks?: string[];
}

export type Layout = Record<string, Canvas>;

const naturalAspect = (img: Img): number => img.src.width / img.src.height;

/** A tidy starting point: every image full-width, stacked in order. */
export function defaultCanvas(slug: string): Canvas {
  const imgs = imagesFor(slug);
  const w = CANVAS_W - GAP * 2;
  let y = GAP;
  const items: Item[] = imgs.map((img, idx) => {
    const item: Item = { img: img.name, x: GAP, y, w, z: idx + 1, crop: defaultCrop() };
    y += w / naturalAspect(img) + GAP;
    return item;
  });
  return { h: Math.max(Math.round(y), 200), items };
}

/** The stored canvas for a project, or the generated default. */
export function canvasFor(slug: string): Canvas {
  const saved = (layoutData as Layout)[slug];
  return saved && saved.items && saved.items.length ? saved : defaultCanvas(slug);
}

export interface ResolvedItem extends Item {
  src: ImageMetadata;
  /** The source image's natural aspect ratio (before any crop/rotation). */
  na: number;
}

/**
 * The image shown on a project's index card, together with the framing it was
 * given on the canvas (rotation, trim, focal point, zoom) — so a cover looks
 * the way the image was composed, just fitted to the card's shape.
 *
 * Priority: the cover picked in the editor → an explicit fallback → the first
 * image on the canvas.
 */
export function coverFor(
  slug: string,
  fallbackName?: string,
): { src: ImageMetadata; na: number; crop: Crop } | undefined {
  const canvas = canvasFor(slug);
  const name = canvas.cover ?? fallbackName ?? canvas.items[0]?.img;
  if (!name) return undefined;
  const img = findImage(slug, name);
  if (!img) return undefined;
  const item = canvas.items.find((i) => i.img === name);
  return { src: img.src, na: naturalAspect(img), crop: item?.crop ?? defaultCrop() };
}

/**
 * Visible, resolved items ready to render. The canvas height always hugs the
 * content — it ends just below the last image — so a composition never trails
 * empty space, whatever height happens to be stored.
 */
export function renderCanvas(slug: string): {
  h: number;
  items: ResolvedItem[];
  cover?: string;
  picks?: string[];
} {
  const canvas = canvasFor(slug);
  const items: ResolvedItem[] = [];
  for (const it of canvas.items) {
    if (it.hidden) continue;
    const img = findImage(slug, it.img);
    if (!img) continue;
    items.push({ ...it, src: img.src, na: naturalAspect(img) });
  }

  let bottom = 0;
  for (const it of items) {
    bottom = Math.max(bottom, it.y + it.w / frameGeometry(it.na, it.crop).aspect);
  }
  const h = items.length ? Math.max(Math.round(bottom + GAP), 200) : canvas.h;

  return { h, items, cover: canvas.cover, picks: canvas.picks };
}
