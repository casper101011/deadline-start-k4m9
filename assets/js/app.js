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
  const mins = LESSONS.reduce((a, l) => a + l.minutes, 0);
  return `
  <section class="container hero">
    <span class="eyebrow"><span class="dot"></span>${SITE.eyebrow}</span>
    <h1 class="display">${SITE.h1}</h1>
    <div class="hero-row">
      <p class="hero-sub">${SITE.sub(total)}</p>
      <div class="hero-side">
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/lesson/${next.slug}">${d ? 'Продолжить обучение' : 'Начать обучение'} ${icon('arrowRight', 'icon-sm')}</a>
          <a class="btn btn-ghost" href="#/tools/offer">${icon('sparkles', 'icon-sm')} Конструктор оффера</a>
        </div>
        <div class="hero-progress">
          <div class="progress-label"><span>${d ? 'Следующий урок: ' + esc(next.title.length > 36 ? next.title.slice(0, 36) + '…' : next.title) : 'Ваш прогресс'}</span><span>${d} из ${total}</span></div>
          <div class="progress-bar"><span style="width:${Math.round(d / total * 100)}%"></span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="container">
    <div class="stats-strip">
      <div><b>${total}</b><span>уроков</span></div>
      <div><b>${TOOLS.length}</b><span>${TOOLS.length === 1 ? 'инструмент' : 'инструмента'}</span></div>
      <div><b>~${mins}</b><span>минут чтения</span></div>
      <div><b>10</b><span>ниш в примерах</span></div>
    </div>
    <div class="principles">
      ${SITE.principles.map(([t, p], i) => `<div class="card principle reveal"><div class="num">0${i + 1}</div><h3>${t}</h3><p>${p}</p></div>`).join('')}
    </div>
  </section>

  <section class="container" id="program">
    <div class="section-head">
      <h2 class="display">Программа</h2>
      <p>Проходите по порядку и внедряйте каждый урок на реальном проекте.</p>
    </div>
    ${STAGES.map(s => {
      const ls = LESSONS.filter(l => l.stage === s.n), dn = ls.filter(l => isDone(l.slug)).length;
      return `
      <div class="stage reveal">
        <div class="card stage-info">
          <span class="si-num">0${s.n}</span>
          <div><span class="eyebrow"><span class="dot"></span>${s.title}</span><h3 class="display">${s.name}</h3><p>${s.desc}</p></div>
          <div class="si-meta">${icon('clock', 'icon-sm')} ${ls.length} ${ls.length === 1 ? 'урок' : ls.length < 5 ? 'урока' : 'уроков'} · ${ls.reduce((a, l) => a + l.minutes, 0)} мин · пройдено ${dn}/${ls.length}</div>
        </div>
        <div class="stage-lessons">
          ${LESSONS.filter(l => l.stage === s.n).map(l => `
            <a class="card lesson-card" href="#/lesson/${l.slug}">
              <div class="lc-top"><div class="lc-icon">${icon(l.icon)}</div><div class="done-mark ${isDone(l.slug) ? 'on' : ''}">${icon('check', 'icon-sm')}</div></div>
              <h3>${l.title}</h3>
              <p class="lc-short">${l.short}</p>
              <div class="lc-meta">${icon('clock', 'icon-sm')} ${l.minutes} мин</div>
            </a>`).join('')}
        </div>
      </div>`;
    }).join('')}
  </section>

  <section class="container" style="margin-top:70px">
    <div class="section-head">
      <h2 class="display">Инструменты</h2>
      <p>Применяйте уроки сразу: офферы, расчёты, отчёты и чек-листы.</p>
    </div>
    <div class="tools-grid">
      ${TOOLS.map(t => `
        <a class="card tool-card reveal" href="#/tools/${t.slug}">
          <div class="tc-icon">${icon(t.icon)}</div>
          <h3>${t.title}</h3>
          <p>${t.desc}</p>
          <span class="go">Открыть ${icon('arrowRight', 'icon-sm')}</span>
        </a>`).join('')}
    </div>
    <a class="card glossary-banner reveal" href="#/glossary">
      <div>${icon('book', 'icon-lg')}</div>
      <div><h3>Словарь терминов</h3><p>CPL, ROMI, оффер, хук, ретаргет — простыми словами и с примерами. Для тех, кто только начинает.</p></div>
      <span class="go">Открыть ${icon('arrowRight', 'icon-sm')}</span>
    </a>
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
  const posInStage = LESSONS.filter(x => x.stage === l.stage).indexOf(l) + 1;
  return `
  <div class="lesson-layout has-toc">
    <aside class="sidebar" id="sidebar">${sidebarHtml(slug)}</aside>
    <article class="article">
      <div class="crumbs"><a href="#/">Главная</a>${icon('arrowRight', 'icon-sm')}<span>${st.title} · урок ${posInStage}</span></div>
      <div class="cover" style="${bgPhoto('s' + l.stage, 1100, .2, .85)}"><small>${st.title}</small><b>${st.name}</b></div>
      <header class="article-head">
        <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag tag-accent">${st.title} · ${st.name}</span><span class="tag">${icon('clock', 'icon-sm')} ${l.minutes} мин</span>${isDone(slug) ? `<span class="tag tag-good">${icon('check', 'icon-sm')} Пройден</span>` : ''}</div>
        <h1 class="display">${l.title}</h1>
        <div class="goal">${icon('target')}<div><b>Цель урока</b>${l.goal}</div></div>
      </header>
      ${l.toc && l.toc.length ? `<nav class="toc">${l.toc.map(([id, t]) => `<a href="#/lesson/${slug}/${id}">${t}</a>`).join('')}</nav>` : ''}
      <div class="prose">${l.html}</div>
      <div class="summary prose"><h3>Главное</h3>${ok(l.summary)}</div>
      <div class="homework"><h3>${icon('zap', 'icon-lg')} Внедри сегодня</h3><p>Знания без действий = 0. Сделай это на своём реальном проекте:</p><ol>${l.homework.map(h => `<li>${h}</li>`).join('')}</ol></div>
      <div class="lesson-done">
        <p>${isDone(slug) ? 'Урок отмечен как пройденный.' : 'Прочитал и внедрил? Отметь урок — прогресс сохранится в этом браузере.'}</p>
        <button class="btn ${isDone(slug) ? 'btn-ghost' : 'btn-accent'}" id="doneBtn">${isDone(slug) ? 'Снять отметку' : icon('check', 'icon-sm') + ' Урок пройден'}</button>
      </div>
      ${next ? '' : `<div class="finale" style="${bgPhoto('finale', 1100, .45, .92)}">
        <h3 class="display">Теория закончилась. Дальше — практика</h3>
        <p>Соберите офферы для своего клиента, посчитайте окупаемость и пройдитесь по чек-листу проекта.</p>
        <div class="hero-actions"><a class="btn btn-primary" href="#/tools/offer">${icon('sparkles', 'icon-sm')} Конструктор оффера</a><a class="btn btn-ghost" href="#/tools/checklist">${icon('clipboard', 'icon-sm')} Чек-лист проекта</a></div>
      </div>`}
      <nav class="pager">
        ${prev ? `<a href="#/lesson/${prev.slug}"><small>${icon('arrowLeft', 'icon-sm')} Назад</small><b>${prev.title}</b></a>` : '<span></span>'}
        ${next ? `<a class="next" href="#/lesson/${next.slug}"><small>Дальше ${icon('arrowRight', 'icon-sm')}</small><b>${next.title}</b></a>` : `<a class="next" href="#/glossary"><small>Справка ${icon('arrowRight', 'icon-sm')}</small><b>Словарь терминов</b></a>`}
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
