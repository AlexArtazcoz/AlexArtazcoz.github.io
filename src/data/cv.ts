/**
 * ★ THE CV, IN THREE LANGUAGES ★
 *
 * The one-page CVs in `public/` are printed from this data by
 * `scripts/build-cv.mjs`. Before this file existed they were opaque PDFs with
 * no source, so a single typo was unfixable; edit the text here and re-run the
 * script instead.
 *
 * Deliberately self-contained rather than derived from `site.ts`: the CV signs
 * the name as it appears on paper (accents and all), carries a phone number the
 * website does not publish, and names its skill groups a touch more formally.
 */
import type { Lang } from '../i18n/ui';

export interface CvJob {
  /** Role, set in the darker weight. */
  role: string;
  /** Employer and dates, set grey next to the role. */
  meta: string;
  /** What the work actually was. */
  detail: string;
}

export interface CvSkill {
  group: string;
  items: string;
}

export interface Cv {
  /** Small line under the name. */
  subtitle: string;
  /** Right-hand contact block, in order; the last one is the portfolio link. */
  contact: string[];
  portfolioLabel: string;
  portfolioUrl: string;
  /** Section labels in the left column. */
  labels: {
    profile: string;
    experience: string;
    education: string;
    skills: string;
    languages: string;
  };
  profile: string;
  jobs: CvJob[];
  education: { role: string; meta: string; detail: string };
  skills: CvSkill[];
  languages: string;
}

/** The name as signed on the CV (the website wordmark drops the accents). */
export const cvName = 'Àlex Artázcoz';

