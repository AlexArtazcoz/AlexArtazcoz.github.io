/**
 * Re-rasterize every portfolio image from its source PDF (or original JPG) at
 * maximum useful quality, overwriting the files in src/assets/ IN PLACE — same
 * filename stems, same aspect ratios — so the saved canvas layouts keep
 * working untouched. Vector plans are rendered large (deep-zoom material);
 * raster-heavy sources get a lower cap since upscaling adds nothing.
 *
 * Safety: a new image only replaces the old one if its aspect ratio matches
 * the existing file (±1%). Mismatches are reported and skipped.
 *
 * Run from the repo root:  node scripts/rasterize-pdfs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(root, 'src', 'assets');
const P = 'C:/CLAUDE/PORTFOLIO';
const STD_FONTS = pathToFileURL(path.join(root, 'node_modules', 'pdfjs-dist', 'standard_fonts')).href + '/';
// Without the WASM decoders, JPEG2000 images inside a PDF render BLANK in Node.
const WASM = pathToFileURL(path.join(root, 'node_modules', 'pdfjs-dist', 'wasm')).href + '/';
const OPTS = { standardFontDataUrl: STD_FONTS, wasmUrl: WASM, verbosity: 0 };

/** Optional filter: RASTER_ONLY="tap-vi/,balaguer/13" re-renders matching jobs only. */
const only = (process.env.RASTER_ONLY ?? '').split(',').filter(Boolean);
const wanted = (job) => !only.length || only.some((p) => `${job.dir}/${job.stem}`.startsWith(p));

/**
 * Find a file whose name may differ from ours only in Unicode normalization
 * (NFC vs NFD — these folders mix files from Windows, Mac and WhatsApp).
 */
function resolveFile(p) {
  if (fs.existsSync(p)) return p;
  const dir = path.dirname(p);
  const want = path.basename(p).normalize('NFC');
  for (const entry of fs.readdirSync(dir)) {
    if (entry.normalize('NFC') === want) return path.join(dir, entry);
  }
  const loose = (s) => s.normalize('NFD').replace(/[^a-z0-9]/gi, '').toLowerCase();
  for (const entry of fs.readdirSync(dir)) {
    if (loose(entry) === loose(want)) return path.join(dir, entry);
  }
  throw new Error(`not found: ${p}`);
}

/** Long-edge targets: vector linework deserves deep zoom; rasters don't. */
const VECTOR = 6500;
const RASTER = 4500;
const BOOKLET = 4200;

/**
 * Every asset and where it comes from.
 *  - pdf jobs: { dir, stem, src, target, pages? , pad? } — multi-page PDFs
 *    write `${stem}-p${page}` using `pad` digits (pages asserts the count).
 *  - copy jobs: { dir, stem, copy } — the original file IS the best version.
 */
