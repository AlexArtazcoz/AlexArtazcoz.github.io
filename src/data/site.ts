/**
 * ★ PERSONALIZE YOUR PORTFOLIO HERE ★
 *
 * Every value in this file is meant to be edited. Together with
 * `src/data/projects.ts` (your projects) and `src/i18n/ui.ts` (interface
 * wording), this is all you need to touch to make the site yours.
 */

import type { Lang, Localized } from '../i18n/ui';

export interface SocialLink {
  label: string;
  href: string;
}

export interface EducationItem {
  period: string;
  degree: Localized;
  org: string;
}

export interface SkillGroup {
  group: Localized;
  items: string[];
}

export const site = {
  /** Shown as the wordmark (top-left) and in the browser title. */
  name: 'Alex Artazcoz',

  /** One-line role under your name in the hero. */
  role: {
    en: 'Architecture student',
    ca: 'Estudiant d’arquitectura',
    es: 'Estudiante de arquitectura',
  } satisfies Localized,

  location: 'Barcelona, Spain',

  /** Used for the contact link (mailto:). */
  email: 'artazcoz.arch@gmail.com',

  /** One CV per language, in `public/`. Empty string = link not shown. */
  cvPath: {
    en: '/Alex-Artazcoz-CV-EN.pdf',
    ca: '/Alex-Artazcoz-CV-CA.pdf',
    es: '/Alex-Artazcoz-CV-ES.pdf',
  } satisfies Localized,

  socials: [] satisfies SocialLink[],
};

/** Short bio paragraphs shown in the About section, per language. */
export const bio: Record<Lang, string[]> = {
  en: [
    'I am a fourth-year architecture student at ETSAV (UPC), in Barcelona. The projects in this portfolio share one thread: reactivating what already exists — from the historic centres of mid-sized cities to a disused building, down to three pieces of furniture rescued from the bin.',
    'I work between drawing, physical models and the building site: I have laboured on site and run the production side of a construction company, bringing AI tools such as Claude Code into everyday professional work.',
  ],
  ca: [
    'Sóc estudiant de quart d’arquitectura a l’ETSAV (UPC), a Barcelona. Els projectes d’aquest portfoli comparteixen un fil: reactivar allò que ja existeix — dels centres històrics de les ciutats mitjanes a un edifici en desús, fins a tres mobles rescatats de les escombraries.',
    'Treballo entre el dibuix, la maqueta i l’obra: he estat a peu d’obra i a la producció d’una constructora, integrant eines d’IA com Claude Code en el treball professional de cada dia.',
  ],
  es: [
    'Soy estudiante de cuarto de arquitectura en la ETSAV (UPC), en Barcelona. Los proyectos de este portafolio comparten un hilo: reactivar lo que ya existe — de los centros históricos de las ciudades medianas a un edificio en desuso, hasta tres muebles rescatados de la basura.',
    'Trabajo entre el dibujo, la maqueta y la obra: he estado a pie de obra y en la producción de una constructora, integrando herramientas de IA como Claude Code en el trabajo profesional de cada día.',
  ],
};

export const education: EducationItem[] = [
  {
    period: '2023',
    degree: {
      en: 'Degree in Architecture Studies',
      ca: 'Grau en Estudis d’Arquitectura',
      es: 'Grado en Estudios de Arquitectura',
    },
    org: 'ETSAV — UPC, Sant Cugat del Vallès',
  },
];

export const skills: SkillGroup[] = [
  {
    group: { en: 'Modeling & CAD', ca: 'Modelatge i CAD', es: 'Modelado y CAD' },
    items: ['Rhinoceros', 'AutoCAD', 'Revit'],
  },
  {
    group: {
      en: 'Graphics & Layout',
      ca: 'Gràfics i maquetació',
      es: 'Gráficos y maquetación',
    },
    items: ['Illustrator', 'Photoshop', 'InDesign', 'Affinity'],
  },
  {
    group: {
      en: 'Computational & GIS',
      ca: 'Computacional i SIG',
      es: 'Computacional y SIG',
    },
    items: ['Grasshopper', 'QGIS', 'Python'],
  },
  {
    group: { en: 'AI', ca: 'IA', es: 'IA' },
    items: ['Expertise in Claude Code and AI-driven workflows'],
  },
];
