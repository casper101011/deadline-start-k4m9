/* Deadline EDU — роутинг и страницы */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem('dl_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('dl_' + k, JSON.stringify(v)); } catch (e) {} },
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Фото (Unsplash, бесплатная лицензия). Если не загрузятся — сайт выглядит нормально и без них.
const PHOTOS = {
  hero: '1551288049-bebda4e38f71',
  s1: '1758873272540-439a105db676',
  s2: '1620325867502-221cfb5faa5f',
  s3: '1551836022-d5d88e9218df',
  finale: '1686771416282-3888ddaf249b',
};
const photo = (k, w = 900) => `https://images.unsplash.com/photo-${PHOTOS[k]}?auto=format&fit=crop&q=70&w=${w}`;
const bgPhoto = (k, w, a = .35, b = .92) => `background-image:linear-gradient(180deg,rgba(8,8,11,${a}),rgba(8,8,11,${b})),url('${photo(k, w)}')`;

function toast(msg) {
  const t = $('#toast');
  t.innerHTML = icon('check', 'icon-sm') + esc(msg);
  t.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('on'), 1800);
}
async function copyText(text, msg = 'Скопировано') {
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  toast(msg);
}

// ---------- прогресс ----------
const done = () => store.get('done', {});
const isDone = slug => !!done()[slug];
function setDone(slug, v) { const d = done(); if (v) d[slug] = 1; else delete d[slug]; store.set('done', d); }
const doneCount = () => LESSONS.filter(l => isDone(l.slug)).length;

// ---------- тема ----------
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#themeBtn').innerHTML = icon(t === 'light' ? 'moon' : 'sun');
}
function initTheme() {
  applyTheme(store.get('theme', 'dark'));
  $('#themeBtn').onclick = () => { const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; store.set('theme', t); applyTheme(t); };
}

// ---------- страницы ----------
const ALL_TOOLS = [
  { slug: 'offer', icon: 'sparkles', title: 'Конструктор оффера', desc: 'Офферы по 5 формулам для 10 ниш, сценарии роликов и ТЗ на креатив — за минуту.' },
  { slug: 'calc', icon: 'calculator', title: 'Калькулятор воронки', desc: 'Бюджет → заявки → продажи. Окупится ли реклама и сколько можно платить за заявку.' },
  { slug: 'report', icon: 'barChart', title: 'Отчёт клиенту', desc: 'Загрузите выгрузку из Ads Manager — получите готовое сообщение для Telegram.' },
  { slug: 'checklist', icon: 'clipboard', title: 'Чек-лист проекта', desc: 'Все шаги работы с клиентом по дням. Отдельный список на каждый проект.' },
];
// показываем только те инструменты, которые подключены в этой версии сайта
const TOOLS = ALL_TOOLS.filter(t => TOOL_PAGES[t.slug]);

// Тексты главной можно переопределить в config.js (так сделана версия «Старт»)
const SITE = Object.assign({
  brand: 'Deadline EDU',
  eyebrow: 'Обучение Deadline · таргет Meta',
  h1: 'Таргетолог отвечает за <span class="accent">продажи</span>, а не за клики',
  sub: n => `Пошаговая система работы с клиентом: от разбора бизнеса до масштабирования. 3 этапа, ${n} уроков и инструменты, которыми можно пользоваться уже сегодня.`,
  tagline: 'обучение таргету',
  homeworkTitle: 'Внедри сегодня',
  homeworkLead: 'Знания без действий = 0. Сделай это на своём реальном проекте:',
  today: null, // { title, note, items: [[текст, ссылка], ...] } — блок «План на сегодня»
  principles: [
    ['Бизнес, а не кабинет', 'Сначала разбираемся в продукте, чеке и марже клиента — потом настраиваем рекламу.'],
    ['Гипотезы, а не «на авось»', 'Запускаем 2–3 варианта сразу и оставляем то, что даёт заявки дешевле.'],
    ['Продажи, а не заявки', 'Следим, что происходит с заявкой после того, как она пришла.'],
    ['Цифры, а не ощущения', 'Цена заявки, конверсия в продажу и окупаемость — основа любых решений.'],
  ],
}, (window.DL_CONFIG || {}).SITE || {});