const jobs = [
  // ── Balaguer — urban research (all vector plans except ortophotos/photos)
  { dir: 'balaguer', stem: '01-orto-balaguer', src: `${P}/BALAGUER/PER CLAUDE/ORTOFOTOS/Casc Antic Balaguer Ortofoto.pdf`, target: RASTER },
  { dir: 'balaguer', stem: '02-nolli', src: `${P}/BALAGUER/PER CLAUDE/BALAGUER/01_Nolli.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '03-equipaments', src: `${P}/BALAGUER/PER CLAUDE/BALAGUER/02_Equipamientos.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '04-verd', src: `${P}/BALAGUER/PER CLAUDE/BALAGUER/03_Verde.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '05-plantes-baixes', src: `${P}/BALAGUER/PER CLAUDE/BALAGUER/04_Plantas Bajas.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '06-any-construccio', src: `${P}/BALAGUER/PER CLAUDE/ANALISI/01_Año de construccion.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '07-nombre-plantes', src: `${P}/BALAGUER/PER CLAUDE/ANALISI/02_Nº de plantas.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '08-habitatges-parcella', src: `${P}/BALAGUER/PER CLAUDE/ANALISI/03_Nº de viviendas por parcela.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '09-estat-edificis', src: `${P}/BALAGUER/PER CLAUDE/ANALISI/05_Estado de los edificios.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '10-foto-major', src: `${P}/BALAGUER/PER CLAUDE/FOTO/1_Major.pdf`, target: 3500 },
  { dir: 'balaguer', stem: '11-foto-torrent', src: `${P}/BALAGUER/PER CLAUDE/FOTO/2_Torrent.pdf`, target: 3500 },
  { dir: 'balaguer', stem: '12-foto-quadres', src: `${P}/BALAGUER/PER CLAUDE/FOTO/3_Q+A.pdf`, target: 3500 },
  { dir: 'balaguer', stem: '13-planols', src: `${P}/BALAGUER/PER CLAUDE/PLANOLS CONCRETS.pdf`, target: VECTOR, pages: 10, pad: 2 },
  { dir: 'balaguer', stem: '14-general-balaguer', src: `${P}/BALAGUER/PER CLAUDE/7500/MM_PL_GeneralBalaguer+VEG.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '15-general-berga', src: `${P}/BALAGUER/PER CLAUDE/7500/MM_PL_GeneralBerga + VEG.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '16-general-ripoll', src: `${P}/BALAGUER/PER CLAUDE/7500/MM_PL_GeneralRipoll + VEG.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '17-general-tortosa', src: `${P}/BALAGUER/PER CLAUDE/7500/MM_PL_GeneralTortosa+ VEG.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '18-general-valls', src: `${P}/BALAGUER/PER CLAUDE/7500/MM_PL_GeneralValls+VEG.pdf`, target: VECTOR },
  { dir: 'balaguer', stem: '19-orto-berga', src: `${P}/BALAGUER/PER CLAUDE/ORTOFOTOS/Casc Antic Berga Ortofoto.pdf`, target: RASTER },
  { dir: 'balaguer', stem: '20-orto-ripoll', src: `${P}/BALAGUER/PER CLAUDE/ORTOFOTOS/Casc Antic Ripoll Ortofoto.pdf`, target: RASTER },
  { dir: 'balaguer', stem: '21-orto-tortosa', src: `${P}/BALAGUER/PER CLAUDE/ORTOFOTOS/Casc Antic Tortosa Ortofoto.pdf`, target: RASTER },
  { dir: 'balaguer', stem: '22-orto-valls', src: `${P}/BALAGUER/PER CLAUDE/ORTOFOTOS/Casc Antic Valls Ortofoto.pdf`, target: RASTER },

  // ── RAP — originals are JPGs (native resolution); the visit booklet is a PDF
  { dir: 'rap', stem: '01-descomposicio', copy: `${P}/RAP/1.1.1_Santaeulàlia_Àlex_Descomposició.jpg` },
  { dir: 'rap', stem: '02-recomposicio', copy: `${P}/RAP/1.1.2_Santaeulàlia_Àlex_Recomposició.jpg` },
  { dir: 'rap', stem: '03-cartell', copy: `${P}/RAP/1.3.2_Santaeulàlia_Àlex_Cartell.jpg` },
  { dir: 'rap', stem: '06-img', src: `${P}/RAP/3.3_Santaeulàlia_Àlex_FINAL.pdf`, target: RASTER, pages: 7, pad: 1 },

  // ── TAP I — course booklet (48 PDF pages; page 2 is blank and was never
  // extracted, so the site's 47 files map to pages 1, 3..48)
  { dir: 'tap-i', stem: '01-llibret', src: `${P}/TAP I/Llibret Final F i E - Àlex Santaeulàlia.pdf`, target: 3200, pages: 48, skip: [2], pad: 2 },

  // ── TAP IV — course notebook + photo document.
  // (01-quadern has NO source here: its PDF is no longer in the TAP IV folder —
  // the 39-page “Un vecindario….pdf.pdf” is a different document. The existing
  // 3000px files are kept as-is.)
  { dir: 'tap-iv', stem: '02-imatges', src: `${P}/TAP IV/“Un vecindario repleto de extraños es una señal visible y tangible de la evaporación de las certezas, y un síntoma de que las perpectivas vitales –así como el destino del hecho mismo de tratar de .pdf (1).pdf`, target: BOOKLET, pages: 17, pad: 2 },
  { dir: 'tap-iv', stem: 'doc-20250611-wa0003', src: `${P}/TAP IV/DOC-20250611-WA0003..pdf`, target: BOOKLET, pages: 16, pad: 0 },

  // ── TAP V — sections & plans, all vector
  { dir: 'tap-v', stem: '01-seccio-2', src: `${P}/TAPV/01_Secció_Final2.pdf`, target: VECTOR },
  { dir: 'tap-v', stem: '02-a1-espaiemocional-1', src: `${P}/TAPV/A1_EspaiEmocional (1).pdf`, target: VECTOR },
  { dir: 'tap-v', stem: '03-calibrar-seccionslongitudinals-s-16-30', src: `${P}/TAPV/Calibrar_seccionslongitudinalsFINALS-16.30.pdf`, target: VECTOR },
  { dir: 'tap-v', stem: '04-planta-unitat-3', src: `${P}/TAPV/PLANTA UNITAT-Presentación3.pdf`, target: VECTOR },
  { dir: 'tap-v', stem: '05-planta-general-16-25', src: `${P}/TAPV/Planta General.16.25.pdf`, target: VECTOR },
  { dir: 'tap-v', stem: '06-t2b-seccio-espai-emocional', src: `${P}/TAPV/T2b_seccio espai emocional.pdf`, target: VECTOR, pages: 3, pad: 1 },
  { dir: 'tap-v', stem: '07-tap5-secciodetallunitat', src: `${P}/TAPV/TAP5_SeccióDetallUnitat_001_ALEX_FINAL.pdf`, target: VECTOR },
  { dir: 'tap-v', stem: '08-tap5-secciodetallestrategic', src: `${P}/TAPV/TAP5_SeccióDetalleSTRATÈGIC_001_FINAL.pdf`, target: VECTOR },

  // ── TAP VI — level plans, all vector
  { dir: 'tap-vi', stem: '01-l0-1', src: `${P}/TAPVI/01_G13_L0 (1).pdf`, target: VECTOR },
  { dir: 'tap-vi', stem: '02-l2', src: `${P}/TAPVI/03_G13_L2.pdf`, target: VECTOR },
  { dir: 'tap-vi', stem: '03-l3', src: `${P}/TAPVI/04_G13_L3.pdf`, target: VECTOR },
  { dir: 'tap-vi', stem: '04-l4', src: `${P}/TAPVI/05_G13_L4.pdf`, target: VECTOR },
];

