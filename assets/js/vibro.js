// Вибростенд: «было/стало» и калькулятор стоимости проверки.
(() => {
  const sv = document.querySelector('[data-sv]');
  if (sv) {
    const sumEl = sv.querySelector('[data-sv-sum]');
    const save = sv.querySelector('[data-sv-save]');
    const totals = {};
    sv.querySelectorAll('[data-sv-panel]').forEach((p) => {
      totals[p.dataset.svPanel] = [...p.querySelectorAll('tr:not(.is-off) td')].reduce((a, td) => a + (parseInt(td.textContent.replace(/\D/g, '')) || 0), 0);
    });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cur = totals.without;
    const animate = (to) => {
      if (reduce) { sumEl.textContent = String(to); cur = to; return; }
      const from = cur, t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 600);
        sumEl.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step); else cur = to;
      };
      requestAnimationFrame(step);
    };
    sv.querySelectorAll('[data-sv-tab]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.svTab;
      sv.querySelectorAll('[data-sv-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      sv.querySelectorAll('[data-sv-panel]').forEach((p) => (p.hidden = p.dataset.svPanel !== k));
      save.hidden = k !== 'with';
      sv.classList.toggle('is-with', k === 'with');
      animate(totals[k]);
    }));
  }
  const f = document.querySelector('[data-vcalc]');
  if (f) {
    const P = JSON.parse(f.dataset.vcalc);
    const out = f.querySelector('[data-vcalc-out]');
    const upd = () => {
      const t = (f.querySelector('input[name="t"]:checked') ).value;
      const a = (f.querySelector('input[name="a"]:checked') ).value;
      const p = P.find((x) => x.id === t);
      out.textContent = `${a === '2' ? p.twoAxles : p.oneAxle} р.`;
    };
    f.addEventListener('change', upd); upd();
  }
})();
