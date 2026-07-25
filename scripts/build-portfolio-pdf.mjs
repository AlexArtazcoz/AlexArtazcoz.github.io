/**
 * Auto-generate the studio-application portfolio PDF from the website's own
 * content (projects.ts + layout.json + src/assets) so the booklet can never
 * drift out of sync with the site. One file per language:
 *
 *   public/Alex-Artazcoz-Portfolio-{EN,CA,ES}.pdf
 *
 * Format: A4 landscape — cover, contents page, 1–2 pages per project (title,
 * fact sheet, concept, credits, best images in canvas order) and a closing page
 * with the bio and an email address — in the site's quiet aesthetic (white,
 * hairlines, Helvetica ≈ Archivo).
 *
 * The website is named once, on the cover, and never again: a booklet that
 * advertises itself on every page reads as a sales sheet. Whoever wants the
 * complete canvases knows where to look.
 *
 * Re-run after content changes:  node scripts/build-portfolio-pdf.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from 'pdf-lib';
import { projects } from '../src/data/projects.ts';
import { site, bio } from '../src/data/site.ts';
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
  en: { toc: 'Contents' },
  ca: { toc: 'Índex' },
  es: { toc: 'Índice' },
};

/** Language-prefixed site URL (EN lives at the root). Used on the cover only. */
const homeUrl = (lang) => `https://${HOST}/${lang === 'en' ? '' : `${lang}/`}`;
const displayUrl = (url) => url.replace(/^https:\/\//, '').replace(/\/$/, '');

/** WinAnsi cannot encode every glyph in the texts — normalize the strays. */
const safe = (s) =>
  s
    .replace(/ /g, ' ')
    .replace(/[–−]/g, '-')
    .replace(/₂/g, '2') // Helvetica (WinAnsi) has no subscripts
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
  // Picks lead, then the rest of the canvas backfills — the tail feeds the
  // process strip on text pages.
  const names = [
    coverName,
    ...chosen.filter((n) => n !== coverName),
    ...order.filter((n) => n !== coverName && !chosen.includes(n)),
  ];
  const out = [];
  for (const n of names) {
    const file = byStem.get(n);
    if (file && !out.some((e) => e.file === file)) out.push({ file, crop: cropByName.get(n) });
    if (out.length === max) break;
  }
  return out;
}

/** Cache key: same file + same trim/rotation/options → same prepared JPEG. */
const entryKey = (e, opts) =>
  `${e.file}|${JSON.stringify(e.crop?.trim ?? 0)}|${e.crop?.rot ?? 0}|${opts?.trimWhite ? 'tw' : ''}`;

/** Resize/encode once (canvas trim + quarter-turn applied), reused across the
 * three language editions. */