function pageHome() {
  const total = LESSONS.length, d = doneCount();
  const next = LESSONS.find(l => !isDone(l.slug)) || LESSONS[0];
  return `
  <section class="container hero">
    <h1 class="display">${SITE.h1}</h1>
    <div class="hero-row">
      <p class="hero-sub">${SITE.sub(total)}</p>
      <div class="hero-side">
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/lesson/${next.slug}">${d ? 'Продолжить обучение' : 'Начать обучение'} ${icon('arrowRight', 'icon-sm')}</a>
        </div>
        <div class="hero-progress">
          <div class="progress-label"><span>Пройдено уроков</span><span>${d} из ${total}</span></div>
          <div class="progress-bar"><span style="width:${Math.round(d / total * 100)}%"></span></div>
        </div>
      </div>
    </div>
  </section>

  ${SITE.today ? `<section class="container"><div class="stage-plain today">
    <div class="sp-head"><h2>${SITE.today.title}</h2>${SITE.today.note ? `<p>${SITE.today.note}</p>` : ''}</div>
    <ol class="today-list">${SITE.today.items.map(([t, href]) => `<li>${href ? `<a href="${href}">${t}</a>` : t}</li>`).join('')}</ol>
  </div></section>` : ''}

  <section class="container" id="program">
    ${STAGES.map(s => {
      const ls = LESSONS.filter(l => l.stage === s.n);
      return `
      <div class="stage-plain">
        <div class="sp-head"><h2>${s.title}. ${s.name}</h2><p>${s.desc}</p></div>
        <div class="rows">
          ${ls.map((l, i) => `<a class="row" href="#/lesson/${l.slug}"><span class="rn">${i + 1}</span><span class="rt">${l.title}</span><span class="rm">${l.minutes} мин</span><span class="done-mark ${isDone(l.slug) ? 'on' : ''}">${icon('check', 'icon-sm')}</span></a>`).join('')}
        </div>
      </div>`;
    }).join('')}

    <div class="stage-plain">
      <div class="sp-head"><h2>Инструменты</h2><p>Применяйте уроки сразу.</p></div>
      <div class="rows">
        ${TOOLS.map(t => `<a class="row row-tool" href="#/tools/${t.slug}"><span class="rt">${t.title}<small>${t.desc}</small></span><span class="rm">${icon('arrowRight', 'icon-sm')}</span></a>`).join('')}
        <a class="row row-tool" href="#/glossary"><span class="rt">Словарь терминов<small>CPL, ROMI, оффер, хук — простыми словами и с примерами.</small></span><span class="rm">${icon('arrowRight', 'icon-sm')}</span></a>
      </div>
    </div>
  </section>`;
}

function sidebarHtml(activeSlug) {
  return STAGES.map(s => `
    <div class="sidebar-group">
      <h4>${s.title} · ${s.name}</h4>
      ${LESSONS.filter(l => l.stage === s.n).map(l => `
        <a href="#/lesson/${l.slug}" class="${l.slug === activeSlug ? 'active' : ''}">
          <span class="sb-dot ${isDone(l.slug) ? 'on' : ''}"></span><span>${l.title}</span>
        </a>`).join('')}
    </div>`).join('') + `
    <div class="sidebar-group">
      <h4>Инструменты</h4>
      ${TOOLS.map(t => `<a href="#/tools/${t.slug}" class="${'tool-' + t.slug === activeSlug ? 'active' : ''}"><span class="sb-ico">${icon(t.icon, 'icon-sm')}</span><span>${t.title}</span></a>`).join('')}
      <a href="#/glossary"><span class="sb-ico">${icon('book', 'icon-sm')}</span><span>Словарь терминов</span></a>
    </div>`;
}

