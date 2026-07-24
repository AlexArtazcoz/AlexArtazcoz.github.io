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

  /** Auto-generated portfolio booklet per language (see scripts/build-portfolio-pdf.mjs). */
  portfolioPath: {
    en: '/Alex-Artazcoz-Portfolio-EN.pdf',
    ca: '/Alex-Artazcoz-Portfolio-CA.pdf',
    es: '/Alex-Artazcoz-Portfolio-ES.pdf',
  } satisfies Localized,

  socials: [] satisfies SocialLink[],
};

/** Bio paragraphs shown in the About section (and in the PDF booklet), per language. */
export const bio: Record<Lang, string[]> = {
  en: [
    'I am a fourth-year architecture student at ETSAV (UPC), in Barcelona. I work between drawing, physical models and the building site: I have laboured on site and run the production side of a construction company, bringing AI tools such as Claude Code into everyday professional work.',
    'I understand architecture as a timeline: every building has to adapt to the present moment and its needs. That takes knowing our context deeply and being clear about our ideals of how one ought to live. And new construction is almost never the answer: the past is full of structures waiting for a role in the present. That is why the projects in this portfolio share one thread, reactivating what already exists, from the historic centres of mid-sized cities down to three pieces of furniture rescued from the bin.',
    'I believe in hybridising extreme re-use, sustainability and renovation with the technology of the present and the future: an architecture ever closer to the human, that lets us live in complete synergy with our space, with the calm conscience of knowing it was made with the least possible impact.',
    'I am ambitious: I want my work to create real value wherever I practise, in contexts of poverty as much as in prosperous ones, without ever giving up these convictions.',
  ],
  ca: [
    'Sóc estudiant de quart d’arquitectura a l’ETSAV (UPC), a Barcelona. Treballo entre el dibuix, la maqueta i l’obra: he estat a peu d’obra i a la producció d’una constructora, integrant eines d’IA com Claude Code en el treball professional de cada dia.',
    'Entenc l’arquitectura com una línia temporal: cada edifici s’ha d’adaptar al moment present i a les seves necessitats. Per fer-ho cal conèixer a fons el context on som i tenir clars els ideals de com s’ha de viure. I gairebé mai no cal obra nova: el passat és ple d’estructures que esperen un paper en el present. Per això els projectes d’aquest portfoli comparteixen un fil, reactivar allò que ja existeix, dels centres històrics de les ciutats mitjanes fins a tres mobles rescatats de les escombraries.',
    'Crec en la hibridació entre el re-ús extrem, la sostenibilitat i la reforma, incorporant-hi la tecnologia del present i del futur: una arquitectura cada cop més a la mida de l’humà, que ens deixi viure en sinergia completa amb l’espai, amb la consciència tranquil·la de saber que s’ha fet amb el mínim impacte possible.',
    'Sóc ambiciós: vull que la meva feina creï valor real allà on treballi, tant en contextos de pobresa com en contextos benestants, sense renunciar mai a aquestes conviccions.',
  ],
  es: [
    'Soy estudiante de cuarto de arquitectura en la ETSAV (UPC), en Barcelona. Trabajo entre el dibujo, la maqueta y la obra: he estado a pie de obra y en la producción de una constructora, integrando herramientas de IA como Claude Code en el trabajo profesional de cada día.',
    'Entiendo la arquitectura como una línea temporal: cada edificio debe adaptarse al momento presente y a sus necesidades. Para hacerlo hay que conocer a fondo el contexto en el que estamos y tener claros los ideales de cómo se debe vivir. Y casi nunca hace falta obra nueva: el pasado está lleno de estructuras que esperan un papel en el presente. Por eso los proyectos de este portafolio comparten un hilo, reactivar lo que ya existe, de los centros históricos de las ciudades medianas hasta tres muebles rescatados de la basura.',
    'Creo en la hibridación entre el reúso extremo, la sostenibilidad y la reforma, incorporando la tecnología del presente y del futuro: una arquitectura cada vez más a la medida de lo humano, que nos deje vivir en sinergia completa con el espacio, con la conciencia tranquila de saber que se ha hecho con el mínimo impacto posible.',
    'Soy ambicioso: quiero que mi trabajo cree valor real allá donde trabaje, tanto en contextos de pobreza como en contextos más acomodados, sin renunciar nunca a estas convicciones.',
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
