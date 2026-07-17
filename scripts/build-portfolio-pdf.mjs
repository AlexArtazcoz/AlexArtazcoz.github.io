/**
 * Auto-generate the studio-application portfolio PDF from the website's own
 * content (projects.ts + layout.json + src/assets) so the booklet can never
 * drift out of sync with the site. One file per language:
 *
 *   public/Alex-Artazcoz-Portfolio-{EN,CA,ES}.pdf
 *
 * Format: A4 landscape, cover + 1–2 pages per project (title, fact sheet,
 * concept, best images in canvas order) + contact page, in the site's quiet
 * aesthetic (white, hairlines, Helvetica ≈ Archivo).
 *
 * Re-run after content changes:  node scripts/build-portfolio-pdf.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { projects } from '../src/data/projects.ts';
import { site } from '../src/data/site.ts';
import { ui } from '../src/i18n/ui.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(root, 'src', 'assets');
const layout = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'layout.json'), 'utf8'));
const HOST = (fs.readFileSync(path.join(root, 'astro.config.mjs'), 'utf8').match(/site:\s*'https?:\/\/([^']+)'/) ?? [])[1] ?? '';

const W = 841.89; // A4 landscape, pt
const H = 595.28;
const M = 48;
const INK = rgb(0.08, 0.08, 0.08);
const GREY = rgb(0.54, 0.54, 0.53);
const HAIR = rgb(0.89, 0.89, 0.88);

/** WinAnsi cannot encode every glyph in the texts — normalize the strays. */
const safe = (s) =>
  s
    .replace(/ /g, ' ')
    .replace(/[–−]/g, '-')
    .replace(/…/g, '...');