export const cv: Record<Lang, Cv> = {
  en: {
    subtitle: 'Architecture student · ETSAV, UPC · Barcelona',
    contact: ['+34 686 232 368', 'artazcoz.arch@gmail.com', 'Barcelona, Spain'],
    portfolioLabel: 'Portfolio',
    portfolioUrl: 'alexartazcoz.github.io',
    labels: {
      profile: 'PROFILE',
      experience: 'EXPERIENCE',
      education: 'EDUCATION',
      skills: 'SKILLS',
      languages: 'LANGUAGES',
    },
    profile:
      'I am in my fourth year of architecture at ETSAV (UPC). I move between drawing, physical models and the building site: I have spent time working on site and on the production side of a construction company. What interests me is working with what is already there, from the historic centres of medium sized cities to reclaimed objects, with reuse as the starting point.',
    jobs: [
      {
        role: 'Production Intern',
        meta: '· Egon Haus (construction company) · May to July 2026',
        detail:
          'In charge of the production side and introduced AI assisted workflows within a real, everyday work environment.',
      },
      {
        role: 'Research Intern',
        meta: '· UPC, La Salle URL · Jan 2025 to Jan 2026',
        detail:
          'Member of the research team that won the Generalitat de Catalunya competition on the abandonment of historic centres in medium sized Catalan cities: diagnosis of Ripoll, Valls, Tortosa, Berga and Balaguer, and a pilot adaptive reuse project for Balaguer’s historic centre.',
      },
      {
        role: 'Sales Associate (part time)',
        meta: '· Bosch i Casals · Sep 2024 to Present',
        detail:
          'Persuasive communication and commercial awareness through direct to consumer sales.',
      },
      {
        role: 'Front Desk Client Services',
        meta: '· West Glacier RV, Montana, USA · Summer 2024',
        detail:
          'Client relations and English fluency in a fast paced American work environment.',
      },
      {
        role: 'Construction Labourer',
        meta: '· COSAFEL 2017 SL · Summers 2022 & 2023',
        detail:
          'On site knowledge of materials and building processes, translating architectural drawings into built work.',
      },
    ],
    education: {
      role: 'Degree in Architecture Studies (GEArch)',
      meta: '· ETSAV, UPC · 2023 to Present',
      detail: 'Fourth year, average mark 8.1/10',
    },
    skills: [
      { group: 'Modeling & CAD', items: 'Rhinoceros, AutoCAD, Revit' },
      { group: 'Graphics & Layout', items: 'Illustrator, Photoshop, InDesign, Affinity' },
      { group: 'Computational & GIS', items: 'Grasshopper, QGIS, Python' },
      { group: 'AI in everyday work', items: 'Claude Code' },
    ],
    languages: 'Catalan and Spanish (native) · English (proficient)',
  },

  ca: {
    subtitle: 'Estudiant d’arquitectura · ETSAV, UPC · Barcelona',
    contact: ['+34 686 232 368', 'artazcoz.arch@gmail.com', 'Barcelona, Espanya'],
    portfolioLabel: 'Portafolis',
    portfolioUrl: 'alexartazcoz.github.io',
    labels: {
      profile: 'PERFIL',
      experience: 'EXPERIÈNCIA',
      education: 'FORMACIÓ',
      skills: 'COMPETÈNCIES',
      languages: 'IDIOMES',
    },
    profile:
      'Estudio quart d’arquitectura a l’ETSAV (UPC). Em moc entre el dibuix, la maqueta i l’obra: he passat temps a peu d’obra i a la producció d’una constructora. M’interessa treballar sobre allò que ja existeix, des dels centres històrics de ciutats mitjanes fins als objectes recuperats, amb el reaprofitament com a punt de partida.',
    jobs: [
      {
        role: 'Becari de producció',
        meta: '· Egon Haus (constructora) · Maig a juliol 2026',
        detail:
          'Responsable de l’àrea de producció. Vaig introduir i desenvolupar fluxos de treball amb IA en un entorn de feina real i quotidià.',
      },
      {
        role: 'Becari de recerca',
        meta: '· UPC, La Salle URL · Gener 2025 a gener 2026',
        detail:
          'Membre de l’equip de recerca guanyador del concurs de la Generalitat de Catalunya sobre l’abandonament dels centres històrics de ciutats mitjanes catalanes: diagnosi de Ripoll, Valls, Tortosa, Berga i Balaguer, i un projecte pilot de reutilització adaptativa per al centre històric de Balaguer.',
      },
      {
        role: 'Dependent (mitja jornada)',
        meta: '· Bosch i Casals · Setembre 2024 a l’actualitat',
        detail:
          'Comunicació persuasiva i visió comercial a través de la venda directa al consumidor.',
      },
      {
        role: 'Atenció al client a recepció',
        meta: '· West Glacier RV, Montana, EUA · Estiu 2024',
        detail:
          'Relació amb el client i fluïdesa en anglès en un entorn de treball americà d’alt ritme.',
      },
      {
        role: 'Peó de construcció',
        meta: '· COSAFEL 2017 SL · Estius 2022 & 2023',
        detail:
          'Coneixement directe a l’obra de materials i processos constructius, traduint els plànols arquitectònics en obra construïda.',
      },
    ],
    education: {
      role: 'Grau en Estudis d’Arquitectura (GEArch)',
      meta: '· ETSAV, UPC · 2023 a l’actualitat',
      detail: 'Quart curs, nota mitjana 8,1/10',
    },
    skills: [
      { group: 'Modelatge & CAD', items: 'Rhinoceros, AutoCAD, Revit' },
      { group: 'Gràfics & Maquetació', items: 'Illustrator, Photoshop, InDesign, Affinity' },
      { group: 'Computació & SIG', items: 'Grasshopper, QGIS, Python' },
      { group: 'IA en el dia a dia', items: 'Claude Code' },
    ],
    languages: 'Català i castellà (nivell natiu) · Anglès (nivell avançat)',
  },

  es: {
    subtitle: 'Estudiante de arquitectura · ETSAV, UPC · Barcelona',
    contact: ['+34 686 232 368', 'artazcoz.arch@gmail.com', 'Barcelona, España'],
    portfolioLabel: 'Portafolio',
    portfolioUrl: 'alexartazcoz.github.io',
    labels: {
      profile: 'PERFIL',
      experience: 'EXPERIENCIA',
      education: 'FORMACIÓN',
      skills: 'COMPETENCIAS',
      languages: 'IDIOMAS',
    },
    profile:
      'Estudio cuarto de arquitectura en la ETSAV (UPC). Me muevo entre el dibujo, la maqueta y la obra: he pasado tiempo a pie de obra y en la producción de una constructora. Me interesa trabajar sobre lo que ya existe, desde los centros históricos de ciudades medianas hasta los objetos recuperados, con el reaprovechamiento como punto de partida.',
    jobs: [
      {
        role: 'Becario de producción',
        meta: '· Egon Haus (constructora) · Mayo a julio 2026',
        detail:
          'Responsable del área de producción. Introduje y desarrollé flujos de trabajo con IA en un entorno de trabajo real y cotidiano.',
      },
      {
        role: 'Becario de investigación',
        meta: '· UPC, La Salle URL · Enero 2025 a enero 2026',
        detail:
          'Miembro del equipo de investigación ganador del concurso de la Generalitat de Catalunya sobre el abandono de los centros históricos de ciudades medianas catalanas: diagnóstico de Ripoll, Valls, Tortosa, Berga y Balaguer, y un proyecto piloto de reutilización adaptativa para el centro histórico de Balaguer.',
      },
      {
        role: 'Dependiente (media jornada)',
        meta: '· Bosch i Casals · Septiembre 2024 a la actualidad',
        detail:
          'Comunicación persuasiva y visión comercial a través de la venta directa al consumidor.',
      },
      {
        role: 'Atención al cliente en recepción',
        meta: '· West Glacier RV, Montana, EE. UU. · Verano 2024',
        detail:
          'Relación con el cliente y fluidez en inglés en un entorno de trabajo estadounidense de ritmo rápido.',
      },
      {
        role: 'Peón de construcción',
        meta: '· COSAFEL 2017 SL · Veranos 2022 & 2023',
        detail:
          'Conocimiento directo en obra de materiales y procesos constructivos, traduciendo los planos arquitectónicos en obra construida.',
      },
    ],
    education: {
      role: 'Grado en Estudios de Arquitectura (GEArch)',
      meta: '· ETSAV, UPC · 2023 a la actualidad',
      detail: 'Cuarto curso, nota media 8,1/10',
    },
    skills: [
      { group: 'Modelado & CAD', items: 'Rhinoceros, AutoCAD, Revit' },
      { group: 'Gráficos & Maquetación', items: 'Illustrator, Photoshop, InDesign, Affinity' },
      { group: 'Computación & SIG', items: 'Grasshopper, QGIS, Python' },
      { group: 'IA en el día a día', items: 'Claude Code' },
    ],
    languages: 'Catalán y español (nivel nativo) · Inglés (nivel avanzado)',
  },
};