function pageLesson(slug) {
  const i = LESSONS.findIndex(l => l.slug === slug);
  if (i < 0) return null;
  const l = LESSONS[i], prev = LESSONS[i - 1], next = LESSONS[i + 1];
  const st = STAGES.find(s => s.n === l.stage);
  return `
  <div class="lesson-layout has-toc">
    <aside class="sidebar" id="sidebar">${sidebarHtml(slug)}</aside>
    <article class="article">
      <header class="article-head">
        <p class="l-meta">${st.title} · ${st.name} · ${l.minutes} мин${isDone(slug) ? ' · пройден' : ''}</p>
        <h1 class="display">${l.title}</h1>
        <p class="lead">${l.goal}</p>
      </header>
      <div class="prose">${l.html}</div>
      <section class="prose end"><h2>Главное</h2>${ul(l.summary)}</section>
      <section class="prose end"><h2>${SITE.homeworkTitle}</h2><p>${SITE.homeworkLead}</p>${ol(l.homework)}</section>
      <div class="done-row">
        <button class="btn ${isDone(slug) ? 'btn-ghost' : 'btn-primary'}" id="doneBtn">${isDone(slug) ? 'Снять отметку «пройден»' : 'Отметить урок пройденным'}</button>
      </div>
      <nav class="pager">
        ${prev ? `<a href="#/lesson/${prev.slug}"><small>← Назад</small><b>${prev.title}</b></a>` : '<span></span>'}
        ${next ? `<a class="next" href="#/lesson/${next.slug}"><small>Дальше →</small><b>${next.title}</b></a>` : `<a class="next" href="#/tools/offer"><small>Дальше →</small><b>Инструменты и словарь</b></a>`}
      </nav>
    </article>
    ${l.toc && l.toc.length ? `<aside class="toc-side"><h4>На этой странице</h4>${l.toc.map(([id, t]) => `<a href="#/lesson/${slug}/${id}" data-id="${id}">${t}</a>`).join('')}</aside>` : ''}
  </div>`;
}

function bindLesson(slug) {
  $('#doneBtn').onclick = () => {
    const v = !isDone(slug); setDone(slug, v);
    if (v) {
      toast('Урок пройден');
      const i = LESSONS.findIndex(l => l.slug === slug);
      const next = LESSONS[i + 1];
      if (next) { location.hash = '#/lesson/' + next.slug; return; }
    }
    render();
  };
  bindNiches();
}
function bindNiches(root = document) {
  $$('.niche-tabs', root).forEach(nt => {
    $$('.nt-head button', nt).forEach(b => b.onclick = () => {
      $$('.nt-head button', nt).forEach(x => x.classList.toggle('on', x === b));
      $$('.nt-body > div', nt).forEach((x, i) => x.classList.toggle('on', i == b.dataset.i));
    });
  });
}

function pageGlossary() {
  return `
  <div class="tool-shell"><div class="tool-page" style="padding:0">
    <div class="tool-head">
      <span class="eyebrow"><span class="dot"></span>Справка</span>
      <h1 class="display">Словарь терминов</h1>
      <p>Всё, что встречается в обучении, — простыми словами и с примерами. Если какое-то слово непонятно, ищите здесь.</p>
    </div>
    <div class="gloss-bar">
      <div class="field"><input class="input" id="gSearch" placeholder="Найти термин: например, CPL" autocomplete="off"></div>
      <div class="chips" id="gCats">${['Все', ...GLOSSARY_CATS].map((c, i) => `<button class="chip ${i ? '' : 'on'}" data-c="${i ? c : ''}">${c}</button>`).join('')}</div>
    </div>
    <div class="gloss-grid" id="gList"></div>
  </div></div>`;
}
function bindGlossary() {
  let cat = '';
  const draw = () => {
    const q = $('#gSearch').value.trim().toLowerCase();
    const items = GLOSSARY.filter(([t, d, e, , c]) => (!cat || c === cat) && (!q || (t + d + e).toLowerCase().includes(q)));
    $('#gList').innerHTML = items.length ? items.map(([t, d, e, ic, c]) => `
      <div class="card gloss-item">
        <div class="gloss-top"><div class="gloss-ic">${icon(ic)}</div><div><h3>${t}</h3><span class="tag">${c}</span></div></div>
        <p>${d}</p>${e ? `<div class="gloss-ex"><b>Пример</b> ${e}</div>` : ''}
      </div>`).join('')
      : `<div class="card empty" style="grid-column:1/-1">${icon('search')}<div>Такого термина пока нет. Попробуйте другое слово.</div></div>`;
  };
  draw();
  $('#gSearch').addEventListener('input', draw);
  $('#gCats').onclick = e => {
    const b = e.target.closest('.chip'); if (!b) return;
    cat = b.dataset.c; $$('#gCats .chip').forEach(x => x.classList.toggle('on', x === b)); draw();
  };
}

