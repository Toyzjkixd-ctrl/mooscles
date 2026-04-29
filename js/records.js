// ── RECORDS ───────────────────────────────────────────────────────────────────
import { _session, sbSelect } from './supabase.js';

export async function renderRecords() {
  document.getElementById('records-list').innerHTML = '<div class="loading">Chargement...</div>';
  try {
    const [sessions, profiles] = await Promise.all([
      sbSelect('sessions', 'select=exercise,best_weight,user_id&order=best_weight.desc'),
      sbSelect('profiles', 'select=id,username')
    ]);
    const um = {}; profiles.forEach(p => um[p.id] = p.username);
    const byEx = {};
    sessions.forEach(s => {
      if (!byEx[s.exercise]) byEx[s.exercise] = {};
      if (!byEx[s.exercise][s.user_id] || s.best_weight > byEx[s.exercise][s.user_id])
        byEx[s.exercise][s.user_id] = s.best_weight;
    });
    const container = document.getElementById('records-list'); container.innerHTML = '';
    const exos = Object.keys(byEx).sort((a, b) =>
      Math.max(...Object.values(byEx[b])) - Math.max(...Object.values(byEx[a]))
    );
    if (!exos.length) {
      container.innerHTML = '<div class="empty"><span>🏆</span>Aucun record pour l\'instant</div>';
      return;
    }
    const ranks = ['🥇', '🥈', '🥉'], rCls = ['gold', 'silver', 'bronze'];
    exos.forEach(ex => {
      const ub = Object.entries(byEx[ex]).sort((a, b) => b[1] - a[1]), maxW = ub[0][1];
      const card = document.createElement('div'); card.className = 'card record-card';
      let html = `<div class="record-ex-title">${ex} <span>${ub.length} participant${ub.length > 1 ? 's' : ''}</span></div>`;
      ub.forEach(([uid, w], i) => {
        const uname = um[uid] || 'Inconnu', isMe = uid === _session.user.id;
        const pct = Math.round(w / maxW * 100);
        html += `
          <div class="record-row">
            <div class="record-rank ${i < 3 ? rCls[i] : ''}">${i < 3 ? ranks[i] : (i + 1) + '.'}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:baseline">
                <span class="record-user${isMe ? ' me' : ''}">${uname}${isMe ? ' (toi)' : ''}</span>
                <span class="record-weight">${w} kg</span>
              </div>
              <div class="record-bar-bg"><div class="record-bar" style="width:${pct}%"></div></div>
            </div>
          </div>`;
      });
      card.innerHTML = html; container.appendChild(card);
    });
  } catch (e) {
    document.getElementById('records-list').innerHTML = '<div class="empty">Erreur : ' + e.message + '</div>';
  }
}