const jpgCache = new Map();
async function preparedJpg(entry, opts) {
  try {
    return await preparedJpgInner(entry, opts);
  } catch (err) {
    err.message = `${path.basename(entry.file)}: ${err.message}`;
    throw err;
  }
}
async function preparedJpgInner(entry, opts) {
  const k = entryKey(entry, opts);
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
    // Hero images shed their scanned white margins so the drawing, not the
    // paper, fills the page. Falls back untouched if trimming misbehaves.
    if (opts?.trimWhite) {
      try {
        const trimmed = await sharp(await img.png().toBuffer(), { limitInputPixels: false })
          .trim({ background: '#ffffff', threshold: 16 })
          .png()
          .toBuffer();
        img = sharp(trimmed, { limitInputPixels: false });
      } catch {
        // keep the un-trimmed pipeline
      }
    }
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

/** One plan for the three editions: images resolved once, page numbers fixed.
 * Beyond the five booklet images, up to three more canvas images serve as the
 * process strip that fills short text pages. */
const plan = projects.map((p) => {
  const all = projectImages(p, 8);
  return { p, images: all.slice(0, 5), spare: all.slice(5, 8) };
});
{
  let page = 3; // 1 cover, 2 contents
  for (const entry of plan) {
    entry.firstPage = page;
    page += entry.images.length > 1 ? 2 : 1;
  }
}

async function buildEdition(lang) {
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
  const embed = async (entry, opts) => {
    const k = entryKey(entry, opts);
    if (!embedded.has(k)) embedded.set(k, await doc.embedJpg(await preparedJpg(entry, opts)));
    return embedded.get(k);
  };

  // ── Cover
  const cover = doc.addPage([W, H]);
  const mono = ['M8 26 L16 6 L24 26', 'M10.4 20 L24 26'];
  for (const d of mono) {
    cover.drawSvgPath(d, { x: M, y: H - M - 8, scale: 1.6, borderColor: INK, borderWidth: 1.3 });
  }
  cover.drawText(site.name, { x: M, y: H / 2 + 16, size: 40, font: fonts.bold, color: INK });
  cover.drawText(safe(`${site.role[lang]} — ${site.location}`), { x: M, y: H / 2 - 12, size: 13, font: fonts.reg, color: GREY });
  cover.drawLine({ start: { x: M, y: H / 2 - 34 }, end: { x: M + 56, y: H / 2 - 34 }, thickness: 1.2, color: INK });
  cover.drawText('Portfolio 2023—2026', { x: M, y: H / 2 - 58, size: 11, font: fonts.reg, color: GREY });
  // The one mention of the website in the whole booklet.
  const coverHome = displayUrl(homeUrl(lang));
  cover.drawText(coverHome, { x: M, y: H / 2 - 96, size: 12, font: fonts.bold, color: INK });
  addLink(doc, cover, M, H / 2 - 100, fonts.bold.widthOfTextAtSize(coverHome, 12), 16, homeUrl(lang));
  cover.drawText(safe(site.email), { x: M, y: M - 8, size: 9, font: fonts.reg, color: GREY });

  // One hero drawing on the right half — a portfolio cover shows work.
  const heroEntry =
    plan[0].images.find((e) => e.file.includes('14-general-balaguer')) ?? plan[0].images[0];
  if (heroEntry) {
    drawContained(
      cover,
      await embed(heroEntry, { trimWhite: true }),
      { x: W / 2 + 30, y: M + 16, w: W / 2 - M - 30, h: H - 2 * M - 16 },
      { center: true },
    );
  }

  // ── Contents — each entry carries its cover thumbnail: juries pick the
  // pages they will actually read from this page.
  const toc = doc.addPage([W, H]);
  toc.drawText(safe(B.toc), { x: M, y: H - M - 20, size: 10, font: fonts.bold, color: GREY });
  let rowY = H - M - 70;
  const thumbW = 62;
  for (const { p, images, firstPage } of plan) {
    if (images[0]) {
      drawContained(toc, await embed(images[0]), { x: M, y: rowY - 24, w: thumbW, h: 38 }, { center: true });
    }
    const tx = M + thumbW + 16;
    toc.drawText(safe(p.title[lang]), { x: tx, y: rowY, size: 12, font: fonts.bold, color: INK });
    const num = String(firstPage);
    toc.drawText(num, { x: W - M - fonts.reg.widthOfTextAtSize(num, 10), y: rowY, size: 10, font: fonts.reg, color: GREY });
    toc.drawText(safe(`${p.type[lang]} — ${p.year}`), { x: tx, y: rowY - 14, size: 8.5, font: fonts.reg, color: GREY });
    toc.drawLine({ start: { x: M, y: rowY - 32 }, end: { x: W - M, y: rowY - 32 }, thickness: 0.7, color: HAIR });
    rowY -= 52;
  }
  footer(toc, fonts, `${site.name} — Portfolio`, 2);

  // ── Projects
  for (const { p, images, spare, firstPage } of plan) {
    const page = doc.addPage([W, H]);

    // Text column. Measure it first: if fitxa + concept + credits would reach
    // the bottom margin, scale the type down so the page never overflows
    // (long texts read smaller, they never get cut).
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
    const avail = H - 2 * M - 20 - 12; // title top down to the bottom margin
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
      if (y < M + 22) break;
      page.drawText(safe(c.label[lang]), { x: M, y, size: 8 * k, font: fonts.bold, color: GREY });
      y -= 12 * k;
      for (const line of wrap(c.names.join(', '), fonts.reg, 8.5 * k, colW)) {
        if (y < M + 10) break;
        page.drawText(line, { x: M, y, size: 8.5 * k, font: fonts.reg, color: GREY });
        y -= 12 * k;
      }
    }

    // Cover image on the right, scanned paper margins shed.
    let heroBottom = M + 8;
    if (images[0]) {
      const hero = await embed(images[0], { trimWhite: true });
      const box = { x: M + colW + 40, y: M + 8, w: W - 2 * M - colW - 40, h: H - 2 * M - 8 };
      drawContained(page, hero, box);
      const s = Math.min(box.w / hero.width, box.h / hero.height);
      heroBottom = box.y + box.h - hero.height * s;
    }

    // A quiet process strip fills pages whose text ends early: the next canvas
    // images, small, along the bottom — never repeated from the booklet pages.
    const stripSources = spare;
    const stripTop = Math.min(y - 24, heroBottom - 16);
    const stripH = Math.min(110, stripTop - (M + 44));
    if (stripSources.length >= 2 && stripH >= 78) {
      const gut = 14;
      const cells = stripSources.slice(0, 3);
      const cellW = (W - 2 * M - gut * (cells.length - 1)) / cells.length;
      for (const [i, e] of cells.entries()) {
        drawContained(page, await embed(e), { x: M + i * (cellW + gut), y: M + 44, w: cellW, h: stripH });
      }
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

  // ── Closing page — the person (bio) and one way to reach them. No repeat of
  // the cover's web address, no QR: whoever wants more will ask.
  const back = doc.addPage([W, H]);
  back.drawText(safe(site.name), { x: M, y: H - M - 16, size: 11, font: fonts.bold, color: INK });
  let by = H - M - 44;
  for (const para of bio[lang]) {
    // ~80-character measure: comfortable reading, not a wall-to-wall line.
    for (const line of wrap(para, fonts.reg, 9.5, 400)) {
      back.drawText(line, { x: M, y: by, size: 9.5, font: fonts.reg, color: INK });
      by -= 14;
    }
    by -= 7;
  }
  back.drawText(safe(T.info_contact), { x: M, y: 234, size: 11, font: fonts.bold, color: GREY });
  back.drawText(site.email, { x: M, y: 206, size: 16, font: fonts.reg, color: INK });
  addLink(doc, back, M, 202, fonts.reg.widthOfTextAtSize(site.email, 16), 20, `mailto:${site.email}`);
  back.drawText(safe(`${site.name} — ${site.role[lang]}, ${site.location}`), { x: M, y: M - 8, size: 9, font: fonts.reg, color: GREY });

  const bytes = await doc.save();
  const out = path.join(root, 'public', `Alex-Artazcoz-Portfolio-${lang.toUpperCase()}.pdf`);
  fs.writeFileSync(out, bytes);
  console.log(`✔ ${path.basename(out)} (${(bytes.length / 1e6).toFixed(1)}MB, ${doc.getPageCount()} pages)`);
}

for (const lang of ['en', 'ca', 'es']) {
  await buildEdition(lang);
}
