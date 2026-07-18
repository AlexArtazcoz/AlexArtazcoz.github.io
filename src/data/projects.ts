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
      en: 'Research on the abandonment of the historic centres of Catalonia’s mid-sized cities, within the team of UPC and La Salle URL architects that won the Generalitat de Catalunya competition: a diagnosis of Ripoll, Valls, Tortosa, Berga and Balaguer, and a pilot adaptive-reuse project for Balaguer’s historic centre.\n\nThe diagnosis is built layer by layer, drawing each old town until what statistics cannot explain becomes visible: Nolli plans of solid and void, ground-floor uses, the age and condition of the building stock, dwellings per plot, facilities and green space, and street-by-street photographic surveys. On that knowledge, the Balaguer pilot proposes the adaptive re-use of specific buildings in the historic centre: a way of showing that the soundest housing policy is to inhabit again what is already built.',
      ca: 'Recerca sobre l’abandonament dels centres històrics de les ciutats mitjanes catalanes, dins l’equip d’arquitectes de la UPC i de La Salle URL guanyador del concurs de la Generalitat de Catalunya: diagnosi de Ripoll, Valls, Tortosa, Berga i Balaguer, i projecte pilot de re-ús adaptatiu al nucli històric de Balaguer.\n\nLa diagnosi es construeix capa a capa, dibuixant cada casc antic fins a fer visible allò que les estadístiques no expliquen: plànols Nolli del ple i el buit, usos de les plantes baixes, edat i estat de l’edificació, habitatges per parcel·la, equipaments i verd, i aixecaments fotogràfics carrer a carrer. Sobre aquest coneixement, el pilot de Balaguer proposa el re-ús adaptatiu d’edificis concrets del nucli antic: una manera de demostrar que la millor política d’habitatge és tornar a habitar allò que ja està construït.',
      es: 'Investigación sobre el abandono de los centros históricos de las ciudades medianas catalanas, dentro del equipo de arquitectos de la UPC y La Salle URL ganador del concurso de la Generalitat de Cataluña: diagnosis de Ripoll, Valls, Tortosa, Berga y Balaguer, y proyecto piloto de reúso adaptativo en el centro histórico de Balaguer.\n\nLa diagnosis se construye capa a capa, dibujando cada casco antiguo hasta hacer visible lo que las estadísticas no explican: planos Nolli del lleno y el vacío, usos de las plantas bajas, edad y estado de la edificación, viviendas por parcela, equipamientos y verde, y levantamientos fotográficos calle a calle. Sobre ese conocimiento, el piloto de Balaguer propone el reúso adaptativo de edificios concretos del casco antiguo: una manera de demostrar que la mejor política de vivienda es volver a habitar lo que ya está construido.',
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
    location: {
      en: 'Ca n’Ametller, Sant Cugat del Vallès (Barcelona)',
      ca: 'Ca n’Ametller, Sant Cugat del Vallès (Barcelona)',
      es: 'Ca n’Ametller, Sant Cugat del Vallès (Barcelona)',
    },
    concept: {
      en: 'Regenerating a residential fabric starting from the street. Everything begins with one question: what happens if we rethink mobility? Buses get routes of their own, cars are restricted, and the freed street becomes a commercial axis and a meeting place again. At ground level the plans turn extremely permeable: housing, shops and the inner courtyards face each other once more. From that first move on mobility, the whole fabric regenerates.\n\nHow we told it matters to me as much as the proposal: alongside the siting, the detailed plan and the general sections, the final presentation carries twelve hand drawings down its side, recording our whole way of thinking and its evolution, from the first intuition to the project.',
      ca: 'Regenerar un teixit residencial començant pel carrer. Tot neix d’una pregunta: què passa si repensem la mobilitat? Els autobusos guanyen recorreguts propis, el cotxe queda restringit, i el carrer alliberat torna a ser eix comercial i espai de trobada. A peu de carrer, les plantes es fan extremadament permeables: l’habitatge, el comerç i l’interior d’illa tornen a mirar-se. D’aquest primer gest sobre la mobilitat en neix la regeneració de tot el teixit.\n\nLa manera d’explicar-ho m’importa tant com la proposta: al costat de l’emplaçament, la planta de detall i les seccions generals, la presentació final porta al lateral dotze dibuixos a mà que recullen tot el nostre pensament i la seva evolució, de la primera intuïció fins al projecte.',
      es: 'Regenerar un tejido residencial empezando por la calle. Todo nace de una pregunta: ¿qué pasa si repensamos la movilidad? Los autobuses ganan recorridos propios, el coche queda restringido, y la calle liberada vuelve a ser eje comercial y espacio de encuentro. A pie de calle, las plantas se hacen extremadamente permeables: la vivienda, el comercio y el interior de manzana vuelven a mirarse. De este primer gesto sobre la movilidad nace la regeneración de todo el tejido.\n\nLa manera de contarlo me importa tanto como la propuesta: junto al emplazamiento, la planta de detalle y las secciones generales, la presentación final lleva en el lateral doce dibujos a mano que recogen todo nuestro pensamiento y su evolución, de la primera intuición hasta el proyecto.',
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
      en: 'From the given materiality and conditions, a wall organises the project, separating the fixed from the temporary, the essential from the superficial. From the original wall derive variants adapted to every scale, from the unit to the settlement, and each typology integrates its services into it: Canadian wells, showers, sinks, water tanks, rain collectors. Everything is absorbed into the fixed, permanent part of the project, which frees an ambiguous central space for each artist to make their own.\n\nThe workshops are diaphanous, unitary spaces: four walls, a single source of light and no partitions. They are always entered from above, because arrival is an act of descent; below, the space reveals itself whole under exclusively zenithal light, falling through a fully glazed single-pitch roof resting on three trusses. Vertical ceramics give the walls their material unity; horizontal steel reduces the structure to three light beams: the dialogue between the project’s two truths.',
      ca: 'A partir de la materialitat i les condicions donades, un mur organitza el projecte separant el fix del temporal, l’essencial del superficial. Del mur origen en deriven variants adaptades a cada escala, de la unitat a l’assentament, i cada tipologia hi integra les instal·lacions: pous canadencs, dutxes, piques, dipòsits d’aigua, recollidors de pluja. Tot queda absorbit en la part fixa i permanent del projecte, que allibera un espai central ambigu perquè cada artista el faci seu.\n\nEls tallers són espais diàfans i unitaris: quatre parets, una única font de llum i cap partició. S’hi entra sempre des d’una cota superior, perquè l’entrada és un acte de descens; a baix, l’espai es revela sencer sota una llum exclusivament zenital, que travessa una coberta inclinada tota de vidre recolzada sobre tres encavallades. La ceràmica vertical dóna unitat material als murs; l’acer horitzontal redueix l’estructura a tres bigues lleugeres: el diàleg entre les dues veritats del projecte.',
      es: 'A partir de la materialidad y las condiciones dadas, un muro organiza el proyecto separando lo fijo de lo temporal, lo esencial de lo superficial. Del muro origen derivan variantes adaptadas a cada escala, de la unidad al asentamiento, y cada tipología integra en él las instalaciones: pozos canadienses, duchas, fregaderos, depósitos de agua, recogedores de lluvia. Todo queda absorbido en la parte fija y permanente del proyecto, que libera un espacio central ambiguo para que cada artista lo haga suyo.\n\nLos talleres son espacios diáfanos y unitarios: cuatro paredes, una única fuente de luz y ninguna partición. Se entra siempre desde una cota superior, porque la entrada es un acto de descenso; abajo, el espacio se revela entero bajo una luz exclusivamente cenital, que atraviesa una cubierta inclinada toda de vidrio apoyada sobre tres cerchas. La cerámica vertical da unidad material a los muros; el acero horizontal reduce la estructura a tres vigas ligeras: el diálogo entre las dos verdades del proyecto.',
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
    location: {
      en: 'Donostia-San Sebastián, Basque Country',
      ca: 'Donostia, País Basc',
      es: 'San Sebastián, País Vasco',
    },
    studio: { en: 'ETSAV — UPC', ca: 'ETSAV — UPC', es: 'ETSAV — UPC' },
    concept: {
      en: 'More than one project, a way of thinking: the studio advances through successive themes, ordered by letters and always worked through the model, changing object at every step. We travelled there to stand before each thing we would work on: collectivity at the Tabakalera complex, energy and climate at the Miramar Palace, the landscape of the territory, abstraction in the mountain tunnels, materiality measured in the CO₂ of its materials. Each theme leaves a lesson that carries into the next one.\n\nThe journey begins and ends at the Luzuriaga offices: the final project orders the five learnt conditions and makes them its own in one total building, with a new core that connects the climatic double skin, the sleeping capsules and the renovated offices, and that reaches into the mountain to tie the building to the city and the festival.',
      ca: 'Més que un projecte, una manera de pensar: el curs avança per temes successius, ordenats per lletres i treballats sempre des de la maqueta, canviant d’objecte a cada pas. Vam viatjar-hi per presenciar cada objecte abans de treballar-lo: la col·lectivitat al conjunt de Tabakalera, l’energia i el clima al Palau de Miramar, el paisatge del territori, l’abstracció als túnels de la muntanya, la materialitat mesurada en el CO₂ dels materials. Cada tema deixa una lliçó que passa al següent.\n\nEl recorregut comença i acaba a les oficines Luzuriaga: el projecte final hi ordena i s’apropia de les cinc condicions apreses en un edifici total, amb un nou nucli que connecta la doble pell climàtica, les càpsules dormitori i les oficines renovades, i que s’endinsa a la muntanya per lligar l’edifici amb la ciutat i el festival.',
      es: 'Más que un proyecto, una manera de pensar: el curso avanza por temas sucesivos, ordenados por letras y trabajados siempre desde la maqueta, cambiando de objeto a cada paso. Viajamos allí para presenciar cada objeto antes de trabajarlo: la colectividad en el conjunto de Tabakalera, la energía y el clima en el Palacio de Miramar, el paisaje del territorio, la abstracción en los túneles de la montaña, la materialidad medida en el CO₂ de los materiales. Cada tema deja una lección que pasa al siguiente.\n\nEl recorrido empieza y acaba en las oficinas Luzuriaga: el proyecto final ordena y se apropia de las cinco condiciones aprendidas en un edificio total, con un nuevo núcleo que conecta la doble piel climática, las cápsulas dormitorio y las oficinas renovadas, y que se adentra en la montaña para ligar el edificio con la ciudad y el festival.',
    },
  },
  {
    slug: 'tap-iii',
    title: { en: 'Orion', ca: 'Orió', es: 'Orión' },
    year: '2024',
    type: { en: 'Architecture studio II', ca: 'Taller d’arquitectura II', es: 'Taller de arquitectura II' },
    location: noLoc,
    concept: {
      en: 'Three forgotten pieces of furniture, rescued from the bin and redesigned into a new object. From the wardrobe and the dressing table we keep the wood, which gives it strength and skeleton; from the sofa, the comfort of its fabrics and foam. From that crossing comes Orion, a design hybrid that takes from each piece what it did best.\n\nLike the constellation, Orion joins by parts: the pieces connect to one another according to context and use, and recombine for every need. No new material: only a new way of looking at what we already had.',
      ca: 'Tres mobles oblidats, rescatats de les escombraries i reprojectats en un objecte nou. De l’armari i el tocador en guardem la fusta, que en dóna la resistència i l’esquelet; del sofà, la comoditat de les teles i l’escuma. Del creuament en neix Orió, un híbrid projectual que pren de cada moble allò que sabia fer millor.\n\nCom la constel·lació, Orió s’uneix per parts: les peces es connecten entre elles segons el context i l’ús, i es recombinen per a cada necessitat. Cap material nou: només una nova manera de mirar allò que ja teníem.',
      es: 'Tres muebles olvidados, rescatados de la basura y reproyectados en un objeto nuevo. Del armario y el tocador guardamos la madera, que le da la resistencia y el esqueleto; del sofá, la comodidad de sus telas y su espuma. Del cruce nace Orión, un híbrido proyectual que toma de cada mueble lo que sabía hacer mejor.\n\nComo la constelación, Orión se une por partes: las piezas se conectan entre sí según el contexto y el uso, y se recombinan para cada necesidad. Ningún material nuevo: solo una nueva manera de mirar lo que ya teníamos.',
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
      en: 'A first contact with the project: ten exercises on form and space, from the lamp to colour, where everything learnt converges in the final work. And it is that final delivery I hold dearest: a community of workshop dwellings with shared bathrooms, which optimises the urban footprint to give space and quality to the inside of every unit.\n\nThe typology I created there is built in double height and with diagonal lines: wood as its material, very generous spaces where they are truly needed, like the living room and the bedroom, and tighter, more enclosed realms for the workshop. I wanted aesthetics and function to be the same gesture.',
      ca: 'El primer contacte amb el projecte: deu exercicis de forma i espai, de la làmpada al color, on tot el que s’aprèn conflueix en el treball final. I és l’entrega final el que més m’estimo: una comunitat d’habitatges taller amb els lavabos comunitaris, que optimitza la implantació urbanística per donar espai i qualitat a l’interior de cada unitat.\n\nLa tipologia que hi vaig crear es construeix en doble alçada i amb línies diagonals: materialitat de fusta, espais molt amplis allà on realment calen, com la sala d’estar i el dormitori, i àmbits més tancats per al taller. Volia que l’estètica i la funció fossin el mateix gest.',
      es: 'El primer contacto con el proyecto: diez ejercicios de forma y espacio, de la lámpara al color, donde todo lo aprendido confluye en el trabajo final. Y es esa entrega final lo que más aprecio: una comunidad de viviendas taller con los baños comunitarios, que optimiza la implantación urbanística para dar espacio y calidad al interior de cada unidad.\n\nLa tipología que creé allí se construye en doble altura y con líneas diagonales: materialidad de madera, espacios muy amplios donde de verdad hacen falta, como la sala de estar y el dormitorio, y ámbitos más cerrados para el taller. Quería que la estética y la función fueran el mismo gesto.',
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
      en: 'The course’s graphic evolution: starting with hand drawing, moving into digital expression with a poster, drawing in the street and, to finish, technically tracing the CCCB of Barcelona as it changes over time.\n\nAbove all, it is my own evolution: from drawing and watercolour to graphic expression and digital design, each technique added a layer to the same learning. Today I can explain an idea with a clear visual argument and a graphically structured discourse, and that is how I think and communicate my projects.',
      ca: 'L’evolució gràfica de l’assignatura: es comença dibuixant a mà, es passa a l’expressió digital amb un cartell, es dibuixa al carrer i, per acabar, es traça tècnicament l’evolució del CCCB de Barcelona en el temps.\n\nPerò sobretot és la meva pròpia evolució: del dibuix i l’aquarel·la a l’expressió gràfica i el disseny digital, cada tècnica hi va afegir una capa del mateix aprenentatge. Avui puc explicar una idea amb un argument visual clar i un discurs estructurat gràficament, i aquesta és la manera com penso i comunico els projectes.',
      es: 'La evolución gráfica de la asignatura: se empieza dibujando a mano, se pasa a la expresión digital con un cartel, se dibuja en la calle y, para acabar, se traza técnicamente la evolución del CCCB de Barcelona en el tiempo.\n\nPero sobre todo es mi propia evolución: del dibujo y la acuarela a la expresión gráfica y el diseño digital, cada técnica añadió una capa al mismo aprendizaje. Hoy puedo explicar una idea con un argumento visual claro y un discurso estructurado gráficamente, y esa es la manera en que pienso y comunico los proyectos.',
    },
  },
];