/** Greedy wrap by measured width. */
function wrap(text, font, size, width) {
  const lines = [];
  for (const hard of safe(text).split('\n')) {
    let line = '';
    for (const word of hard.split(' ')) {
      const probe = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(probe, size) <= width) line = probe;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** The images a project shows: the editor's "◈ Selecció" picks when present
 * (the same set that cycles on the index-card hover), canvas order otherwise.
 * The cover always leads. Each entry carries the canvas crop so the booklet
 * keeps the trim/rotation given in the layout editor. */
function projectImages(p, max = 4) {
  const dir = path.join(ASSETS, p.slug);
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const byStem = new Map(files.map((f) => [f.replace(/\.\w+$/, ''), path.join(dir, f)]));
  const saved = layout[p.slug] ?? {};
  const items = (saved.items ?? []).filter((i) => !i.hidden);
  const cropByName = new Map(items.map((i) => [i.img, i.crop]));
  const order = items.map((i) => i.img);
  const coverName = saved.cover ?? p.cover ?? order[0] ?? files[0]?.replace(/\.\w+$/, '');
  const chosen = (saved.picks ?? []).length ? saved.picks : order;
  const names = [coverName, ...chosen.filter((n) => n !== coverName)];
  const out = [];
  for (const n of names) {
    const file = byStem.get(n);
    if (file && !out.some((e) => e.file === file)) out.push({ file, crop: cropByName.get(n) });
    if (out.length === max) break;
  }
  return out;
}

/** Cache key: same file + same trim/rotation → same prepared JPEG. */
const entryKey = (e) =>
  `${e.file}|${JSON.stringify(e.crop?.trim ?? 0)}|${e.crop?.rot ?? 0}`;

/** Resize/encode once (canvas trim + quarter-turn applied), reused across the
 * three language editions. */
const jpgCache = new Map();
async function preparedJpg(entry) {
  try {
    return await preparedJpgInner(entry);
  } catch (err) {
    err.message = `${path.basename(entry.file)}: ${err.message}`;
    throw err;
  }
}
async function preparedJpgInner(entry) {
  const k = entryKey(entry);
  if (!jpgCache.has(k)) {
    let img = sharp(entry.file, { limitInputPixels: false });
    const tr = entry.crop?.trim;
    if (tr && (tr.t || tr.r || tr.b || tr.l)) {
      const m = await img.metadata();
      const left = Math.floor(m.width * (tr.l ?? 0));
      const top = Math.floor(m.height * (tr.t ?? 0));
      img = img.extract({
        left,
        top,
        width: Math.max(1, Math.min(m.width - left, Math.round(m.width * (1 - (tr.l ?? 0) - (tr.r ?? 0))))),
        height: Math.max(1, Math.min(m.height - top, Math.round(m.height * (1 - (tr.t ?? 0) - (tr.b ?? 0))))),
      });
      // sharp runs rotate BEFORE extract regardless of call order — flatten
      // the trim to pixels first so the quarter-turn happens after it.
      if (entry.crop?.rot) img = sharp(await img.png().toBuffer(), { limitInputPixels: false });
    }
    if (entry.crop?.rot) img = img.rotate(entry.crop.rot);
    const buf = await img
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
    jpgCache.set(k, buf);
  }
  return jpgCache.get(k);
}

/** Contain-fit `img` into the box and draw it, top-aligned. */
function drawContained(page, img, box) {
  const s = Math.min(box.w / img.width, box.h / img.height);
  const w = img.width * s;
  const h = img.height * s;
  page.drawImage(img, { x: box.x + (box.w - w) / 2, y: box.y + box.h - h, width: w, height: h });
}

function footer(page, fonts, label, num) {
  page.drawText(safe(label), { x: M, y: 24, size: 7.5, font: fonts.reg, color: GREY });
  const numText = String(num);
  page.drawText(numText, { x: W - M - fonts.reg.widthOfTextAtSize(numText, 7.5), y: 24, size: 7.5, font: fonts.reg, color: GREY });
}

async function buildEdition(lang) {
  const T = ui[lang];
  const doc = await PDFDocument.create();
  doc.setTitle(`${site.name} — Portfolio`);
  doc.setAuthor(site.name);
  doc.setSubject(safe(T.meta_description));
  const fonts = {
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const embedded = new Map();
  const embed = async (entry) => {
    const k = entryKey(entry);
    if (!embedded.has(k)) embedded.set(k, await doc.embedJpg(await preparedJpg(entry)));
    return embedded.get(k);
  };

  // ── Cover
  const cover = doc.addPage([W, H]);
  const mono = ['M4 26 L11.5 6 L19 26', 'M13 26 L20.5 6 L28 26', 'M7.4 19.5 L24.6 19.5'];
  for (const d of mono) {
    cover.drawSvgPath(d, { x: M, y: H - M - 8, scale: 1.6, borderColor: INK, borderWidth: 1.6 });
  }
  cover.drawText(site.name, { x: M, y: H / 2 + 16, size: 40, font: fonts.bold, color: INK });
  cover.drawText(safe(`${site.role[lang]} — ${site.location}`), { x: M, y: H / 2 - 12, size: 13, font: fonts.reg, color: GREY });
  cover.drawLine({ start: { x: M, y: H / 2 - 34 }, end: { x: M + 56, y: H / 2 - 34 }, thickness: 1.2, color: INK });
  cover.drawText('Portfolio 2023—2026', { x: M, y: H / 2 - 58, size: 11, font: fonts.reg, color: GREY });
  cover.drawText(safe(`${site.email} · ${HOST}`), { x: M, y: M - 8, size: 9, font: fonts.reg, color: GREY });

  // ── Projects
  let pageNum = 1;
  for (const p of projects) {
    const images = projectImages(p);
    const page = doc.addPage([W, H]);
    pageNum += 1;

    // Text column
    const colW = 240;
    let y = H - M - 20;
    page.drawText(safe(p.title[lang]), { x: M, y, size: 20, font: fonts.bold, color: INK });
    y -= 26;
    const fitxa = [
      [T.fitxa_program, p.type[lang]],
      [T.fitxa_location, p.location[lang]],
      [T.fitxa_year, p.year],
      [T.fitxa_studio, p.studio?.[lang] ?? ''],
    ].filter(([, v]) => v);
    for (const [label, value] of fitxa) {
      for (const line of wrap(`${label}: ${value}`, fonts.reg, 8.5, colW)) {
        page.drawText(line, { x: M, y, size: 8.5, font: fonts.reg, color: GREY });
        y -= 12.5;
      }
    }
    y -= 10;
    for (const line of wrap(p.concept[lang], fonts.reg, 9.5, colW)) {
      page.drawText(line, { x: M, y, size: 9.5, font: fonts.reg, color: INK, lineHeight: 14 });
      y -= 14;
    }

    // Cover image on the right
    if (images[0]) {
      drawContained(page, await embed(images[0]), { x: M + colW + 40, y: M + 8, w: W - 2 * M - colW - 40, h: H - 2 * M - 8 });
    }
    footer(page, fonts, `${site.name} — Portfolio`, pageNum);

    // Second page: the next images as one equal-height editorial row
    const extras = images.slice(1);
    if (extras.length) {
      const page2 = doc.addPage([W, H]);
      pageNum += 1;
      const gut = 14;
      const availW = W - 2 * M - gut * (extras.length - 1);
      const availH = H - 2 * M;
      const imgs = [];
      for (const f of extras) imgs.push(await embed(f));
      const sumAspect = imgs.reduce((s, i) => s + i.width / i.height, 0);
      const rowH = Math.min(availH, availW / sumAspect);
      const rowW = rowH * sumAspect + gut * (imgs.length - 1);
      let x = M + (W - 2 * M - rowW) / 2;
      const yRow = M + (availH - rowH) / 2;
      for (const img of imgs) {
        const w = (img.width / img.height) * rowH;
        page2.drawImage(img, { x, y: yRow, width: w, height: rowH });
        x += w + gut;
      }
      footer(page2, fonts, safe(`${site.name} — ${p.title[lang]}`), pageNum);
    }
  }

  // ── Contact
  const back = doc.addPage([W, H]);
  back.drawText(safe(T.info_contact), { x: M, y: H / 2 + 40, size: 11, font: fonts.bold, color: GREY });
  back.drawText(site.email, { x: M, y: H / 2 + 12, size: 16, font: fonts.reg, color: INK });
  back.drawText(safe(HOST), { x: M, y: H / 2 - 12, size: 12, font: fonts.reg, color: GREY });
  back.drawText(safe(`${site.name} — ${site.role[lang]}, ${site.location}`), { x: M, y: M - 8, size: 9, font: fonts.reg, color: GREY });

  const bytes = await doc.save();
  const out = path.join(root, 'public', `Alex-Artazcoz-Portfolio-${lang.toUpperCase()}.pdf`);
  fs.writeFileSync(out, bytes);
  console.log(`✔ ${path.basename(out)} (${(bytes.length / 1e6).toFixed(1)}MB, ${doc.getPageCount()} pages)`);
}

for (const lang of ['en', 'ca', 'es']) await buildEdition(lang);
