/**
 * ★ YOUR PROJECTS ★
 *
 * This file holds each project's text (title, facts, concept) in EN / CA / ES.
 * The IMAGES for a project live in `src/assets/<slug>/` and are arranged on a
 * free canvas — see `src/data/layout.ts` and the in-app layout editor.
 *
 * The first project in the list is the featured one: the index shows it
 * full-width above the grid.
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
  /** People involved, shown as a quiet block at the end of the project page.
   * Omit it entirely on solo work — absence IS the statement. */
  credits?: { label: Localized; names: string[] }[];
}

const noLoc: Localized = { en: '', ca: '', es: '' };

export const projects: Project[] = [
  {
    slug: 'balaguer',
    title: { en: 'Balaguer', ca: 'Balaguer', es: 'Balaguer' },
    year: '2025',
    type: { en: 'Research', ca: 'Recerca', es: 'Investigación' },
    location: {
      en: 'Balaguer, Catalonia',
      ca: 'Balaguer, Catalunya',
      es: 'Balaguer, Cataluña',
    },
    concept: {
      en: 'Research on the abandonment of the historic centres of Catalonia’s mid-sized cities, within the team of UPC and La Salle URL architects that won the Generalitat de Catalunya competition: a diagnosis of Ripoll, Valls, Tortosa, Berga and Balaguer, and a pilot adaptive-reuse project for Balaguer’s historic centre.',
      ca: 'Recerca sobre l’abandonament dels centres històrics de les ciutats mitjanes catalanes, dins l’equip d’arquitectes de la UPC i de La Salle URL guanyador del concurs de la Generalitat de Catalunya: diagnosi de Ripoll, Valls, Tortosa, Berga i Balaguer, i projecte pilot de re-ús adaptatiu al nucli històric de Balaguer.',
      es: 'Investigación sobre el abandono de los centros históricos de las ciudades medianas catalanas, dentro del equipo de arquitectos de la UPC y La Salle URL ganador del concurso de la Generalitat de Cataluña: diagnosis de Ripoll, Valls, Tortosa, Berga y Balaguer, y proyecto piloto de reúso adaptativo en el centro histórico de Balaguer.',
    },
    credits: [
      {
        label: { en: 'Lead researchers', ca: 'Investigadores', es: 'Investigadoras' },
        names: ['Magda Mària i Serrano', 'Anna Martínez Duran', 'Anna Pagès Ramon'],
      },
      {
        label: { en: 'Collaborators', ca: 'Col·laboradors', es: 'Colaboradores' },
        names: [
          'Isabela De Rentería Cano',
          'Xavier Martín Tost',
          'Judit Daura Segura',
          'Félix de la Fuente González',
          'Mateo García López',
          'Pamela Carrillo Arancibia',
          'Mercè Bosch Roma',
          'Àlex Santaeulàlia',
        ],
      },
    ],
  },
  {
    slug: 'tap-vi',
    title: { en: 'A New Mobility', ca: 'Una nova mobilitat', es: 'Una nueva movilidad' },
    year: '2026',
    type: { en: 'Architecture studio VI', ca: 'Taller d’arquitectura VI', es: 'Taller de arquitectura VI' },
    location: noLoc,
    concept: {
      en: 'Regenerating a residential fabric by understanding the street as a structure of urban life: siting, detailed plan and general sections.',
      ca: 'Regeneració d’un teixit residencial entenent el carrer com a estructura de vida urbana: emplaçament, planta de detall i seccions generals.',
      es: 'Regeneración de un tejido residencial entendiendo la calle como estructura de vida urbana: emplazamiento, planta de detalle y secciones generales.',
    },
    credits: [
      {
        label: { en: 'Team', ca: 'Equip', es: 'Equipo' },
        names: ['Mariona Jordà', 'Paula Llort', 'Àlex Santaeulàlia'],
      },
    ],
  },
  {
    slug: 'tap-v',
    title: { en: 'From Wall to Workshop', ca: 'De Mur a Taller', es: 'De Muro a Taller' },
    year: '2026',
    type: { en: 'Architecture studio V', ca: 'Taller d’arquitectura V', es: 'Taller de arquitectura V' },
    location: noLoc,
    concept: {
      en: 'From the given materiality and conditions, a wall organises the project, separating the fixed from the temporary — the essential from the superficial. The wall holds everything needed to live, freeing an open space where each artist unfolds the workshop they need.',
      ca: 'A partir de la materialitat i les condicions donades, un mur organitza el projecte separant el fix del temporal —l’essencial del superficial. El mur conté tot el necessari per viure i allibera un espai diàfan on cada artista desplega el taller que necessita.',
      es: 'A partir de la materialidad y las condiciones dadas, un muro organiza el proyecto separando lo fijo de lo temporal —lo esencial de lo superficial. El muro contiene todo lo necesario para vivir y libera un espacio diáfano donde cada artista despliega el taller que necesita.',
    },
    credits: [
      {
        label: { en: 'Team', ca: 'Equip', es: 'Equipo' },
        names: ['Laia Puigdemasa', 'Júlia Verdaguer', 'Àlex Santaeulàlia'],
      },
    ],
  },
  {
    slug: 'tap-iv',
    title: { en: 'Luzuriaga Offices', ca: 'Oficines Luzuriaga', es: 'Oficinas Luzuriaga' },
    year: '2025',
    type: {
      en: 'Architecture studio IV — Place & city',
      ca: 'Taller d’arquitectura IV — Lloc i ciutat',
      es: 'Taller de arquitectura IV — Lugar y ciudad',
    },
    location: noLoc,
    studio: { en: 'ETSAV — UPC', ca: 'ETSAV — UPC', es: 'ETSAV — UPC' },
    concept: {
      en: 'A full reactivation of a disused building and its surroundings: a studio that reflects on successive themes through the model, beginning and ending at the Luzuriaga offices while working on other buildings along the way.',
      ca: 'Reactivació integral d’un edifici en desús i del seu entorn: un curs que reflexiona sobre temes successius a través de la maqueta, començant i acabant a les oficines Luzuriaga i treballant entremig altres edificis.',
      es: 'Reactivación integral de un edificio en desuso y de su entorno: un curso que reflexiona sobre temas sucesivos a través de la maqueta, empezando y acabando en las oficinas Luzuriaga y trabajando entremedias otros edificios.',
    },
  },
  {
    slug: 'tap-iii',
    title: { en: 'Orion', ca: 'Orió', es: 'Orión' },
    year: '2024',
    type: { en: 'Architecture studio II', ca: 'Taller d’arquitectura II', es: 'Taller de arquitectura II' },
    location: noLoc,
    concept: {
      en: 'Three forgotten pieces of furniture, rescued from the bin and redesigned into a new object. Orion, like the constellation, joins its parts: triangular pieces that recombine into endless variants for each need and context.',
      ca: 'Tres mobles oblidats, rescatats de les escombraries i reprojectats en un objecte nou. Orió, com la constel·lació, uneix les parts: peces triangulars que es recombinen en variants infinites segons la necessitat i el context.',
      es: 'Tres muebles olvidados, rescatados de la basura y reproyectados en un objeto nuevo. Orión, como la constelación, une las partes: piezas triangulares que se recombinan en variantes infinitas según la necesidad y el contexto.',
    },
    credits: [
      {
        label: { en: 'Team', ca: 'Equip', es: 'Equipo' },
        names: ['Laia Puigdemasa', 'Júlia Verdaguer', 'Àlex Santaeulàlia'],
      },
    ],
  },
  {
    slug: 'tap-i',
    title: { en: 'Form & Space', ca: 'Forma i Espai', es: 'Forma y Espacio' },
    year: '2023',
    type: {
      en: 'Architecture studio I',
      ca: 'Taller d’arquitectura I',
      es: 'Taller de arquitectura I',
    },
    location: noLoc,
    studio: { en: 'ETSAV — UPC', ca: 'ETSAV — UPC', es: 'ETSAV — UPC' },
    concept: {
      en: 'A first contact with the project: ten exercises on form and space — from the lamp to colour — where everything learnt converges in the final work.',
      ca: 'El primer contacte amb el projecte: deu exercicis de forma i espai —de la làmpada al color— on tot el que s’aprèn conflueix en el treball final.',
      es: 'El primer contacto con el proyecto: diez ejercicios de forma y espacio —de la lámpara al color— donde todo lo aprendido confluye en el trabajo final.',
    },
  },
  {
    slug: 'rap',
    title: {
      en: 'Project Representation',
      ca: 'Representació del Projecte',
      es: 'Representación del Proyecto',
    },
    year: '2025',
    type: { en: 'Representation & analysis', ca: 'Representació i anàlisi', es: 'Representación y análisis' },
    location: noLoc,
    concept: {
      en: 'The course’s graphic evolution: starting with hand drawing, moving into digital expression with a poster, drawing in the street and, to finish, technically tracing the CCCB of Barcelona as it changes over time.',
      ca: 'L’evolució gràfica de l’assignatura: es comença dibuixant a mà, es passa a l’expressió digital amb un cartell, es dibuixa al carrer i, per acabar, es traça tècnicament l’evolució del CCCB de Barcelona en el temps.',
      es: 'La evolución gráfica de la asignatura: se empieza dibujando a mano, se pasa a la expresión digital con un cartel, se dibuja en la calle y, para acabar, se traza técnicamente la evolución del CCCB de Barcelona en el tiempo.',
    },
  },
];
