/**
 * ★ YOUR PROJECTS ★
 *
 * This file holds each project's text (title, facts, concept) in EN / CA / ES.
 * The IMAGES for a project live in `src/assets/<slug>/` and are arranged on a
 * free canvas — see `src/data/layout.ts` and the in-app layout editor.
 *
 * Titles and descriptions are placeholders (the studio codes) until the real
 * texts are added.
 */
import type { Localized } from '../i18n/ui';

export interface Project {
  slug: string;
  title: Localized;
  year: string;
  type: Localized;
  location: Localized;
  studio?: Localized;
  concept: Localized;
  /** Image name (filename stem) used as the index thumbnail; defaults to the canvas's first image. */
  cover?: string;
}

const soon: Localized = {
  en: 'Full project description coming soon.',
  ca: 'Descripció completa del projecte, properament.',
  es: 'Descripción completa del proyecto, próximamente.',
};
const noLoc: Localized = { en: '', ca: '', es: '' };

export const projects: Project[] = [
  {
    slug: 'tap-vi',
    title: { en: 'TAP VI', ca: 'TAP VI', es: 'TAP VI' },
    year: '',
    type: { en: 'Architecture studio VI', ca: 'Taller d’arquitectura VI', es: 'Taller de arquitectura VI' },
    location: noLoc,
    concept: soon,
  },
  {
    slug: 'tap-v',
    title: { en: 'TAP V', ca: 'TAP V', es: 'TAP V' },
    year: '',
    type: { en: 'Architecture studio V', ca: 'Taller d’arquitectura V', es: 'Taller de arquitectura V' },
    location: noLoc,
    concept: soon,
  },
  {
    slug: 'tap-iii',
    title: { en: 'TAP III', ca: 'TAP III', es: 'TAP III' },
    year: '',
    type: { en: 'Architecture studio III', ca: 'Taller d’arquitectura III', es: 'Taller de arquitectura III' },
    location: noLoc,
    concept: soon,
  },
  {
    slug: 'rap',
    title: { en: 'RAP', ca: 'RAP', es: 'RAP' },
    year: '',
    type: { en: 'Representation & analysis', ca: 'Representació i anàlisi', es: 'Representación y análisis' },
    location: noLoc,
    concept: soon,
  },
];