function pageTool(slug) {
  const t = TOOLS.find(x => x.slug === slug);
  if (!t) return null;
  return `
  <div class="tool-shell">
    <div class="chips tool-tabs">${TOOLS.map(x => `<a class="chip ${x.slug === slug ? 'on' : ''}" href="#/tools/${x.slug}">${icon(x.icon, 'icon-sm')} ${x.title}</a>`).join('')}</div>
    ${TOOL_PAGES[slug].html()}
  </div>`;
}

// ---------- плавное появление блоков ----------
function checkReveal() {
  $$('.reveal.pre:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * 0.94) el.classList.add('in'); });
}
function initReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // блоки, которые уже на экране, не прячем — анимируются только те, что ниже
  $$('.reveal').forEach(el => { if (el.getBoundingClientRect().top >= innerHeight * 0.94) el.classList.add('pre'); });
  setTimeout(checkReveal, 50);
}

// ---------- роутер ----------
function render() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const app = $('#app');
  let html = null, after = null, anchor = null, nav = 'home';
  document.body.classList.remove('sb-open');
  if (parts[0] === 'lesson') {
    html = pageLesson(parts[1]); after = () => bindLesson(parts[1]); anchor = parts[2]; nav = 'learn';
  } else if (parts[0] === 'tools' && TOOL_PAGES[parts[1]]) {
    html = pageTool(parts[1]); after = () => TOOL_PAGES[parts[1]].bind(); nav = 'tools';
  } else if (parts[0] === 'glossary') {
    html = pageGlossary(); after = bindGlossary; nav = 'glossary';
  } else if (parts[0] === 'program') {
    html = pageHome(); anchor = 'program';
  } else {
    html = pageHome();
  }
  if (html === null) html = pageHome();
  app.innerHTML = html;
  $('.menu-btn').style.visibility = $('#sidebar') ? 'visible' : 'hidden';
  $$('.nav-pill a').forEach(a => a.classList.toggle('active', a.dataset.nav === nav));
  const title = parts[0] === 'lesson' ? (LESSONS.find(l => l.slug === parts[1]) || {}).title
    : parts[0] === 'tools' ? (TOOLS.find(t => t.slug === parts[1]) || {}).title
    : parts[0] === 'glossary' ? 'Словарь терминов' : null;
  document.title = title ? `${title} — ${SITE.brand}` : `${SITE.brand} — ${SITE.tagline}`;
  if (after) after();
  if (parts[0] === 'tools') {
    const t = TOOLS.find(x => x.slug === parts[1]), th = $('.tool-head');
    if (t && th) th.insertAdjacentHTML('afterbegin', `<div class="th-icon">${icon(t.icon)}</div>`);
  }
  if (parts[0] === 'glossary') { const th = $('.tool-head'); if (th) th.insertAdjacentHTML('afterbegin', `<div class="th-icon">${icon('book')}</div>`); }
  initReveal();
  updateReadBar();
  if (anchor) { const el = document.getElementById(anchor); if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; } }
  window.scrollTo(0, 0);
}

function updateReadBar() {
  const bar = $('#readbar'); if (!bar) return;
  const inLesson = location.hash.startsWith('#/lesson/');
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = inLesson && h > 0 ? Math.min(100, scrollY / h * 100) + '%' : '0';
  // подсветка текущего раздела в содержании справа
  const links = $$('.toc-side a'); if (!links.length) return;
  let cur = null;
  links.forEach(a => { const el = document.getElementById(a.dataset.id); if (el && el.getBoundingClientRect().top < 140) cur = a; });
  links.forEach(a => a.classList.toggle('on', a === cur));
}

function init() {
  initTheme();
  $('.menu-btn').innerHTML = icon('menu');
  $('.menu-btn').onclick = () => document.body.classList.toggle('sb-open');
  $('.overlay').onclick = () => document.body.classList.remove('sb-open');
  $('#learnLink').onclick = e => {
    e.preventDefault();
    const next = LESSONS.find(l => !isDone(l.slug)) || LESSONS[0];
    location.hash = '#/lesson/' + next.slug;
  };
  // содержание урока: плавная прокрутка без перезагрузки страницы
  document.addEventListener('click', e => {
    const a = e.target.closest('.toc a, .toc-side a'); if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.getAttribute('href').split('/').pop());
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  window.addEventListener('scroll', () => { updateReadBar(); checkReveal(); }, { passive: true });
  window.addEventListener('resize', checkReveal);
  window.addEventListener('hashchange', render);
  render();
}
document.addEventListener('DOMContentLoaded', init);
