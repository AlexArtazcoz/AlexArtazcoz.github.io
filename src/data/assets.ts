/**
 * Central registry of every project's optimized images. Both the project pages
 * and the layout system resolve images through here, so an image is loaded once
 * and referenced by its filename stem (e.g. "01-l0-1").
 */
import type { ImageMetadata } from 'astro';

export type Img = { name: string; src: ImageMetadata };

function loadDir(glob: Record<string, ImageMetadata>): Img[] {
  return Object.entries(glob)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => ({ name: path.split('/').pop()!.replace(/\.\w+$/, ''), src }));
}

export const assets: Record<string, Img[]> = {
  'tap-vi': loadDir(
    import.meta.glob('../assets/tap-vi/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }) as Record<string, ImageMetadata>,
  ),
  'tap-v': loadDir(
    import.meta.glob('../assets/tap-v/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }) as Record<string, ImageMetadata>,
  ),
  'tap-iii': loadDir(
    import.meta.glob('../assets/tap-iii/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }) as Record<string, ImageMetadata>,
  ),
  rap: loadDir(
    import.meta.glob('../assets/rap/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }) as Record<string, ImageMetadata>,
  ),
};

export const imagesFor = (slug: string): Img[] => assets[slug] ?? [];

export const findImage = (slug: string, name: string): Img | undefined =>
  (assets[slug] ?? []).find((i) => i.name === name);
