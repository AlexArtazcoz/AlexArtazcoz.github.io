// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Dev-only endpoints used by the layout editor:
 *   POST /__editor/save   — merge canvas layouts into src/data/layout.json
 *   POST /__editor/upload — write a new image into src/assets/<slug>/ AND add
 *                           it to that project's layout in one atomic step
 * `apply: 'serve'` means none of this exists in a production build — the
 * deployed static site has no writable backend, by design.
 */
function editorEndpoints() {
  const root = fileURLToPath(new URL('.', import.meta.url));
  const layoutFile = path.join(root, 'src', 'data', 'layout.json');
  const assetsDir = path.join(root, 'src', 'assets');

  const readLayout = () => {
    try {
      return JSON.parse(fs.readFileSync(layoutFile, 'utf8'));
    } catch {
      return {};
    }
  };
  // Merge per-project: a page only posts the canvases it shows, so other
  // projects' saved layouts must be preserved.
  const mergeLayout = (incoming) => {
    const merged = { ...readLayout(), ...incoming };
    fs.writeFileSync(layoutFile, JSON.stringify(merged, null, 2) + '\n');
  };
  const send = (res, code, obj) => {
    res.statusCode = code;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(obj));
  };

  return {
    name: 'editor-endpoints',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST' || !req.url || !req.url.startsWith('/__editor/')) {
          return next();
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
          if (body.length > 120_000_000) req.destroy(); // ~90MB file cap
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);

            if (req.url.startsWith('/__editor/save')) {
              mergeLayout(data);
              return send(res, 200, { ok: true });
            }

            if (req.url.startsWith('/__editor/upload')) {
              const { slug, stem, ext, data: b64, canvas, item } = data;
              // Strict validation — only existing project folders, safe names.
              if (!/^[a-z0-9-]+$/.test(String(slug)) || !fs.existsSync(path.join(assetsDir, slug))) {
                return send(res, 400, { ok: false, error: 'unknown project' });
              }
              if (!/^[a-z0-9][a-z0-9-]*$/.test(String(stem))) {
                return send(res, 400, { ok: false, error: 'bad name' });
              }
              const extNorm = String(ext).toLowerCase() === 'jpeg' ? 'jpg' : String(ext).toLowerCase();
              if (!['jpg', 'png', 'webp'].includes(extNorm)) {
                return send(res, 400, { ok: false, error: 'bad extension' });
              }
              // Dedupe the filename if it already exists.
              let finalStem = stem;
              let n = 2;
              while (fs.existsSync(path.join(assetsDir, slug, `${finalStem}.${extNorm}`))) {
                finalStem = `${stem}-${n++}`;
              }
              fs.writeFileSync(
                path.join(assetsDir, slug, `${finalStem}.${extNorm}`),
                Buffer.from(String(b64), 'base64'),
              );
              // Add the new item to the provided canvas and persist — one step,
              // so a dev-server reload can never catch a half-done state.
              const entry = {
                h: Math.round(canvas.h),
                ...(canvas.cover ? { cover: canvas.cover } : {}),
                items: [...canvas.items, { ...item, img: finalStem }],
              };
              mergeLayout({ [slug]: entry });
              return send(res, 200, { ok: true, name: finalStem });
            }

            return send(res, 404, { ok: false });
          } catch (err) {
            return send(res, 400, { ok: false, error: String(err) });
          }
        });
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // Canonical URL — used for canonical links, hreflang alternates and the
  // sitemap. Must match the domain the site is actually served from.
  site: 'https://alexartazcoz.com',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ca', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ca: 'ca', es: 'es' },
      },
    }),
  ],

  vite: {
    plugins: [editorEndpoints()],
  },
});
