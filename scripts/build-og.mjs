/**
 * Build the social-sharing images (Open Graph) and raster icons, committed to
 * `public/` so CI never needs local fonts:
 *
 *   public/og/default.png   — name + role card for the home/info pages
 *   public/og/<slug>.png    — per-project card: cover image + title + name
 *   public/apple-touch-icon.png, public/favicon.ico — from the single-A mark
 *
 * Re-run after changing a project's cover or title:  node scripts/build-og.mjs
 * (Text is set in Arial — visually adjacent to the site's Archivo — because
 * SVG text is rasterized with system fonts.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { projects } from '../src/data/projects.ts';
import { site } from '../src/data/site.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(root, 'src', 'assets');
const OUT = path.join(root, 'public', 'og');
fs.mkdirSync(OUT, { recursive: true });

const layout = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'layout.json'), 'utf8'));
const HOST = (fs.readFileSync(path.join(root, 'astro.config.mjs'), 'utf8').match(/site:\s*'https?:\/\/([^']+)'/) ?? [])[1] ?? '';

const W = 1200;
const H = 630;
const IMG_X = 540; // image occupies the right side
const INK = '#141414';
const GREY = '#8a8a86';
const FONT = 'Arial, Helvetica, sans-serif';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Wrap a title into at most two lines that fit the left column. */
function wrapTitle(text, maxChars = 16) {
  if (text.length <= maxChars) return [text];
  const words = text.split(' ');
  let a = '';
  let b = '';
  for (const w of words) {
    if (!b && (a + ' ' + w).trim().length <= maxChars) a = (a + ' ' + w).trim();
    else b = (b + ' ' + w).trim();
  }
  if (b.length > maxChars + 4) b = b.slice(0, maxChars + 3) + '…';
  return [a, b];
}

function textPanelSvg({ title, meta }) {
  const lines = title ? wrapTitle(title) : [];
  const titleSvg = lines
    .map(
      (l, i) =>
        `<text x="70" y="${300 + i * 62}" font-family="${FONT}" font-size="52" font-weight="700" fill="${INK}">${esc(l)}</text>`,
    )
    .join('');
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="70" y="110" font-family="${FONT}" font-size="24" font-weight="600" letter-spacing="4" fill="${INK}">${esc(site.name.toUpperCase())}</text>
      <rect x="70" y="132" width="56" height="2" fill="${INK}"/>
      ${titleSvg}
      ${meta ? `<text x="70" y="${300 + lines.length * 62}" font-family="${FONT}" font-size="24" fill="${GREY}">${esc(meta)}</text>` : ''}
      <text x="70" y="${H - 56}" font-family="${FONT}" font-size="20" fill="${GREY}">${esc(HOST)}</text>
    </svg>`,
  );
}

/** The project's cover image, with its canvas trim/rotation/focal point applied. */
async function coverBuffer(p, w, h) {
  const dir = path.join(ASSETS, p.slug);
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const saved = layout[p.slug] ?? {};
  const name = saved.cover ?? p.cover ?? files[0]?.replace(/\.\w+$/, '');
  const file = files.find((f) => f.replace(/\.\w+$/, '') === name) ?? files[0];
  if (!file) return null;
  const crop = (saved.items ?? []).find((i) => i.img === name)?.crop ?? {};

  let img = sharp(path.join(dir, file), { limitInputPixels: false });
  const m = await img.metadata();
  const tr = crop.trim ?? { t: 0, r: 0, b: 0, l: 0 };
  const left = Math.floor(m.width * (tr.l ?? 0));
  const top = Math.floor(m.height * (tr.t ?? 0));
  img = img.extract({
    left,
    top,
    width: Math.max(1, Math.min(m.width - left, Math.round(m.width * (1 - (tr.l ?? 0) - (tr.r ?? 0))))),
    height: Math.max(1, Math.min(m.height - top, Math.round(m.height * (1 - (tr.t ?? 0) - (tr.b ?? 0))))),
  });
  // sharp runs rotate BEFORE extract regardless of call order — flatten the
  // trim to pixels first so the quarter-turn happens after it.
  if (crop.rot) img = sharp(await img.png().toBuffer(), { limitInputPixels: false }).rotate(crop.rot);
  // Cover-fit, panned toward the canvas focal point.
  const buf = await img.toBuffer();
  const d = await sharp(buf, { limitInputPixels: false }).metadata();
  const scale = Math.max(w / d.width, h / d.height);
  const rw = Math.ceil(d.width * scale);
  const rh = Math.ceil(d.height * scale);
  const fx = (crop.fx ?? 50) / 100;
  const fy = (crop.fy ?? 50) / 100;
  const ex = Math.min(Math.max(Math.round(rw * fx - w / 2), 0), rw - w);
  const ey = Math.min(Math.max(Math.round(rh * fy - h / 2), 0), rh - h);
  return sharp(buf, { limitInputPixels: false })
    .resize(rw, rh)
    .extract({ left: ex, top: ey, width: w, height: h })
    .toBuffer();
}

async function buildProjectCard(p) {
  const img = await coverBuffer(p, W - IMG_X, H);
  const composites = [];
  if (img) composites.push({ input: img, left: IMG_X, top: 0 });
  composites.push({ input: textPanelSvg({ title: p.title.en, meta: `${p.type.en} · ${p.year}` }), left: 0, top: 0 });
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite(composites)
    .png()
    .toFile(path.join(OUT, `${p.slug}.png`));
  console.log('✔ og/' + p.slug + '.png');
}

async function buildDefaultCard() {
  const svg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="${INK}" stroke-linecap="square" stroke-width="1.5" transform="translate(70,180) scale(3.4)">
        <path d="M8 26 L16 6 L24 26"/>
        <path d="M10.4 20 L24 26" stroke-width="1.25"/>
      </g>
      <text x="70" y="380" font-family="${FONT}" font-size="64" font-weight="700" fill="${INK}">${esc(site.name)}</text>
      <text x="70" y="428" font-family="${FONT}" font-size="28" fill="${GREY}">${esc(site.role.en)} — ${esc(site.location)}</text>
      <text x="70" y="${H - 56}" font-family="${FONT}" font-size="20" fill="${GREY}">${esc(HOST)}</text>
    </svg>`,
  );
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite([{ input: svg, left: 0, top: 0 }])
    .png()
    .toFile(path.join(OUT, 'default.png'));
  console.log('✔ og/default.png');
}

/** Raster icons from the monogram (dark linework on white). */
async function buildIcons() {
  const mark = (size, stroke, pad) =>
    Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#ffffff"/>
        <g fill="none" stroke="${INK}" stroke-linecap="square" stroke-width="${stroke}"
           transform="translate(${pad},${pad}) scale(${(size - 2 * pad) / 32})">
          <path d="M8 26 L16 6 L24 26"/>
          <path d="M10.4 20 L24 26" stroke-width="${stroke * 0.75}"/>
        </g>
      </svg>`,
    );
  await sharp(mark(180, 2, 22)).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));
  console.log('✔ apple-touch-icon.png');

  // favicon.ico: a single 32px PNG wrapped in an ICO container (valid since Vista).
  const png32 = await sharp(mark(32, 2, 2)).png().toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt8(0, 8); // palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // planes
  header.writeUInt16LE(32, 12); // bpp
  header.writeUInt32LE(png32.length, 14); // data size
  header.writeUInt32LE(22, 18); // data offset
  fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), Buffer.concat([header, png32]));
  console.log('✔ favicon.ico');
}

await buildDefaultCard();
for (const p of projects) await buildProjectCard(p);
await buildIcons();
