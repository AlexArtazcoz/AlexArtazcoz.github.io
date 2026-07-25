/**
 * Print the one-page CVs (EN/CA/ES) from `src/data/cv.ts` into `public/`.
 *
 * The CVs used to be PDFs with no source in the repo, printed once from a
 * throwaway HTML file, so nothing in them could be corrected. This rebuilds
 * that document as code: the layout below reproduces the measurements taken
 * from the original PDFs (A4, 45pt margins, 14px/21px body, a 156px label
 * column, hairlines between sections), so the text stays editable without the
 * page changing shape.
 *
 * Chrome does the printing, exactly as before (Skia/PDF), which is why the
 * geometry is written in px: at print time 1px = 0.75pt.
 *
 * Run from the repo root:  node scripts/build-cv.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cv, cvName } from '../src/data/cv.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(root, 'public');

/** The PDF title, per language, kept as the previous files had it. */
const titleSuffix = { en: 'CV (English)', ca: 'CV (Català)', es: 'CV (Español)' };

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
].find((p) => fs.existsSync(p));

if (!CHROME) throw new Error('Chrome not found: it is what prints the PDF');

/** Archivo, inlined: a file:// page cannot fetch a font from disk. */
const fontFile = path.join(
  root,
  'node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',
);
const font = fs.readFileSync(fontFile).toString('base64');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Vertical rhythm, measured off the original PDFs (px at print scale). */
const M = {
  padTop: 59,
  gutter: 60,
  labelCol: 156,
  skillCol: 167,
  nameSize: 26,
  bodySize: 14,
  smallSize: 13,
  leading: 21,
  contactLeading: 20,
  subtitleGap: 4,
  ruleAbove: 9,
  ruleBelow: 11,
  jobGap: 8,
  detailGap: 3,
  skillGap: 6,
};

function page(lang) {
  const c = cv[lang];
  const job = (j) => `
        <div class="job">
          <p><span class="role">${esc(j.role)}</span> <span class="meta">${esc(j.meta)}</span></p>
          <p class="detail">${esc(j.detail)}</p>
        </div>`;

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <title>${esc(cvName)} — ${titleSuffix[lang]}</title>
    <style>
      @font-face {
        font-family: 'Archivo';
        src: url(data:font/woff2;base64,${font}) format('woff2');
        font-weight: 100 900;
        font-style: normal;
        font-display: block;
      }

      @page { size: A4; margin: 0; }

      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        font-family: 'Archivo', sans-serif;
        font-size: ${M.bodySize}px;
        line-height: ${M.leading}px;
        color: #333333;
        padding: ${M.padTop}px ${M.gutter}px 0;
        -webkit-font-smoothing: antialiased;
      }

      header { display: flex; justify-content: space-between; align-items: flex-start; }

      h1 {
        font-size: ${M.nameSize}px;
        line-height: ${M.nameSize}px;
        font-weight: 600;
        color: #000000;
      }

      .sub { font-size: ${M.smallSize}px; color: #767672; margin-top: ${M.subtitleGap}px; }

      .contact {
        text-align: right;
        font-size: ${M.smallSize}px;
        line-height: ${M.contactLeading}px;
        color: #767672;
      }

      .contact .url { color: #333333; }

      section {
        display: grid;
        grid-template-columns: ${M.labelCol}px 1fr;
        border-top: 1px solid #e3e3e0;
        margin-top: ${M.ruleAbove}px;
        padding-top: ${M.ruleBelow}px;
      }

      h2 {
        font-size: ${M.smallSize}px;
        font-weight: 400;
        color: #767672;
        letter-spacing: 0.1em;
      }

      .job + .job { margin-top: ${M.jobGap}px; }
      .role { font-weight: 600; }
      .meta { font-size: ${M.smallSize}px; color: #767672; }
      .detail { margin-top: ${M.detailGap}px; }

      .skill { display: grid; grid-template-columns: ${M.skillCol}px 1fr; }
      .skill + .skill { margin-top: ${M.skillGap}px; }
      .skill .g { color: #767672; }
    </style>
  </head>
  <body>
    <header>
      <div>
        <h1>${esc(cvName)}</h1>
        <p class="sub">${esc(c.subtitle)}</p>
      </div>
      <div class="contact">
        ${c.contact.map((l) => `<p>${esc(l)}</p>`).join('\n        ')}
        <p>${esc(c.portfolioLabel)} <span class="url">${esc(c.portfolioUrl)}</span></p>
      </div>
    </header>

    <section>
      <h2>${esc(c.labels.profile)}</h2>
      <div><p>${esc(c.profile)}</p></div>
    </section>

    <section>
      <h2>${esc(c.labels.experience)}</h2>
      <div>${c.jobs.map(job).join('')}
      </div>
    </section>

    <section>
      <h2>${esc(c.labels.education)}</h2>
      <div>${job(c.education)}
      </div>
    </section>

    <section>
      <h2>${esc(c.labels.skills)}</h2>
      <div>
        ${c.skills
          .map(
            (s) =>
              `<div class="skill"><span class="g">${esc(s.group)}</span><span>${esc(s.items)}</span></div>`,
          )
          .join('\n        ')}
      </div>
    </section>

    <section>
      <h2>${esc(c.labels.languages)}</h2>
      <div><p>${esc(c.languages)}</p></div>
    </section>
  </body>
</html>
`;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
const outDir = process.env.CV_OUT ? path.resolve(process.env.CV_OUT) : PUBLIC;
fs.mkdirSync(outDir, { recursive: true });

for (const lang of ['en', 'ca', 'es']) {
  const html = path.join(tmp, `cv-${lang}.html`);
  fs.writeFileSync(html, page(lang));
  const out = path.join(outDir, `Alex-Artazcoz-CV-${lang.toUpperCase()}.pdf`);
  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=4000',
      `--print-to-pdf=${out}`,
      pathToFileURL(html).href,
    ],
    { stdio: 'pipe' },
  );
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`✔ ${path.basename(out)} (${kb}kB)`);
}

fs.rmSync(tmp, { recursive: true, force: true });
