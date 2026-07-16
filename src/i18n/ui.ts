/**
 * Languages, UI/chrome strings and a tiny translation helper.
 *
 * Content that is personal to you (name, bio, projects) lives in `src/data/`.
 * This file only holds the reusable interface labels shown around that content.
 */

export const languages = ['en', 'ca', 'es'] as const;
export type Lang = (typeof languages)[number];

/** A string translated into every supported language. */
export type Localized = Record<Lang, string>;

export const defaultLang: Lang = 'en';

/** Full names, e.g. for the language switcher's accessible labels. */
export const localeName: Record<Lang, string> = {
  en: 'English',
  ca: 'Català',
  es: 'Español',
};

/** Short labels shown in the switcher (harquitectes-style). */
export const localeShort: Record<Lang, string> = {
  en: 'ENG',
  ca: 'CAT',
  es: 'ESP',
};

export const ui = {
  en: {
    skip: 'Skip to content',
    nav_work: 'work',
    nav_info: 'info',
    lang_label: 'Language',
    back_to_index: 'work',
    fitxa_program: 'Program',
    fitxa_location: 'Location',
    fitxa_year: 'Year',
    fitxa_studio: 'Studio',
    info_education: 'Education',
    info_skills: 'Skills & software',
    info_contact: 'Contact',
    info_cv: 'CV (PDF)',
    meta_description:
      'Architecture portfolio — a selection of academic and design projects.',
  },
  ca: {
    skip: 'Vés al contingut',
    nav_work: 'obra',
    nav_info: 'info',
    lang_label: 'Idioma',
    back_to_index: 'obra',
    fitxa_program: 'Programa',
    fitxa_location: 'Lloc',
    fitxa_year: 'Any',
    fitxa_studio: 'Curs',
    info_education: 'Formació',
    info_skills: 'Competències i programari',
    info_contact: 'Contacte',
    info_cv: 'CV (PDF)',
    meta_description:
      'Portfoli d’arquitectura — una selecció de projectes acadèmics i de disseny.',
  },
  es: {
    skip: 'Ir al contenido',
    nav_work: 'obra',
    nav_info: 'info',
    lang_label: 'Idioma',
    back_to_index: 'obra',
    fitxa_program: 'Programa',
    fitxa_location: 'Lugar',
    fitxa_year: 'Año',
    fitxa_studio: 'Curso',
    info_education: 'Formación',
    info_skills: 'Competencias y software',
    info_contact: 'Contacto',
    info_cv: 'CV (PDF)',
    meta_description:
      'Portafolio de arquitectura — una selección de proyectos académicos y de diseño.',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];

/** Translate a UI key, falling back to the default language if missing. */
export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key] ?? ui[defaultLang][key];
}
