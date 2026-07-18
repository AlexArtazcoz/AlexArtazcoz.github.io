/**
 * Auto-generate the studio-application portfolio PDF from the website's own
 * content (projects.ts + layout.json + src/assets) so the booklet can never
 * drift out of sync with the site. One file per language:
 *
 *   public/Alex-Artazcoz-Portfolio-{EN,CA,ES}.pdf
 *
 * Format: A4 landscape — cover, contents page, 1–2 pages per project (title,
 * fact sheet, concept, credits, best images in canvas order, link to the full
 * project online) and a contact page with a QR code to the site — in the
 * site's quiet aesthetic (white, hairlines, Helvetica ≈ Archivo).
 *
 * The booklet is deliberately a teaser: every page points back to the website,
 * where each project shows its complete canvas at full resolution.
 *
 * Re-run after content changes:  node scripts/build-portfolio-pdf.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from 'pdf-lib';
import { projects } from '../src/data/projects.ts';
import { site } from '../src/data/site.ts';
import { ui } from '../src/i18n/ui.ts';
import { clampTrim, hasTrim } from '../src/data/frame.ts';

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

/** Booklet-only wording (site UI strings live in src/i18n/ui.ts). */
const L = {
  en: {
    toc: 'Contents',
    web_cover: 'The complete work, at full resolution:',
    web_project: 'Full project online',
    web_contact: 'Every project, with its complete canvas of drawings, at',
  },
  ca: {
    toc: 'Índex',
    web_cover: 'L’obra completa, a màxima resolució:',
    web_project: 'Projecte complet a la web',
    web_contact: 'Tots els projectes, amb el seu canvas complet de dibuixos, a',
  },
  es: {
    toc: 'Índice',
    web_cover: 'La obra completa, a máxima resolución:',
    web_project: 'Proyecto completo en la web',
    web_contact: 'Todos los proyectos, con su lienzo completo de dibujos, en',
  },
};

/** Language-prefixed site URLs (EN lives at the root). */
const homeUrl = (lang) => `https://${HOST}/${lang === 'en' ? '' : `${lang}/`}`;
const projectUrl = (lang, slug) => `${homeUrl(lang)}projects/${slug}/`;
const displayUrl = (url) => url.replace(/^https:\/\//, '').replace(/\/$/, '');

/** WinAnsi cannot encode every glyph in the texts — normalize the strays. */
const safe = (s) =>
  s
    .replace(/ /g, ' ')
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

/** A clickable rectangle (URI action) — the PDF's links mirror the site's. */
function addLink(doc, page, x, y, w, h, url) {
  const ref = doc.context.register(
    doc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x, y, x + w, y + h],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
    }),
  );
  let annots = page.node.lookup(PDFName.of('Annots'));
  if (!annots) {
    annots = doc.context.obj([]);
    page.node.set(PDFName.of('Annots'), annots);
  }
  annots.push(ref);
}

/** The images a project shows: the editor's "◈ Selecció" picks when present
 * (the same set that cycles on the index-card hover), canvas order otherwise.
 * The cover always leads. Each entry carries the canvas crop so the booklet
 * keeps the trim/rotation given in the layout editor. */
