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

  /**
   * One-line role, used in the browser title, the `jobTitle` search engines
   * read, the share card and the portfolio PDF cover. Leave a language empty
   * and the name simply stands alone in all four — no dangling separator.
   */
  role: {
    en: '',
    ca: '',
    es: '',
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
    'I am in my fourth year of architecture at ETSAV (UPC), in Barcelona. I move between drawing, physical models and the building site: I have spent time working on site and on the production side of a construction company.',
    'I like to think of architecture as a timeline: every building should be able to adapt to the moment it is living through and to what is being asked of it. That means getting to know a place properly and asking ourselves how we would want to live in it. And very often there is no need to build anew, because the past is full of structures still waiting for a role in the present.',
    'That is the thread running through the projects in this portfolio: bringing back to life what is already there, from the historic centres of mid-sized cities to three pieces of furniture rescued from the bin. They are still coursework rather than built work, and I am keen to learn everything that is missing to get there.',
    'What interests me is mixing reuse, renovation and sustainability with the technology we have at hand, looking for an architecture built to the measure of whoever lives in it. What I would love is for the work to be genuinely useful wherever it lands, whether resources are plentiful or scarce, and for it to be made with the least possible impact.',
  ],
  ca: [
    'Estudio quart d’arquitectura a l’ETSAV (UPC), a Barcelona. Em moc entre el dibuix, la maqueta i l’obra: he passat temps a peu d’obra i a la producció d’una constructora.',
    'M’agrada pensar l’arquitectura com una línia de temps: cada edifici hauria de poder adaptar-se al moment en què està i a allò que se li demana. Per fer-ho cal conèixer bé el lloc i preguntar-se com hi voldríem viure. I moltes vegades no cal construir de nou, perquè el passat és ple d’estructures que encara esperen un paper en el present.',
    'És el fil que comparteixen els projectes d’aquest portfoli: reactivar allò que ja hi és, des dels centres històrics de les ciutats mitjanes fins a tres mobles rescatats de les escombraries. Encara són treballs de carrera i no obra construïda, i tinc ganes d’anar aprenent tot el que falta per arribar-hi.',
    'El que m’interessa és barrejar el reaprofitament, la reforma i la sostenibilitat amb la tecnologia que tenim a mà, buscant una arquitectura a la mida de qui hi viu. M’il·lusiona que la feina acabi sent útil de debò allà on sigui, amb molts recursos o amb pocs, i poder-la fer amb el mínim impacte possible.',
  ],
  es: [
    'Estudio cuarto de arquitectura en la ETSAV (UPC), en Barcelona. Me muevo entre el dibujo, la maqueta y la obra: he pasado tiempo a pie de obra y en la producción de una constructora.',
    'Me gusta pensar la arquitectura como una línea de tiempo: cada edificio debería poder adaptarse al momento en el que está y a lo que se le pide. Para eso hay que conocer bien el lugar y preguntarse cómo querríamos vivir en él. Y muchas veces no hace falta construir de nuevo, porque el pasado está lleno de estructuras que todavía esperan un papel en el presente.',
    'Es el hilo que comparten los proyectos de este portafolio: reactivar lo que ya está ahí, desde los centros históricos de las ciudades medianas hasta tres muebles rescatados de la basura. Todavía son trabajos de carrera y no obra construida, y tengo ganas de ir aprendiendo todo lo que falta para llegar.',
    'Lo que me interesa es mezclar el reaprovechamiento, la reforma y la sostenibilidad con la tecnología que tenemos a mano, buscando una arquitectura a la medida de quien la habita. Me ilusiona que el trabajo acabe siendo útil de verdad allá donde sea, con muchos recursos o con pocos, y poder hacerlo con el mínimo impacto posible.',
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
    group: {
      en: 'AI in everyday work',
      ca: 'IA en el dia a dia',
      es: 'IA en el día a día',
    },
    items: ['Claude Code'],
  },
];
