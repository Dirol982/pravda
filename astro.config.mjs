// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL и BASE_PATH задаются при сборке (см. README и .github/workflows/deploy.yml).
// Боевой домен: https://sto-pravda.by, base "/".
// GitHub Pages:  https://<user>.github.io, base "/pravda".
const site = process.env.SITE_URL || 'https://sto-pravda.by';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  prefetch: false,
});