function projectImages(p, max = 5) {
  const dir = path.join(ASSETS, p.slug);
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const byStem = new Map(files.map((f) => [f.replace(/\.\w+$/, ''), path.join(dir, f)]));
  const saved = layout[p.slug] ?? {};
  const items = (saved.items ?? []).filter((i) => !i.hidden);
  // An image may sit on the canvas more than once (duplicates); the booklet
  // uses the first placement's crop.
  const cropByName = new Map();
  for (const i of items) if (!cropByName.has(i.img)) cropByName.set(i.img, i.crop);
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
    // Same invariant as the site renderer: any cut goes, ≥2% must survive.
    const tr = hasTrim(entry.crop?.trim) ? clampTrim(entry.crop.trim) : null;
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

/** Contain-fit `img` into the box and draw it. */
function drawContained(page, img, box, { center = false } = {}) {
  const s = Math.min(box.w / img.width, box.h / img.height);
  const w = img.width * s;
  const h = img.height * s;
  const y = center ? box.y + (box.h - h) / 2 : box.y + box.h - h;
  page.drawImage(img, { x: box.x + (box.w - w) / 2, y, width: w, height: h });
}

function footer(page, fonts, label, num) {
  page.drawText(safe(label), { x: M, y: 24, size: 7.5, font: fonts.reg, color: GREY });
  const numText = String(num);
  page.drawText(numText, { x: W - M - fonts.reg.widthOfTextAtSize(numText, 7.5), y: 24, size: 7.5, font: fonts.reg, color: GREY });
}

/** One plan for the three editions: images resolved once, page numbers fixed. */
const plan = projects.map((p) => ({ p, images: projectImages(p) }));
{
  let page = 3; // 1 cover, 2 contents
  for (const entry of plan) {
    entry.firstPage = page;
    page += entry.images.length > 1 ? 2 : 1;
  }
}

async function buildEdition(lang, qrPng) {
  const T = ui[lang];
  const B = L[lang];
  const doc = await PDFDocument.create();
  doc.setTitle(`${site.name} — Portfolio`);
  doc.setAuthor(site.name);
  doc.setSubject(safe(T.meta_description));
  doc.setKeywords([HOST, 'architecture', 'portfolio']);
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
  const qr = await doc.embedPng(qrPng);

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
  cover.drawText(safe(B.web_cover), { x: M, y: H / 2 - 96, size: 9.5, font: fonts.reg, color: GREY });
  const coverHome = displayUrl(homeUrl(lang));
  cover.drawText(coverHome, { x: M, y: H / 2 - 114, size: 12, font: fonts.bold, color: INK });
  addLink(doc, cover, M, H / 2 - 118, fonts.bold.widthOfTextAtSize(coverHome, 12), 16, homeUrl(lang));
  cover.drawText(safe(`${site.email} · ${HOST}`), { x: M, y: M - 8, size: 9, font: fonts.reg, color: GREY });

  // ── Contents
  const toc = doc.addPage([W, H]);
  toc.drawText(safe(B.toc), { x: M, y: H - M - 20, size: 10, font: fonts.bold, color: GREY });
  let rowY = H - M - 64;
  for (const { p, firstPage } of plan) {
    toc.drawText(safe(p.title[lang]), { x: M, y: rowY, size: 12, font: fonts.bold, color: INK });
    const num = String(firstPage);
    toc.drawText(num, { x: W - M - fonts.reg.widthOfTextAtSize(num, 10), y: rowY, size: 10, font: fonts.reg, color: GREY });
    toc.drawText(safe(`${p.type[lang]} — ${p.year}`), { x: M, y: rowY - 14, size: 8.5, font: fonts.reg, color: GREY });
    toc.drawLine({ start: { x: M, y: rowY - 24 }, end: { x: W - M, y: rowY - 24 }, thickness: 0.7, color: HAIR });
    rowY -= 44;
  }
  footer(toc, fonts, `${site.name} — Portfolio`, 2);

  // ── Projects
  for (const { p, images, firstPage } of plan) {
    const page = doc.addPage([W, H]);

    // Text column. Measure it first: if fitxa + concept + credits would reach
    // the web link at the bottom, scale the type down so the page never
    // overflows (long texts read smaller, they never get cut).
    const colW = 240;
    const fitxa = [
      [T.fitxa_program, p.type[lang]],
      [T.fitxa_location, p.location[lang]],
      [T.fitxa_year, p.year],
      [T.fitxa_studio, p.studio?.[lang] ?? ''],
    ].filter(([, v]) => v);
    const fitxaLines = fitxa.flatMap(([l, v]) => wrap(`${l}: ${v}`, fonts.reg, 8.5, colW)).length;
    const conceptLines = wrap(p.concept[lang], fonts.reg, 9.5, colW).length;
    let creditLines = 0;
    for (const c of p.credits ?? []) {
      creditLines += 2 + wrap(c.names.join(', '), fonts.reg, 8.5, colW).length;
    }
    const needed = 26 + fitxaLines * 12.5 + 10 + conceptLines * 14 + creditLines * 12;
    const avail = H - 2 * M - 20 - 44; // title top to just above the web link
    const k = Math.min(1, Math.max(0.8, avail / needed));

    let y = H - M - 20;
    page.drawText(safe(p.title[lang]), { x: M, y, size: 20, font: fonts.bold, color: INK });
    y -= 26;
    for (const [label, value] of fitxa) {
      for (const line of wrap(`${label}: ${value}`, fonts.reg, 8.5 * k, colW)) {
        page.drawText(line, { x: M, y, size: 8.5 * k, font: fonts.reg, color: GREY });
        y -= 12.5 * k;
      }
    }
    y -= 10;
    for (const line of wrap(p.concept[lang], fonts.reg, 9.5 * k, colW)) {
      page.drawText(line, { x: M, y, size: 9.5 * k, font: fonts.reg, color: INK });
      y -= 14 * k;
    }

    // Credits — the same quiet block the project page shows.
    for (const c of p.credits ?? []) {
      y -= 12 * k;
      if (y < M + 68) break;
      page.drawText(safe(c.label[lang]), { x: M, y, size: 8 * k, font: fonts.bold, color: GREY });
      y -= 12 * k;
      for (const line of wrap(c.names.join(', '), fonts.reg, 8.5 * k, colW)) {
        if (y < M + 56) break;
        page.drawText(line, { x: M, y, size: 8.5 * k, font: fonts.reg, color: GREY });
        y -= 12 * k;
      }
    }

    // The website carries the full canvas — say so on every project.
    const pUrl = projectUrl(lang, p.slug);
    page.drawText(safe(`${B.web_project}:`), { x: M, y: M + 26, size: 8, font: fonts.reg, color: GREY });
    const pUrlText = displayUrl(pUrl);
    page.drawText(pUrlText, { x: M, y: M + 14, size: 8.5, font: fonts.reg, color: INK });
    addLink(doc, page, M, M + 10, fonts.reg.widthOfTextAtSize(pUrlText, 8.5), 14, pUrl);

    // Cover image on the right
    if (images[0]) {
      drawContained(page, await embed(images[0]), { x: M + colW + 40, y: M + 8, w: W - 2 * M - colW - 40, h: H - 2 * M - 8 });
    }
    footer(page, fonts, `${site.name} — Portfolio`, firstPage);

    // Second page: the next images — one equal-height editorial row for up to
    // three, a 2×2 grid when there are four.
    const extras = images.slice(1);
    if (extras.length) {
      const page2 = doc.addPage([W, H]);
      const gut = 14;
      const imgs = [];
      for (const f of extras) imgs.push(await embed(f));
      if (imgs.length <= 3) {
        const availW = W - 2 * M - gut * (imgs.length - 1);
        const availH = H - 2 * M;
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
      } else {
        const cw = (W - 2 * M - gut) / 2;
        const ch = (H - 2 * M - gut) / 2;
        imgs.forEach((img, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          drawContained(page2, img, { x: M + col * (cw + gut), y: M + (1 - row) * (ch + gut), w: cw, h: ch }, { center: true });
        });
      }
      footer(page2, fonts, safe(`${site.name} — ${p.title[lang]}`), firstPage + 1);
    }
  }

  // ── Contact — and the loudest pointer to the website, QR included.
  const back = doc.addPage([W, H]);
  back.drawText(safe(T.info_contact), { x: M, y: H / 2 + 64, size: 11, font: fonts.bold, color: GREY });
  back.drawText(site.email, { x: M, y: H / 2 + 32, size: 16, font: fonts.reg, color: INK });
  addLink(doc, back, M, H / 2 + 28, fonts.reg.widthOfTextAtSize(site.email, 16), 20, `mailto:${site.email}`);
  for (const [i, line] of wrap(B.web_contact, fonts.reg, 9.5, 340).entries()) {
    back.drawText(line, { x: M, y: H / 2 - 4 - i * 14, size: 9.5, font: fonts.reg, color: GREY });
  }
  const backHome = displayUrl(homeUrl(lang));
  back.drawText(backHome, { x: M, y: H / 2 - 34, size: 15, font: fonts.bold, color: INK });
  addLink(doc, back, M, H / 2 - 38, fonts.bold.widthOfTextAtSize(backHome, 15), 19, homeUrl(lang));
  const qrSize = 96;
  back.drawImage(qr, { x: W - M - qrSize, y: H / 2 - qrSize / 2, width: qrSize, height: qrSize });
  addLink(doc, back, W - M - qrSize, H / 2 - qrSize / 2, qrSize, qrSize, homeUrl(lang));
  back.drawText(safe(`${site.name} — ${site.role[lang]}, ${site.location}`), { x: M, y: M - 8, size: 9, font: fonts.reg, color: GREY });

  const bytes = await doc.save();
  const out = path.join(root, 'public', `Alex-Artazcoz-Portfolio-${lang.toUpperCase()}.pdf`);
  fs.writeFileSync(out, bytes);
  console.log(`✔ ${path.basename(out)} (${(bytes.length / 1e6).toFixed(1)}MB, ${doc.getPageCount()} pages)`);
}

for (const lang of ['en', 'ca', 'es']) {
  const qrPng = await QRCode.toBuffer(homeUrl(lang), {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 0,
    width: 512,
    color: { dark: '#141414', light: '#ffffff' },
  });
  await buildEdition(lang, qrPng);
}
