import contacts from '../data/contacts.json';
import services from '../data/services.json';
import vibro from '../data/vibrostend.json';
import site from '../data/site.json';

export type PriceItem = {
  id: string; name: string; price: number | null; from: boolean;
  priceJeep?: number; jeepFrom?: boolean; unit?: string; note?: string; verified: boolean;
};
export type Category = (typeof services.categories)[number] & { items: PriceItem[] };

export const categories = services.categories as Category[];
export const CUR = 'р.';

/** Ссылка с учётом base (GitHub Pages /pravda/ или корень домена). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|tel:|mailto:|viber:|#)/.test(path)) return path;
  return base + (path.startsWith('/') ? path : '/' + path);
}
export function absUrl(path = '/'): string {
  return new URL(url(path), import.meta.env.SITE).href;
}

export function fmt(n: number): string {
  return n.toLocaleString('ru-RU').replace(/ /g, ' ');
}
/** «от 25 р.», «50 р.», «бесплатно», «по запросу» */
export function priceText(price: number | null | undefined, from = false): string {
  if (price === null || price === undefined) return 'по запросу';
  if (price === 0) return 'бесплатно';
  return `${from ? 'от ' : ''}${fmt(price)} ${CUR}`;
}
export function itemPrice(i: PriceItem, jeep = false): string {
  if (jeep && i.priceJeep !== undefined) return priceText(i.priceJeep, i.jeepFrom ?? i.from);
  return priceText(i.price, i.from);
}
export function minPrice(c: Category): number | null {
  const ps = c.items.map((i) => i.price).filter((p): p is number => typeof p === 'number' && p > 0);
  return ps.length ? Math.min(...ps) : null;
}
export function catPriceLabel(c: Category): string {
  const m = minPrice(c);
  return m === null ? 'по запросу' : `от ${fmt(m)} ${CUR}`;
}
export function hasJeep(c: Category): boolean {
  return c.items.some((i) => i.priceJeep !== undefined && i.priceJeep !== i.price);
}
export function getCat(slug: string) { return categories.find((c) => c.slug === slug); }
export function getItem(id: string): PriceItem | undefined {
  for (const c of categories) for (const i of c.items) if (i.id === id) return i;
}
export function catNo(c: Category): string {
  return String(categories.indexOf(c) + 1).padStart(2, '0');
}

export const vibroPrices = vibro.prices;
export const vibroMin = Math.min(...vibro.prices.map((p) => p.oneAxle));

// ---------- Контакты ----------
export const mainPhone = contacts.phones.find((p) => p.main) ?? contacts.phones[0];
export const tel = (n: string) => `tel:${n}`;
export const viberChat = (n = contacts.viber) => `viber://chat?number=${encodeURIComponent(n)}`;
export const routeUrl = `https://yandex.by/maps/?rtext=~${contacts.geo.lat}%2C${contacts.geo.lon}&rtt=auto`;
export const mapEmbed = `https://yandex.by/map-widget/v1/?oid=${contacts.yandex.orgId}&ol=biz&z=16`;

// ---------- Часы работы ----------
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_RU: Record<string, string> = { mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс' };
const DAY_SCHEMA: Record<string, string> = { mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su' };
type Week = Record<string, [string, string] | null>;
const week = contacts.hours.week as Week;

/** Группирует подряд идущие дни с одинаковыми часами: [{days:'Пн–Сб', time:'09:00–20:00'}] */
export function hoursGroups(schema = false) {
  const out: { days: string; time: string | null; from: string; to: string }[] = [];
  let start = 0;
  for (let i = 1; i <= DAYS.length; i++) {
    const a = week[DAYS[start]], b = week[DAYS[i]];
    if (i === DAYS.length || JSON.stringify(a) !== JSON.stringify(b)) {
      const names = schema ? DAY_SCHEMA : DAY_RU;
      const f = names[DAYS[start]], t = names[DAYS[i - 1]];
      out.push({ days: start === i - 1 ? f : `${f}${schema ? '-' : '–'}${t}`, time: a ? `${a[0]}–${a[1]}` : null, from: a?.[0] ?? '', to: a?.[1] ?? '' });
      start = i;
    }
  }
  return out;
}
export const openingHoursSchema = hoursGroups(true).filter((g) => g.time).map((g) => `${g.days} ${g.from}-${g.to}`);
export const hoursJson = JSON.stringify({ tz: contacts.hours.timezone, week });

export { contacts, services, vibro, site };
