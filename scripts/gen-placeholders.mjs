// Генерирует плейсхолдеры фото (WebP + AVIF), favicon и OG-картинку.
// Запуск: npm run placeholders. Реальные фото кладите в public/photos/ с теми же именами (.webp и .avif).
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const out = new URL('../public/', import.meta.url).pathname;
mkdirSync(out + 'photos', { recursive: true });
const ACC = '#f5a300', INK = '#141210', BG = '#ebe6db';

const photos = [
  ['boks', 'ФОТО: БОКС', 1600, 1000],
  ['master', 'ФОТО: МАСТЕР', 800, 600],
  ['klientskaya-zona', 'ФОТО: КЛИЕНТСКАЯ ЗОНА', 800, 600],
  ['vibrostend', 'ФОТО: ВИБРОСТЕНД', 1200, 900],
  ['vhod', 'ФОТО: ВЪЕЗД / ВОРОТА', 1200, 800],
];
const ph = (label, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><pattern id="p" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <rect width="24" height="24" fill="${BG}"/><rect width="2" height="24" fill="#d8d1c2"/></pattern></defs>
  <rect width="100%" height="100%" fill="url(#p)"/>
</svg>`;
for (const [name, label, w, h] of photos) {
  const img = sharp(Buffer.from(ph(label, w, h)));
  await img.clone().webp({ quality: 70 }).toFile(`${out}photos/${name}.webp`);
  await img.clone().avif({ quality: 50 }).toFile(`${out}photos/${name}.avif`);
}

const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${INK}"/><rect x="40" y="40" width="14" height="14" fill="${ACC}"/><path d="M12 12h30v34h-8V19H20v27h-8z" fill="#f4f1ea"/></svg>`;
writeFileSync(out + 'favicon.svg', fav);
await sharp(Buffer.from(fav)).resize(32, 32).png().toFile(out + 'favicon-32.png');
await sharp(Buffer.from(fav)).resize(180, 180).png().toFile(out + 'apple-touch-icon.png');

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#f4f1ea"/>
  ${Array.from({ length: 13 }, (_, i) => `<line x1="0" x2="1200" y1="${i * 48 + 24}" y2="${i * 48 + 24}" stroke="#ddd6c8"/>`).join('')}
  <rect x="60" y="60" width="18" height="18" fill="${ACC}"/>
  <text x="92" y="77" font-family="DejaVu Sans Mono" font-size="22" fill="#6b655b">СТО · МИНСК · УЛ. БОРОДИНСКАЯ, 2К10</text>
  <text x="56" y="250" font-family="DejaVu Sans" font-weight="bold" font-size="150" fill="${INK}" letter-spacing="-6">ПРАВДА</text>
  <text x="60" y="340" font-family="DejaVu Sans" font-weight="bold" font-size="44" fill="${INK}">Скажем правду о вашей машине</text>
  <line x1="60" x2="1140" y1="420" y2="420" stroke="${INK}" stroke-width="2"/>
  <text x="60" y="470" font-family="DejaVu Sans Mono" font-size="26" fill="${INK}">01 Цены открыты   02 Согласуем каждый этап   03 Отдаём старые детали</text>
  <rect x="60" y="520" width="360" height="56" fill="${ACC}"/>
  <text x="80" y="557" font-family="DejaVu Sans Mono" font-weight="bold" font-size="26" fill="${INK}">+375 33 914-82-22</text>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(out + 'og.png');
console.log('ok');
