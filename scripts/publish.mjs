// Сборка для GitHub Pages («Deploy from a branch»: main, корень репозитория).
// Собирает сайт в dist/ с адресом https://dirol982.github.io/pravda/ и копирует готовые файлы в корень репо.
// Файлы, выложенные прошлой публикацией, перечислены в .published.json и удаляются перед копированием.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const SITE_URL = process.env.SITE_URL || 'https://dirol982.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/pravda';
const manifest = join(root, '.published.json');
const PROTECTED = new Set(['src', 'public', 'scripts', 'node_modules', 'dist', '.git', 'package.json', 'package-lock.json', 'astro.config.mjs', 'README.md', '.gitignore', '.published.json', 'tsconfig.json']);

execSync('npx astro build', { cwd: root, stdio: 'inherit', env: { ...process.env, SITE_URL, BASE_PATH } });

if (existsSync(manifest)) {
  for (const name of JSON.parse(readFileSync(manifest, 'utf8'))) {
    if (!PROTECTED.has(name)) rmSync(join(root, name), { recursive: true, force: true });
  }
}
const items = readdirSync(join(root, 'dist'));
for (const name of items) {
  if (PROTECTED.has(name)) throw new Error(`Имя «${name}» в dist совпадает с исходниками — публикация остановлена`);
  cpSync(join(root, 'dist', name), join(root, name), { recursive: true });
}
writeFileSync(join(root, '.nojekyll'), ''); // иначе GitHub Pages (Jekyll) не отдаст папку _astro
writeFileSync(manifest, JSON.stringify([...items, '.nojekyll'], null, 2) + '\n');
console.log(`\nГотово: ${items.length} файлов/папок в корне. Закоммитьте и запушьте в main.`);
