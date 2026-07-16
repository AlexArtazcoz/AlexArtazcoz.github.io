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

  /** Put your CV at `public/cv.pdf`. Empty = the link is not shown yet. */
  cvPath: '',

  socials: [] satisfies SocialLink[],
};

/** Short bio paragraphs shown in the About section, per language. */
export const bio: Record<Lang, string[]> = {
  en: [
    'I am an architecture student based in Barcelona, interested in the space between landscape, structure and everyday use.',
    'My work moves between careful drawing and physical models, testing how simple material decisions shape light, movement and atmosphere.',
  ],
  ca: [
    'Sóc estudiant d’arquitectura a Barcelona, interessat en l’espai entre el paisatge, l’estructura i l’ús quotidià.',
    'El meu treball es mou entre el dibuix acurat i les maquetes físiques, provant com decisions materials senzilles configuren la llum, el moviment i l’atmosfera.',
  ],
  es: [
    'Soy estudiante de arquitectura en Barcelona, interesado en el espacio entre el paisaje, la estructura y el uso cotidiano.',
    'Mi trabajo se mueve entre el dibujo cuidadoso y las maquetas físicas, probando cómo decisiones materiales sencillas configuran la luz, el movimiento y la atmósfera.',
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
