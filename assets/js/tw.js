// СТО «Правда»: тема и палитра, живой статус, сезонная плитка, лента отзывов, копирование.
// Калькулятор, запись, лента цеха — в main.js; анимации — в motion.js.
(function () {
  'use strict';
  var root = document.documentElement;
  var CFG = {};
  try { CFG = JSON.parse(document.getElementById('site-cfg').textContent); } catch (e) {}

  /* ── Тема: тёмная / светлая ── */
  var themeBtns = document.querySelectorAll('[data-theme-toggle]');
  var paintTheme = function () {
    var light = root.dataset.theme === 'light';
    themeBtns.forEach(function (b) {
      b.setAttribute('aria-label', light ? 'Тёмная тема' : 'Светлая тема');
      b.setAttribute('aria-pressed', String(light));
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', light ? '#f4f3f0' : '#0a0a0a');
  };
  themeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('pravda-theme', root.dataset.theme); } catch (e) {}
      paintTheme();
    });
  });
  paintTheme();

  /* ── Палитра (цветовые варианты сайта) ── */
  var PAL = CFG.palettes || [];
  var palBtns = document.querySelectorAll('[data-palette-pick]');
  var paintPal = function () {
    var cur = root.dataset.palette || (PAL[0] && PAL[0].id);
    palBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.palettePick === cur)); });
    var name = document.querySelector('[data-palette-name]');
    var p = PAL.filter(function (x) { return x.id === cur; })[0];
    if (name && p) name.textContent = p.name;
  };
  palBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      root.dataset.palette = b.dataset.palettePick;
      try { localStorage.setItem('pravda-palette', root.dataset.palette); } catch (e) {}
      paintPal();
    });
  });
  var palMenu = document.querySelector('[data-palette-menu]');
  var palToggle = document.querySelector('[data-palette-toggle]');
  if (palMenu && palToggle) {
    palToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = palMenu.hidden;
      palMenu.hidden = !open;
      palToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!palMenu.hidden && !palMenu.contains(e.target)) { palMenu.hidden = true; palToggle.setAttribute('aria-expanded', 'false'); }
    });
  }
  paintPal();

  /* ── Статус «Открыто до… / Закрыто, откроемся…» по расписанию из contacts.json (Europe/Minsk) ── */
  var D = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var RU = { mon: 'в пн', tue: 'во вт', wed: 'в ср', thu: 'в чт', fri: 'в пт', sat: 'в сб', sun: 'в вс' };
  var week = CFG.week || {};
  var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Minsk', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, month: 'numeric' }).formatToParts(new Date());
  var o = {}; parts.forEach(function (x) { o[x.type] = x.value; });
  var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
  var mins = (+o.hour % 24) * 60 + +o.minute;
  var month = +o.month;
  var m = function (s) { var a = s.split(':'); return +a[0] * 60 + +a[1]; };
  var hm = function (s) { return s.replace(/^0/, ''); };
  var calc = function () {
    var t = week[D[day]];
    if (t && mins >= m(t[0]) && mins < m(t[1])) return { open: true, text: 'Открыто до ' + hm(t[1]) };
    if (t && mins < m(t[0])) return { open: false, text: 'Откроемся в ' + hm(t[0]) };
    for (var i = 1; i <= 7; i++) {
      var k = D[(day + i) % 7], s = week[k];
      if (s) return { open: false, text: 'Откроемся ' + (i === 1 ? 'завтра' : RU[k]) + ' в ' + hm(s[0]) };
    }
    return { open: false, text: 'Закрыто' };
  };
  var st = calc();
  document.querySelectorAll('[data-status]').forEach(function (el) { el.classList.toggle('is-open', st.open); });
  document.querySelectorAll('[data-status-text]').forEach(function (el) { el.textContent = st.text; });
  var openTitle = document.querySelector('[data-open-title]');
  if (openTitle) {
    openTitle.textContent = st.text;
    openTitle.closest('.tile').classList.toggle('is-open', st.open);
  }

  /* ── Сезонная плитка: только услуги из прайса ── */
  var SEASONS = [
    { months: [10, 11, 12], label: 'Сезон · октябрь–декабрь', title: 'Подготовка к зиме', text: 'Зарядка АКБ, промывка системы охлаждения, извлечение заломанных свечей накала.' },
    { months: [1, 2], label: 'Зима', title: 'Свечи накала и АКБ', text: 'Извлечём заломанные свечи накала, зарядим аккумулятор, проверим печку.' },
    { months: [3, 4, 5], label: 'Сезон · март–май', title: 'Подвеска после зимы', text: 'Проверка на вибростенде: что реально изношено, а что ещё походит.' },
    { months: [6, 7, 8, 9], label: 'Лето', title: 'Кондиционер', text: 'Заправка кондиционера и антибактериальная обработка. Скидка на первую заправку.' }
  ];
  var season = SEASONS.filter(function (s) { return s.months.indexOf(month) !== -1; })[0];
  if (season) {
    var set = function (sel, v) { var el = document.querySelector(sel); if (el) el.textContent = v; };
    set('[data-season-label]', season.label);
    set('[data-season-title]', season.title);
    set('[data-season-text]', season.text);
  }
  if (month >= 11 || month <= 3) document.querySelectorAll('[data-season="winter"]').forEach(function (el) { el.classList.add('is-season'); });

  /* ── Лента отзывов: стрелки ── */
  var track = document.getElementById('reviewsTrack');
  document.querySelectorAll('[data-rv]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!track) return;
      var card = track.querySelector('.rv');
      var step = card ? card.getBoundingClientRect().width + 8 : 320;
      track.scrollBy({ left: step * +btn.getAttribute('data-rv'), behavior: 'smooth' });
    });
  });

  /* ── Копирование ── */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.textContent;
      var done = function () { btn.textContent = 'Скопировано'; setTimeout(function () { btn.textContent = label; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  /* ── Карта и виджеты Яндекса — только по клику (без сторонних cookie при загрузке) ── */
  document.querySelectorAll('[data-embed]').forEach(function (box) {
    var b = box.querySelector('[data-embed-load]');
    if (b) b.addEventListener('click', function () {
      box.innerHTML = '<iframe src="' + box.dataset.embed + '" title="' + (box.dataset.embedTitle || '') + '" allowfullscreen></iframe>';
      box.classList.add('is-loaded');
    });
  });
})();
