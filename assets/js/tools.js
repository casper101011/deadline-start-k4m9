/* Deadline EDU — инструменты */

// ============================================================
// Калькулятор воронки
// ============================================================
const fmt = (n, dec = 0) => isFinite(n) ? n.toLocaleString('ru-RU', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '—';
const CalcTool = {
  defaults: { budget: 300, cpl: 1.5, toMeet: 20, toSale: 33, check: 100, margin: 50, target: 30 },
  html() {
    const v = { ...this.defaults, ...store.get('calc', {}) };
    const f = (k, label, unit, step, hint) => `<div class="field"><label for="c_${k}">${label}${unit ? ` <span style="color:var(--muted);font-weight:400">(${unit})</span>` : ''}</label><input class="input" type="number" min="0" step="${step}" id="c_${k}" name="${k}" value="${v[k]}">${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
    return `
    <div style="padding-bottom:60px">
      <div class="tool-head">
        <span class="eyebrow"><span class="dot"></span>Инструмент · урок 1.2 и 1.3</span>
        <h1 class="display">Калькулятор воронки</h1>
        <p>Посчитайте, сколько клиентов принесёт бюджет, окупится ли реклама и какую максимальную цену заявки может позволить себе бизнес.</p>
      </div>
      <div class="tool-cols">
        <form class="card panel" id="calcForm">
          <div class="panel-title">${icon('settings', 'icon-sm')} Вводные</div>
          ${f('budget', 'Рекламный бюджет', '$', '10')}
          ${f('cpl', 'Цена заявки (CPL)', '$', '0.1')}
          <div class="row-2">
            ${f('toMeet', 'Заявка → встреча', '%', '1', '5 заявок → 1 встреча = 20%')}
            ${f('toSale', 'Встреча → продажа', '%', '1', '3 встречи → 1 продажа ≈ 33%')}
          </div>
          <div class="row-2">
            ${f('check', 'Средний чек', '$', '1')}
            ${f('margin', 'Маржа', '%', '1', 'доля прибыли в чеке')}
          </div>
          <div class="panel-title" style="margin-top:22px">${icon('target', 'icon-sm')} Обратный расчёт</div>
          ${f('target', 'Сколько продаж нужно', 'шт.', '1')}
        </form>
        <div id="calcOut"></div>
      </div>
    </div>`;
  },
  calc() {
    const v = {}; $$('#calcForm input').forEach(i => v[i.name] = parseFloat(String(i.value).replace(',', '.')) || 0);
    store.set('calc', v);
    const leads = v.cpl ? v.budget / v.cpl : 0;
    const meets = leads * v.toMeet / 100;
    const sales = meets * v.toSale / 100;
    const revenue = sales * v.check;
    const profit = revenue * v.margin / 100;
    const net = profit - v.budget;
    const romi = v.budget ? net / v.budget * 100 : 0;
    const cpa = sales ? v.budget / sales : Infinity;
    const leadToSale = v.toMeet / 100 * v.toSale / 100;
    const maxCpl = v.check * v.margin / 100 * leadToSale;
    const maxCpa = v.check * v.margin / 100;
    const needLeads = leadToSale ? v.target / leadToSale : 0;
    const needBudget = needLeads * v.cpl;
    let verdict;
    if (!sales) verdict = ['warn', 'alert', 'Заполните цифры — по ним пока не выходит ни одной продажи.'];
    else if (romi >= 100) verdict = ['good', 'checkCircle', `Реклама окупается с запасом: каждый $1 бюджета возвращает $${fmt(profit / v.budget, 1)} прибыли. Можно масштабировать.`];
    else if (romi >= 0) verdict = ['warn', 'alert', `Реклама окупается впритык. Чтобы был запас, снизьте цену заявки до $${fmt(maxCpl * 0.5, 2)} или поднимите конверсию в продажу.`];
    else verdict = ['bad', 'xCircle', `Реклама в минус. Бизнес может платить за заявку максимум $${fmt(maxCpl, 2)}, а сейчас $${fmt(v.cpl, 2)}. Работайте над оффером или конверсией отдела продаж.`];
    const rows = [['Заявки', leads], ['Встречи', meets], ['Продажи', sales]];
    const max = leads || 1;
    $('#calcOut').innerHTML = `
      <div class="card panel">
        <div class="panel-title">${icon('chart', 'icon-sm')} Результат</div>
        <div class="stats">
          <div class="stat"><small>Заявки</small><b>${fmt(leads)}</b></div>
          <div class="stat"><small>Встречи</small><b>${fmt(meets)}</b></div>
          <div class="stat"><small>Продажи</small><b>${fmt(sales, 1)}</b></div>
          <div class="stat"><small>Выручка</small><b>$${fmt(revenue)}</b></div>
          <div class="stat"><small>Цена клиента</small><b>$${fmt(cpa, 1)}</b><span>CPA</span></div>
          <div class="stat ${romi >= 0 ? 'good' : 'bad'}"><small>Окупаемость</small><b>${fmt(romi)}%</b><span>ROMI</span></div>
        </div>
        <div class="funnel-vis">${rows.map(([n, x]) => `<div class="fv-row"><span>${n}</span><div class="bar"><span style="width:${Math.max(1, x / max * 100)}%"></span></div><b>${fmt(x, x < 10 ? 1 : 0)}</b></div>`).join('')}</div>
        <div class="verdict ${verdict[0]}">${icon(verdict[1])}<div>${verdict[2]}</div></div>
      </div>
      <div class="card panel" style="margin-top:12px">
        <div class="panel-title">${icon('shield', 'icon-sm')} Границы окупаемости</div>
        <div class="stats">
          <div class="stat hl"><small>Макс. цена заявки</small><b>$${fmt(maxCpl, 2)}</b><span>дороже — реклама в минус</span></div>
          <div class="stat"><small>Макс. цена клиента</small><b>$${fmt(maxCpa, 1)}</b><span>вся прибыль с продажи</span></div>
          <div class="stat"><small>Чистыми</small><b style="color:${net >= 0 ? 'var(--good)' : 'var(--bad)'}">$${fmt(net)}</b><span>прибыль минус бюджет</span></div>
        </div>
      </div>
      <div class="card panel" style="margin-top:12px">
        <div class="panel-title">${icon('target', 'icon-sm')} Чтобы получить ${fmt(v.target)} продаж</div>
        <div class="stats">
          <div class="stat"><small>Нужно заявок</small><b>${fmt(needLeads)}</b></div>
          <div class="stat hl"><small>Нужен бюджет</small><b>$${fmt(needBudget)}</b><span>при CPL $${fmt(v.cpl, 2)}</span></div>
          <div class="stat"><small>Прибыль с них</small><b>$${fmt(v.target * maxCpa)}</b></div>
        </div>
      </div>`;
  },
  bind() { this.calc(); $('#calcForm').addEventListener('input', () => this.calc()); },
};

// ============================================================
// Отчёт клиенту из выгрузки Ads Manager
// ============================================================
const COLS = {
  ad: ['название объявления', 'ad name'],
  adset: ['название группы объявлений', 'ad set name'],
  campaign: ['название кампании', 'campaign name'],
  spend: ['потраченная сумма', 'сумма затрат', 'amount spent'],
  results: ['результаты', 'results'],
  leads: ['лиды', 'leads', 'начатые переписки', 'messaging conversations started'],
  impressions: ['показы', 'impressions'],
  reach: ['охват', 'reach'],
  clicks: ['клики по ссылке', 'link clicks'],
  start: ['начало отчетности', 'начало отчётности', 'reporting starts'],
  end: ['конец отчетности', 'конец отчётности', 'reporting ends'],
};
function findCol(headers, keys, exactFirst) {
  const h = headers.map(x => String(x || '').toLowerCase().trim());
  for (const k of keys) { const i = h.findIndex(x => x === k); if (i >= 0) return i; }
  if (exactFirst) { for (const k of keys) { const i = h.findIndex(x => x.startsWith(k) && !x.includes('цена') && !x.includes('cost')); if (i >= 0) return i; } return -1; }
  for (const k of keys) { const i = h.findIndex(x => x.startsWith(k)); if (i >= 0) return i; }
  return -1;
}
function num(v) {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/\s| /g, '').replace(/[^\d,.\-]/g, '');
  if (!s) return 0;
  const n = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
  return parseFloat(n) || 0;
}
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/)[0];
  const delim = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : (first.includes('\t') ? '\t' : ',');
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => String(x).trim()));
}
function analyzeRows(rows) {
  const headers = rows[0];
  const idx = {}; for (const k in COLS) idx[k] = findCol(headers, COLS[k], k === 'results');
  if (idx.spend < 0) throw new Error('Не нашёл колонку «Потраченная сумма». Проверьте, что это выгрузка из Ads Manager.');
  const resIdx = idx.results >= 0 ? idx.results : idx.leads;
  if (resIdx < 0) throw new Error('Не нашёл колонку «Результаты». Добавьте её в столбцы Ads Manager и выгрузите снова.');
  const nameIdx = idx.ad >= 0 ? idx.ad : idx.adset >= 0 ? idx.adset : idx.campaign;
  const level = idx.ad >= 0 ? 'объявления' : idx.adset >= 0 ? 'группы объявлений' : 'кампании';
  const currency = (String(headers[idx.spend]).match(/\(([A-Z]{3})\)/) || [])[1] || 'USD';
  const map = new Map(); let start = '', end = '';
  rows.slice(1).forEach(r => {
    const name = nameIdx >= 0 ? String(r[nameIdx] || '').trim() : 'Все объявления';
    if (!name || /^(итого|всего|total)/i.test(name)) return;
    const it = map.get(name) || { name, spend: 0, results: 0, impressions: 0, clicks: 0, reach: 0 };
    it.spend += num(r[idx.spend]); it.results += num(r[resIdx]);
    if (idx.impressions >= 0) it.impressions += num(r[idx.impressions]);
    if (idx.clicks >= 0) it.clicks += num(r[idx.clicks]);
    if (idx.reach >= 0) it.reach += num(r[idx.reach]);
    map.set(name, it);
    if (idx.start >= 0 && r[idx.start] && (!start || String(r[idx.start]) < start)) start = String(r[idx.start]);
    if (idx.end >= 0 && r[idx.end] && (!end || String(r[idx.end]) > end)) end = String(r[idx.end]);
  });
  const items = [...map.values()].filter(x => x.spend > 0 || x.results > 0);
  if (!items.length) throw new Error('В файле нет строк с расходом. Проверьте период выгрузки.');
  items.forEach(x => { x.cpl = x.results ? x.spend / x.results : Infinity; x.ctr = x.impressions ? x.clicks / x.impressions * 100 : null; });
  const tot = items.reduce((a, x) => ({ spend: a.spend + x.spend, results: a.results + x.results, impressions: a.impressions + x.impressions, clicks: a.clicks + x.clicks }), { spend: 0, results: 0, impressions: 0, clicks: 0 });
  tot.cpl = tot.results ? tot.spend / tot.results : Infinity;
  tot.ctr = tot.impressions ? tot.clicks / tot.impressions * 100 : null;
  return { items, tot, level, currency, start, end, hasCtr: idx.impressions >= 0 && idx.clicks >= 0 };
}
const DEMO_CSV = `Название объявления;Начало отчетности;Конец отчетности;Потраченная сумма (USD);Результаты;Показы;Клики по ссылке
Видео — хук «боитесь боли?»;2026-11-01;2026-11-07;42,10;38;15200;310
Карусель — до/после;2026-11-01;2026-11-07;35,60;19;12800;190
Фото врача + оффер «консультация бесплатно»;2026-11-01;2026-11-07;28,30;22;9900;160
Сторис — скидка 20%;2026-11-01;2026-11-07;18,40;3;7400;45
Видео — отзыв пациента;2026-11-01;2026-11-07;25,90;20;8300;150`;

const ReportTool = {
  data: null,
  html() {
    const s = store.get('report', { client: '', target: '', sales: '' });
    return `
    <div style="padding-bottom:60px">
      <div class="tool-head">
        <span class="eyebrow"><span class="dot"></span>Инструмент · урок 3.2</span>
        <h1 class="display">Отчёт клиенту</h1>
        <p>Загрузите выгрузку из Ads Manager — сайт сам посчитает заявки, цену заявки, найдёт лучшие и худшие объявления и соберёт готовое сообщение для Telegram. Файл никуда не отправляется: всё считается прямо в браузере.</p>
      </div>
      <div class="tool-cols">
        <div class="card panel">
          <div class="panel-title">${icon('list', 'icon-sm')} Как выгрузить из Ads Manager</div>
          <ol class="howto">
            <li>Откройте Ads Manager, вкладку <strong>«Объявления»</strong>.</li>
            <li>Выберите период: например, <strong>«Последние 7 дней»</strong>.</li>
            <li>Нажмите <strong>«Отчёты» → «Экспорт данных таблицы»</strong>.</li>
            <li>Выберите формат <strong>.csv</strong> или <strong>.xlsx</strong> и сохраните файл.</li>
            <li>Перетащите файл в окно справа.</li>
          </ol>
          <div class="panel-title" style="margin-top:22px">${icon('settings', 'icon-sm')} Дополнительно</div>
          <form id="repForm">
            <div class="field"><label for="r_client">Имя клиента</label><input class="input" id="r_client" name="client" placeholder="например: Алишер" value="${esc(s.client)}"></div>
            <div class="field"><label for="r_target">Целевая цена заявки, $</label><input class="input" id="r_target" name="target" type="number" step="0.1" min="0" placeholder="например: 1.5" value="${esc(s.target)}"><div class="hint">необязательно — для сравнения</div></div>
            <div class="field"><label for="r_sales">Продаж за период (со слов клиента)</label><input class="input" id="r_sales" name="sales" type="number" min="0" placeholder="если знаете" value="${esc(s.sales)}"><div class="hint">необязательно — посчитаем цену клиента</div></div>
          </form>
        </div>
        <div>
          <label class="card dropzone" id="drop">
            <input type="file" id="fileIn" accept=".csv,.xlsx,.xls,.txt" hidden>
            ${icon('upload')}
            <b>Перетащите файл выгрузки сюда</b>
            <p>или нажмите, чтобы выбрать · CSV или XLSX</p>
          </label>
          <div style="text-align:center;margin:12px 0 0"><button class="btn btn-ghost btn-sm" id="demoBtn">${icon('eye', 'icon-sm')} Посмотреть на примере</button></div>
          <div id="repOut" style="margin-top:12px"></div>
        </div>
      </div>
    </div>`;
  },
  async readFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      if (!window.XLSX) throw new Error('Чтение Excel недоступно без интернета. Сохраните выгрузку в формате CSV.');
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' }).filter(r => r.some(x => String(x).trim()));
    }
    return parseCSV(await file.text());
  },
  async load(file) {
    try { this.data = analyzeRows(await this.readFile(file)); this.render(); }
    catch (e) { $('#repOut').innerHTML = `<div class="verdict bad">${icon('xCircle')}<div>${esc(e.message)}</div></div>`; }
  },
  opts() { const fd = new FormData($('#repForm')); const o = Object.fromEntries(fd.entries()); store.set('report', o); return o; },
  text() {
    const { items, tot, currency, start, end } = this.data; const o = this.opts();
    const cur = currency === 'USD' ? '$' : currency + ' ';
    const m = x => cur + fmt(x, 2);
    const withRes = items.filter(x => x.results > 0).sort((a, b) => a.cpl - b.cpl);
    const best = withRes[0];
    const target = parseFloat(o.target) || 0;
    const drain = items.filter(x => (x.results === 0 && x.spend >= Math.max(tot.cpl * 2, 3)) || (x.results > 0 && x.cpl > tot.cpl * 1.8 && x.spend > 5));
    const dt = s => { const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}` : s; };
    const period = start && end ? `${dt(start)} — ${dt(end)}` : 'за неделю';
    const lines = [];
    lines.push(`${o.client ? o.client + ', добрый день!' : 'Добрый день!'} Отчёт по рекламе ${start && end ? 'за ' + period : 'за неделю'}:`);
    lines.push('');
    lines.push(`• Заявок: ${fmt(tot.results)}`);
    lines.push(`• Средняя цена заявки: ${m(tot.cpl)}${target ? (tot.cpl <= target ? ` (цель ${m(target)} — уложились)` : ` (цель ${m(target)} — пока дороже, работаем над этим)`) : ''}`);
    lines.push(`• Потрачено: ${m(tot.spend)}`);
    if (o.sales && +o.sales > 0) lines.push(`• Продаж: ${o.sales}, цена клиента: ${m(tot.spend / +o.sales)}`);
    lines.push('');
    const q = s => `“${s}”`;
    if (best) lines.push(`Лучше всего работает ${q(best.name)} — заявка по ${m(best.cpl)}.`);
    if (drain.length) lines.push(`Отключаем или переделываем: ${drain.map(x => q(x.name)).join(', ')} — заявки там слишком дорогие.`);
    lines.push('');
    lines.push('Дальше:');
    if (best) lines.push(`— увеличиваем бюджет на лучшие объявления;`);
    if (drain.length) lines.push(`— вместо слабых запускаем новые креативы и офферы;`);
    if (tot.ctr !== null && tot.ctr < 1) lines.push(`— обновляем креативы: реклама цепляет слабо (CTR ${fmt(tot.ctr, 2)}%);`);
    lines.push(`— тестируем новую гипотезу по аудитории.`);
    lines.push('');
    lines.push(o.sales ? 'Если будут вопросы — на связи.' : 'Как у нас продажи с этих заявок? Это поможет понять, какие объявления приносят именно клиентов.');
    return lines.join('\n');
  },
  render() {
    if (!this.data) return;
    const { items, tot, level, currency, hasCtr } = this.data;
    const cur = currency === 'USD' ? '$' : currency + ' ';
    const sorted = [...items].sort((a, b) => a.cpl - b.cpl || b.results - a.results);
    const withRes = sorted.filter(x => x.results > 0);
    const bestName = withRes[0] && withRes[0].name, worstName = sorted.length > 1 ? sorted[sorted.length - 1].name : null;
    $('#repOut').innerHTML = `
      <div class="card panel">
        <div class="panel-title">${icon('chart', 'icon-sm')} Итоги</div>
        <div class="stats">
          <div class="stat"><small>Потрачено</small><b>${cur}${fmt(tot.spend, 0)}</b></div>
          <div class="stat"><small>Заявок</small><b>${fmt(tot.results)}</b></div>
          <div class="stat hl"><small>Цена заявки</small><b>${cur}${fmt(tot.cpl, 2)}</b></div>
        </div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>${cap(level)}</th><th class="num">Расход</th><th class="num">Заявки</th><th class="num">Цена</th>${hasCtr ? '<th class="num">CTR</th>' : ''}</tr></thead>
          <tbody>${sorted.map(x => `<tr class="${x.name === bestName ? 'best' : x.name === worstName ? 'worst' : ''}"><td>${esc(x.name)}</td><td class="num">${cur}${fmt(x.spend, 2)}</td><td class="num">${fmt(x.results)}</td><td class="num">${isFinite(x.cpl) ? cur + fmt(x.cpl, 2) : '—'}</td>${hasCtr ? `<td class="num">${x.ctr !== null ? fmt(x.ctr, 2) + '%' : '—'}</td>` : ''}</tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card panel" style="margin-top:12px">
        <div class="panel-title">${icon('message', 'icon-sm')} Готовое сообщение клиенту</div>
        <pre class="pre" id="repText">${esc(this.text())}</pre>
        <div class="offer-actions"><button class="btn btn-accent btn-sm" id="copyRep">${icon('copy', 'icon-sm')} Скопировать для Telegram</button></div>
      </div>`;
    $('#copyRep').onclick = () => copyText(this.text(), 'Отчёт скопирован');
  },
  bind() {
    const drop = $('#drop'), inp = $('#fileIn');
    inp.onchange = () => inp.files[0] && this.load(inp.files[0]);
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) this.load(f); });
    $('#demoBtn').onclick = () => { this.data = analyzeRows(parseCSV(DEMO_CSV)); this.render(); };
    $('#repForm').addEventListener('input', () => { this.opts(); if (this.data) $('#repText').textContent = this.text(); });
    if (this.data) this.render();
  },
};

// ============================================================
// Чек-лист проекта
// ============================================================
const CHECKLIST = [
  { title: 'День 1–2 · Бизнес', icon: 'compass', lesson: 'plan-raboty', items: [
    ['Продукт и УТП', 'почему покупать у клиента, а не у конкурента'],
    ['Средний чек и маржа', 'посчитать допустимую цену заявки в калькуляторе'],
    ['Текущие каналы и прошлые кампании', 'что работало, что нет'],
    ['Точки контакта', 'Instagram, Telegram, сайт, 2GIS'],
    ['Частые вопросы и боли клиентов', 'спросить у заказчика'],
  ]},
  { title: 'День 2 · Конкуренты и ЦА', icon: 'search', lesson: 'analiz-ca', items: [
    ['3–5 конкурентов', 'прямые, косвенные, сильные игроки'],
    ['Библиотека рекламы Meta', 'офферы, долгоживущие объявления, форматы'],
    ['Тайная заявка конкуренту', 'скорость ответа и скрипт'],
    ['Отзывы в 2GIS / Google / Яндекс', 'боли и возражения'],
    ['Сегменты: горячие / тёплые / холодные', ''],
    ['Ситуации покупки', 'когда человек начинает искать решение'],
  ]},
  { title: 'День 2 · Воронка', icon: 'filter', lesson: 'plan-raboty', items: [
    ['Путь клиента от рекламы до оплаты', ''],
    ['Главный канал', 'Telegram / Директ / лид-форма'],
    ['Кто обрабатывает заявки и как быстро', 'норма — до 5 минут'],
    ['Автоответ, бот, CRM или таблица лидов', ''],
    ['Скрипт обработки заявок для менеджеров', ''],
  ]},
  { title: 'День 2–3 · Запуск', icon: 'rocket', lesson: 'offery', items: [
    ['3–5 офферов по формулам', 'конструктор оффера'],
    ['Сценарии видео по 5 шагам', 'хук → проблема → решение → доказательства → призыв'],
    ['ТЗ на креативы дизайнеру и монтажёру', ''],
    ['2–3 гипотезы формата', 'лид-форма / Директ / квиз'],
    ['3–5 групп аудиторий', ''],
  ]},
  { title: 'День 5–7 · Анализ', icon: 'chart', lesson: 'plan-raboty', items: [
    ['Цена заявки по каждой связке', ''],
    ['Заявки → встречи → продажи', 'запросить у клиента'],
    ['Решения', 'дорого → аудитории; нет заявок → оффер и креатив; нет продаж → аудит продаж'],
    ['Записать результаты в дневник цифр', ''],
  ]},
  { title: 'Неделя 2–4 · Масштабирование', icon: 'trendingUp', lesson: 'plan-raboty', items: [
    ['Дублировать лучшие связки и поднять бюджет', ''],
    ['Свежие креативы против выгорания', ''],
    ['Ретаргет на тех, кто оставил заявку и не купил', ''],
  ]},
  { title: 'Постоянно · Клиент', icon: 'message', lesson: 'kommunikaciya', items: [
    ['Еженедельный отчёт', 'заявки, цена, что работает, следующий тест, вопрос про продажи'],
    ['Ответ на вопросы в течение часа', ''],
    ['Новая гипотеза раз в 2 недели', ''],
    ['Предложение по улучшению раз в месяц', ''],
    ['Отзыв и кейс от довольного клиента', ''],
  ]},
];
const CheckTool = {
  st() { return store.get('check', { projects: ['Мой проект'], cur: 0, marks: {} }); },
  html() {
    const s = this.st();
    return `
    <div style="padding-bottom:60px">
      <div class="tool-head">
        <span class="eyebrow"><span class="dot"></span>Инструмент · урок 1.3</span>
        <h1 class="display">Чек-лист проекта</h1>
        <p>Все шаги работы с клиентом по дням. Заведите отдельный список на каждого клиента — отметки сохраняются в этом браузере.</p>
      </div>
      <div class="toolbar">
        <select class="select" id="projSel">${s.projects.map((p, i) => `<option value="${i}" ${i === s.cur ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <button class="btn btn-ghost btn-sm" id="projAdd">${icon('plus', 'icon-sm')} Новый проект</button>
        <button class="btn btn-ghost btn-sm" id="projDel">${icon('trash', 'icon-sm')} Удалить</button>
        <button class="btn btn-ghost btn-sm" id="projPrint">${icon('printer', 'icon-sm')} Печать</button>
      </div>
      <div class="card panel" style="margin-bottom:12px"><div class="progress-label"><span id="chkLabel"></span><span id="chkPct"></span></div><div class="progress-bar"><span id="chkBar"></span></div></div>
      <div id="chkList"></div>
    </div>`;
  },
  render() {
    const s = this.st(); const m = s.marks[s.cur] || {};
    let total = 0, doneN = 0;
    $('#chkList').innerHTML = CHECKLIST.map((g, gi) => {
      const gDone = g.items.filter((_, ii) => m[gi + '-' + ii]).length;
      total += g.items.length; doneN += gDone;
      return `<div class="card check-stage">
        <div class="check-stage-head"><h3>${icon(g.icon, 'icon-sm')} ${g.title} <span class="tag ${gDone === g.items.length ? 'tag-good' : ''}">${gDone}/${g.items.length}</span></h3><a class="btn btn-ghost btn-sm" href="#/lesson/${g.lesson}">Урок ${icon('arrowRight', 'icon-sm')}</a></div>
        ${g.items.map(([t, h], ii) => `<label class="check-item"><input type="checkbox" data-k="${gi}-${ii}" ${m[gi + '-' + ii] ? 'checked' : ''}><span class="check-box">${icon('check', 'icon-sm')}</span><span class="check-text">${t}${h ? `<small>${h}</small>` : ''}</span></label>`).join('')}
      </div>`;
    }).join('');
    $('#chkLabel').textContent = `${s.projects[s.cur]}: выполнено ${doneN} из ${total}`;
    $('#chkPct').textContent = Math.round(doneN / total * 100) + '%';
    $('#chkBar').style.width = (doneN / total * 100) + '%';
  },
  bind() {
    this.render();
    $('#chkList').addEventListener('change', e => {
      const k = e.target.dataset.k; if (!k) return;
      const s = this.st(); s.marks[s.cur] = s.marks[s.cur] || {};
      if (e.target.checked) s.marks[s.cur][k] = 1; else delete s.marks[s.cur][k];
      store.set('check', s); this.render();
    });
    $('#projSel').onchange = e => { const s = this.st(); s.cur = +e.target.value; store.set('check', s); this.render(); };
    $('#projAdd').onclick = () => {
      const name = prompt('Название проекта (например, имя клиента):'); if (!name || !name.trim()) return;
      const s = this.st(); s.projects.push(name.trim()); s.cur = s.projects.length - 1; store.set('check', s); render();
    };
    $('#projDel').onclick = () => {
      const s = this.st();
      if (!confirm(`Удалить проект «${s.projects[s.cur]}» и все его отметки?`)) return;
      s.projects.splice(s.cur, 1);
      const marks = {}; Object.keys(s.marks).forEach(k => { const i = +k; if (i < s.cur) marks[i] = s.marks[k]; else if (i > s.cur) marks[i - 1] = s.marks[k]; });
      s.marks = marks;
      if (!s.projects.length) s.projects = ['Мой проект'];
      s.cur = 0; store.set('check', s); render();
    };
    $('#projPrint').onclick = () => window.print();
  },
};

// Какие инструменты подключены, задаётся в config.js (DL_CONFIG.TOOLS). Если там пусто — все.
const TOOL_PAGES_ALL = { offer: OfferTool, calc: CalcTool, report: ReportTool, checklist: CheckTool };
const TOOL_PAGES = Object.fromEntries(Object.entries(TOOL_PAGES_ALL).filter(([k]) => !(window.DL_CONFIG || {}).TOOLS || window.DL_CONFIG.TOOLS.includes(k)));