/** Minimal JPEG dimension reader (SOF marker). */
function jpegDim(file) {
  const b = fs.readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

const sameAspect = (a, b) => Math.abs(a.w / a.h - b.w / b.h) / (a.w / a.h) < 0.01;

/** Replace `outFile` with `buf`, but only if the aspect ratio survives. */
function safeReplace(outFile, buf, newDim, report) {
  const old = jpegDim(outFile);
  if (old && !sameAspect(old, newDim)) {
    report.skipped.push(`${path.basename(outFile)}: aspect ${old.w}x${old.h} → ${newDim.w}x${newDim.h} MISMATCH`);
    return;
  }
  fs.writeFileSync(outFile, buf);
  report.written.push(`${path.basename(outFile)}: ${old ? `${old.w}x${old.h}` : 'new'} → ${newDim.w}x${newDim.h} (${(buf.length / 1e6).toFixed(1)}MB)`);
}

async function renderPdf(job, report) {
  let src = job.src;
  if (job.srcByPages) {
    // Two candidate files with unhelpful names — pick by page count.
    for (const cand of job.srcByPages) {
      const probe = getDocument({ data: new Uint8Array(fs.readFileSync(resolveFile(cand))), ...OPTS });
      const n = (await probe.promise).numPages;
      await probe.destroy();
      if (n === job.pages) { src = cand; break; }
    }
    if (!src) { report.skipped.push(`${job.stem}: no candidate PDF has ${job.pages} pages`); return; }
  }

  const task = getDocument({ data: new Uint8Array(fs.readFileSync(resolveFile(src))), ...OPTS });
  const doc = await task.promise;
  const expected = job.pages ?? 1;
  if (doc.numPages !== expected) {
    report.skipped.push(`${job.stem}: ${path.basename(src)} has ${doc.numPages} pages, expected ${expected}`);
    await task.destroy();
    return;
  }

  let out = 0;
  for (let p = 1; p <= doc.numPages; p++) {
    if (job.skip?.includes(p)) continue;
    out++;
    const page = await doc.getPage(p);
    const base = page.getViewport({ scale: 1 });
    const scale = job.target / Math.max(base.width, base.height);
    const viewport = page.getViewport({ scale });
    const w = Math.round(viewport.width);
    const h = Math.round(viewport.height);

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    await page.render({ canvasContext: ctx, viewport, background: '#ffffff' }).promise;
    const buf = await canvas.encode('jpeg', 88);
    page.cleanup();

    const name = job.pages ? `${job.stem}-p${String(out).padStart(job.pad, '0')}` : job.stem;
    safeReplace(path.join(ASSETS, job.dir, `${name}.jpg`), buf, { w, h }, report);
  }
  await task.destroy();
}

const report = { written: [], skipped: [] };
for (const job of jobs) {
  if (!wanted(job)) continue;
  const t0 = Date.now();
  try {
    if (job.copy) {
      const outFile = path.join(ASSETS, job.dir, `${job.stem}.jpg`);
      job.copy = resolveFile(job.copy);
      const dim = jpegDim(job.copy);
      const old = jpegDim(outFile);
      if (!dim) { report.skipped.push(`${job.stem}: cannot read ${job.copy}`); continue; }
      if (old && dim.w <= old.w && dim.h <= old.h) { report.skipped.push(`${job.stem}: original not larger (${dim.w}x${dim.h})`); continue; }
      safeReplace(outFile, fs.readFileSync(job.copy), dim, report);
    } else {
      await renderPdf(job, report);
    }
  } catch (err) {
    report.skipped.push(`${job.stem}: ERROR ${err.message}`);
  }
  console.log(`· ${job.dir}/${job.stem} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

console.log(`\n${report.written.length} written, ${report.skipped.length} skipped`);
for (const l of report.written) console.log('  ✔', l);
for (const l of report.skipped) console.log('  ⚠', l);
