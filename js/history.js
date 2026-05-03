// ── HISTORY ───────────────────────────────────────────────────────────────────
import { _session, sbSelect, sbDelete } from './supabase.js';

let historyFilter = 'all';
let allHistory = [];
let graphMetric = 'weight'; // 'weight' | 'volume'
let graphPeriod = '3m';     // '1m' | '3m' | '6m' | 'all'

// ── SESSION GROUPING ──────────────────────────────────────────────────────────
function countUniqueSessions(rows) {
  const groups = new Set();
  const sorted = [...rows].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let lastTs = null, groupIdx = 0;
  for (const row of sorted) {
    if (row.session_group_id) {
      groups.add(row.session_group_id);
    } else {
      const ts = new Date(row.created_at).getTime();
      if (lastTs === null || ts - lastTs > 60000) { groupIdx++; lastTs = ts; }
      groups.add('ts_' + groupIdx);
    }
  }
  return groups.size;
}

function groupHistory(rows) {
  const groups = [];
  const sorted = [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const seen = new Map();
  sorted.forEach(row => {
    let key;
    if (row.session_group_id) {
      key = row.session_group_id;
    } else {
      key = 'ts_' + Math.floor(new Date(row.created_at).getTime() / 60000);
    }
    if (!seen.has(key)) { seen.set(key, groups.length); groups.push({ key, rows: [] }); }
    groups[seen.get(key)].rows.push(row);
  });
  return groups;
}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────
export async function renderHistory() {
  document.getElementById('history-list').innerHTML = '<div class="loading">Chargement...</div>';
  try {
    allHistory = await sbSelect('sessions', 'user_id=eq.' + _session.user.id + '&order=created_at.desc&limit=200');
    const now = new Date(), weekAgo = new Date(now - 7 * 86400000);
    const sessionCount = countUniqueSessions(allHistory);
    const sessionCountWeek = countUniqueSessions(allHistory.filter(h => new Date(h.created_at) >= weekAgo));

    document.getElementById('stat-total').textContent = sessionCount;
    document.getElementById('stat-week').textContent = sessionCountWeek;
    document.getElementById('stat-vol').innerHTML = Math.round(allHistory.reduce((a, h) => a + h.volume, 0)) + '<span class="stat-unit">kg</span>';
    document.getElementById('stat-exos').textContent = new Set(allHistory.map(h => h.exercise)).size;

    // Filter pills
    const exoSet = [...new Set(allHistory.map(h => h.exercise))];
    const fr = document.getElementById('history-filters'); fr.innerHTML = '';
    const ap = document.createElement('button');
    ap.className = 'filter-pill' + (historyFilter === 'all' ? ' active' : '');
    ap.textContent = 'Tout';
    ap.onclick = () => setHistoryFilter('all');
    fr.appendChild(ap);
    exoSet.forEach(ex => {
      const p = document.createElement('button');
      p.className = 'filter-pill' + (historyFilter === ex ? ' active' : '');
      p.textContent = ex;
      p.onclick = () => setHistoryFilter(ex);
      fr.appendChild(p);
    });

    renderGraph();
    renderHistoryList();
  } catch (e) {
    document.getElementById('history-list').innerHTML = '<div class="empty">Erreur : ' + e.message + '</div>';
  }
}

function setHistoryFilter(ex) {
  historyFilter = ex;
  document.querySelectorAll('.filter-pill').forEach(p =>
    p.classList.toggle('active', p.textContent === (ex === 'all' ? 'Tout' : ex))
  );
  document.getElementById('history-card-title').textContent = ex === 'all' ? 'Toutes les séances' : ex;
  renderGraph();
  renderHistoryList();
}

// ── GRAPH ─────────────────────────────────────────────────────────────────────
export function setGraphMetric(m) {
  graphMetric = m;
  document.querySelectorAll('.graph-metric-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.metric === m)
  );
  drawGraph();
}

export function setGraphPeriod(p) {
  graphPeriod = p;
  document.querySelectorAll('.graph-period-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.period === p)
  );
  drawGraph();
}

function renderGraph() {
  const container = document.getElementById('history-graph-card');
  if (!container) return;

  // Only show graph when a specific exercise is selected
  if (historyFilter === 'all') {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'block';

  container.innerHTML = `
    <div class="card-header" style="margin-bottom:10px;">
      <span class="card-title">Progression · ${historyFilter}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;">
      <div style="display:flex;gap:4px;">
        <button class="graph-metric-btn${graphMetric==='weight'?' active':''}" data-metric="weight"
          onclick="import('./js/history.js').then(m=>m.setGraphMetric('weight'))">Charge</button>
        <button class="graph-metric-btn${graphMetric==='volume'?' active':''}" data-metric="volume"
          onclick="import('./js/history.js').then(m=>m.setGraphMetric('volume'))">Volume</button>
      </div>
      <div style="display:flex;gap:4px;">
        <button class="graph-period-btn${graphPeriod==='1m'?' active':''}" data-period="1m"
          onclick="import('./js/history.js').then(m=>m.setGraphPeriod('1m'))">1M</button>
        <button class="graph-period-btn${graphPeriod==='3m'?' active':''}" data-period="3m"
          onclick="import('./js/history.js').then(m=>m.setGraphPeriod('3m'))">3M</button>
        <button class="graph-period-btn${graphPeriod==='6m'?' active':''}" data-period="6m"
          onclick="import('./js/history.js').then(m=>m.setGraphPeriod('6m'))">6M</button>
        <button class="graph-period-btn${graphPeriod==='all'?' active':''}" data-period="all"
          onclick="import('./js/history.js').then(m=>m.setGraphPeriod('all'))">Tout</button>
      </div>
    </div>
    <div id="graph-svg-container"></div>
    <div id="graph-stats-row" style="display:flex;gap:8px;margin-top:12px;"></div>`;

  drawGraph();
}

function drawGraph() {
  if (historyFilter === 'all') return;
  const container = document.getElementById('graph-svg-container');
  const statsRow  = document.getElementById('graph-stats-row');
  if (!container) return;

  // Filter by exercise and period
  const now = Date.now();
  const periodMs = { '1m': 30, '3m': 90, '6m': 180, 'all': 99999 };
  const days = periodMs[graphPeriod] || 90;
  const cutoff = now - days * 86400000;

  const rows = allHistory
    .filter(h => h.exercise === historyFilter && new Date(h.created_at).getTime() >= cutoff)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (rows.length < 2) {
    container.innerHTML = `<div class="empty" style="padding:24px 0 8px;font-size:12px;">Pas assez de données<br><span style="font-size:11px;color:var(--text3)">Il faut au moins 2 séances sur cette période</span></div>`;
    if (statsRow) statsRow.innerHTML = '';
    return;
  }

  const values = rows.map(r => graphMetric === 'weight' ? r.best_weight : Math.round(r.volume));
  const dates  = rows.map(r => new Date(r.created_at));
  const minV = Math.min(...values), maxV = Math.max(...values);
  const range = maxV - minV || 1;

  // SVG dimensions
  const W = 320, H = 120, PAD = { top: 12, right: 12, bottom: 28, left: 36 };
  const gW = W - PAD.left - PAD.right;
  const gH = H - PAD.top - PAD.bottom;

  const xScale = i => PAD.left + (i / (values.length - 1)) * gW;
  const yScale = v => PAD.top + gH - ((v - minV) / range) * gH;

  // Polyline points
  const pts = values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');

  // Area fill path
  const areaPath = `M${xScale(0)},${yScale(values[0])} ` +
    values.map((v, i) => `L${xScale(i)},${yScale(v)}`).join(' ') +
    ` L${xScale(values.length-1)},${PAD.top+gH} L${xScale(0)},${PAD.top+gH} Z`;

  // Y axis labels (3 ticks)
  const yTicks = [minV, minV + range/2, maxV].map(v => ({
    v: Math.round(v * 10) / 10,
    y: yScale(v)
  }));

  // X axis labels — first, middle, last
  const xLabels = [0, Math.floor((values.length-1)/2), values.length-1].map(i => ({
    x: xScale(i),
    label: dates[i].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }));

  // Dots for each point
  const dots = values.map((v, i) => `<circle cx="${xScale(i)}" cy="${yScale(v)}" r="3" fill="var(--accent)" stroke="var(--bg2)" stroke-width="1.5"/>`).join('');

  // PR dot (max value)
  const prIdx = values.indexOf(maxV);
  const prDot = `<circle cx="${xScale(prIdx)}" cy="${yScale(maxV)}" r="5" fill="var(--accent)" stroke="var(--bg2)" stroke-width="2"/>`;

  const unit = graphMetric === 'weight' ? 'kg' : 'kg vol';

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;overflow:visible;">
      <defs>
        <linearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      ${yTicks.map(t => `<line x1="${PAD.left}" y1="${t.y}" x2="${W-PAD.right}" y2="${t.y}" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3,3"/>`).join('')}

      <!-- Y labels -->
      ${yTicks.map(t => `<text x="${PAD.left - 4}" y="${t.y + 4}" text-anchor="end" font-size="9" fill="var(--text3)" font-family="DM Mono,monospace">${t.v}</text>`).join('')}

      <!-- X labels -->
      ${xLabels.map(l => `<text x="${l.x}" y="${H - 4}" text-anchor="middle" font-size="9" fill="var(--text3)" font-family="DM Mono,monospace">${l.label}</text>`).join('')}

      <!-- Area fill -->
      <path d="${areaPath}" fill="url(#graphGrad)"/>

      <!-- Line -->
      <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Dots -->
      ${dots}

      <!-- PR dot highlight -->
      ${prDot}

      <!-- PR label -->
      <text x="${xScale(prIdx)}" y="${yScale(maxV) - 10}" text-anchor="middle" font-size="9" fill="var(--accent)" font-family="DM Mono,monospace" font-weight="500">PR ${maxV}${unit}</text>
    </svg>`;

  // Stats row
  const first = values[0], last = values[values.length - 1];
  const diff = last - first;
  const diffStr = (diff >= 0 ? '+' : '') + Math.round(diff * 10) / 10;
  const diffColor = diff >= 0 ? 'var(--accent)' : 'var(--danger)';
  const pct = first > 0 ? Math.round(diff / first * 100) : 0;

  if (statsRow) statsRow.innerHTML = `
    ${graphStat('Record', maxV + (graphMetric === 'weight' ? ' kg' : ' kg'), 'var(--accent)')}
    ${graphStat('Progression', diffStr + (graphMetric === 'weight' ? ' kg' : ' kg'), diffColor)}
    ${graphStat('Évolution', (pct >= 0 ? '+' : '') + pct + '%', diffColor)}
    ${graphStat('Séances', rows.length, 'var(--text2)')}`;
}

function graphStat(label, value, color) {
  return `
    <div style="flex:1;background:var(--bg3);border-radius:var(--radius-sm);padding:8px 6px;text-align:center;">
      <div style="font-size:13px;font-weight:600;color:${color};font-family:'DM Mono',monospace;">${value}</div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
    </div>`;
}

// ── HISTORY LIST ──────────────────────────────────────────────────────────────
function renderHistoryList() {
  const filtered = historyFilter === 'all' ? allHistory : allHistory.filter(h => h.exercise === historyFilter);
  const list = document.getElementById('history-list');
  if (!filtered.length) { list.innerHTML = '<div class="empty"><span>🏋️</span>Aucune séance</div>'; return; }
  list.innerHTML = '';

  const groups = groupHistory(filtered);
  groups.slice(0, 30).forEach(group => {
    const first = group.rows[0];
    const d = new Date(first.created_at);
    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
      + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div'); div.className = 'hist-item';

    if (group.rows.length === 1) {
      const h = group.rows[0];
      const setsStr = h.sets.map(s => `${s.weight}×${s.reps}`).join(' · ');
      div.innerHTML = `
        <div class="hist-dot"></div>
        <div style="flex:1">
          <div class="hist-date">${dateStr}</div>
          <div class="hist-name">${h.exercise}</div>
          <div class="hist-detail">${setsStr} — ${Math.round(h.volume)}kg</div>
        </div>
        <button class="hist-del" onclick="import('./js/history.js').then(m=>m.deleteEntry('${h.id}',this))">✕</button>`;
    } else {
      const totalVol = group.rows.reduce((a, r) => a + r.volume, 0);
      const ids = group.rows.map(r => r.id).join(',');
      const exoLines = group.rows.map(r =>
        `<div style="font-size:12px;color:var(--text2);margin-top:2px;">
          <span style="color:var(--text)">${r.exercise}</span> — ${r.sets.map(s => `${s.weight}×${s.reps}`).join(' · ')}
        </div>`).join('');
      div.innerHTML = `
        <div class="hist-dot"></div>
        <div style="flex:1">
          <div class="hist-date">${dateStr}</div>
          <div class="hist-name">Programme · ${group.rows.length} exercices</div>
          <div class="hist-detail" style="margin-bottom:4px;">Volume total : ${Math.round(totalVol)}kg</div>
          ${exoLines}
        </div>
        <button class="hist-del" onclick="import('./js/history.js').then(m=>m.deleteGroupEntry('${ids}',this))">✕</button>`;
    }
    list.appendChild(div);
  });
}

export async function deleteEntry(id, btn) {
  btn.textContent = '...';
  try { await sbDelete('sessions', 'id=eq.' + id); await renderHistory(); }
  catch (e) { btn.textContent = '✕'; }
}

export async function deleteGroupEntry(ids, btn) {
  btn.textContent = '...';
  try {
    const idList = ids.split(',');
    await Promise.all(idList.map(id => sbDelete('sessions', 'id=eq.' + id)));
    await renderHistory();
  } catch (e) { btn.textContent = '✕'; }
}
