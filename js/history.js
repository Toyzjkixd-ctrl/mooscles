// ── HISTORY ───────────────────────────────────────────────────────────────────
import { _session, sbSelect, sbDelete } from './supabase.js';

let historyFilter = 'all';
let allHistory = [];

// Groups rows into real sessions: by session_group_id if set,
// or by collapsing rows within a 60-second window.
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

export async function renderHistory() {
  document.getElementById('history-list').innerHTML = '<div class="loading">Chargement...</div>';
  try {
    allHistory = await sbSelect('sessions', 'user_id=eq.' + _session.user.id + '&order=created_at.desc&limit=100');
    const now = new Date(), weekAgo = new Date(now - 7 * 86400000);

    // Count real sessions: group by session_group_id if present,
    // fall back to grouping rows within a 60-second window.
    const sessionCount = countUniqueSessions(allHistory);
    const sessionCountWeek = countUniqueSessions(allHistory.filter(h => new Date(h.created_at) >= weekAgo));

    document.getElementById('stat-total').textContent = sessionCount;
    document.getElementById('stat-week').textContent = sessionCountWeek;
    document.getElementById('stat-vol').innerHTML = Math.round(allHistory.reduce((a, h) => a + h.volume, 0)) + '<span class="stat-unit">kg</span>';
    document.getElementById('stat-exos').textContent = new Set(allHistory.map(h => h.exercise)).size;

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
  renderHistoryList();
}

function groupHistory(rows) {
  // Group rows belonging to the same real session together.
  const groups = [];
  const sorted = [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const seen = new Map(); // groupKey -> index in groups[]

  sorted.forEach(row => {
    let key;
    if (row.session_group_id) {
      key = row.session_group_id;
    } else {
      // Bucket by minute (fallback for old rows without group id)
      key = 'ts_' + Math.floor(new Date(row.created_at).getTime() / 60000);
    }
    if (!seen.has(key)) {
      seen.set(key, groups.length);
      groups.push({ key, rows: [] });
    }
    groups[seen.get(key)].rows.push(row);
  });
  return groups;
}

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
      // Single exercise session — original display
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
      // Programme session — show all exercises grouped
      const totalVol = group.rows.reduce((a, r) => a + r.volume, 0);
      const ids = group.rows.map(r => r.id).join(',');
      const exoLines = group.rows.map(r =>
        `<div style="font-size:12px;color:var(--text2);margin-top:2px;">
          <span style="color:var(--text)">${r.exercise}</span> — ${r.sets.map(s => `${s.weight}×${s.reps}`).join(' · ')}
        </div>`
      ).join('');
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
