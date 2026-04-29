// ── HISTORY ───────────────────────────────────────────────────────────────────
import { _session, sbSelect, sbDelete } from './supabase.js';

let historyFilter = 'all';
let allHistory = [];

export async function renderHistory() {
  document.getElementById('history-list').innerHTML = '<div class="loading">Chargement...</div>';
  try {
    allHistory = await sbSelect('sessions', 'user_id=eq.' + _session.user.id + '&order=created_at.desc&limit=100');
    const now = new Date(), weekAgo = new Date(now - 7 * 86400000);
    document.getElementById('stat-total').textContent = allHistory.length;
    document.getElementById('stat-week').textContent = allHistory.filter(h => new Date(h.created_at) >= weekAgo).length;
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

function renderHistoryList() {
  const filtered = historyFilter === 'all' ? allHistory : allHistory.filter(h => h.exercise === historyFilter);
  const list = document.getElementById('history-list');
  if (!filtered.length) { list.innerHTML = '<div class="empty"><span>🏋️</span>Aucune séance</div>'; return; }
  list.innerHTML = '';
  filtered.slice(0, 30).forEach(h => {
    const d = new Date(h.created_at);
    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
      + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const setsStr = h.sets.map(s => `${s.weight}×${s.reps}`).join(' · ');
    const div = document.createElement('div'); div.className = 'hist-item';
    div.innerHTML = `
      <div class="hist-dot"></div>
      <div style="flex:1">
        <div class="hist-date">${dateStr}</div>
        <div class="hist-name">${h.exercise}</div>
        <div class="hist-detail">${setsStr} — ${Math.round(h.volume)}kg</div>
      </div>
      <button class="hist-del" onclick="import('./js/history.js').then(m=>m.deleteEntry('${h.id}',this))">✕</button>`;
    list.appendChild(div);
  });
}

export async function deleteEntry(id, btn) {
  btn.textContent = '...';
  try { await sbDelete('sessions', 'id=eq.' + id); await renderHistory(); }
  catch (e) { btn.textContent = '✕'; }
}
