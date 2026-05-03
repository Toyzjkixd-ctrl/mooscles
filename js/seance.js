// ── SÉANCE LIBRE ──────────────────────────────────────────────────────────────
import { _session, sbInsert } from './supabase.js';
import { selectedEx, setSelectedEx, renderExGrid } from './exercises.js';
import { isVintage } from './theme.js';
import { VINTAGE_LABELS, DEFAULT_LABELS } from './theme.js';
import { toast } from './main.js';

export let sets = [];
let restSecs = 0, restRunning = false, restInterval = null;

// ── SETS ──────────────────────────────────────────────────────────────────────
export function addSet() {
  const last = sets[sets.length - 1];
  sets.push({ weight: last ? last.weight : 60, reps: last ? last.reps : 10, done: false });
  renderSets();
}

export function renderSets() {
  const body = document.getElementById('sets-body');
  body.innerHTML = '';
  sets.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>S${i + 1}</td>
      <td><input type="number" value="${s.weight}" min="0" step="0.5" inputmode="decimal"
        onchange="(v=>import('./js/seance.js').then(m=>{m.sets[${i}].weight=+v;m.updateSummary();}))(this.value)"></td>
      <td><input type="number" value="${s.reps}" min="1" step="1" inputmode="numeric"
        onchange="(v=>import('./js/seance.js').then(m=>{m.sets[${i}].reps=+v;m.updateSummary();}))(this.value)"></td>
      <td><button class="check-btn${s.done ? ' done' : ''}" onclick="import('./js/seance.js').then(m=>m.toggleSet(${i}))">✓</button></td>`;
    body.appendChild(tr);
  });
  updateSummary();
}

export function toggleSet(i) { sets[i].done = !sets[i].done; renderSets(); }

export function updateSummary() {
  const done = sets.filter(s => s.done).length;
  const vol = sets.filter(s => s.done).reduce((a, s) => a + s.weight * s.reps, 0);
  document.getElementById('sets-summary').textContent =
    sets.length ? `${done}/${sets.length} · ${vol.toFixed(0)}kg` : '';
}

// ── REST TIMER ────────────────────────────────────────────────────────────────
export function toggleRest() { restRunning ? stopRest() : startRest(); }

export function startRest() {
  restRunning = true;
  document.getElementById('rest-play').textContent = '⏸';
  document.getElementById('rest-play').classList.add('running');
  document.getElementById('rest-display').classList.add('running');
  restInterval = setInterval(() => {
    restSecs++;
    const m = Math.floor(restSecs / 60), s = restSecs % 60;
    document.getElementById('rest-display').textContent = m + ':' + (s < 10 ? '0' : '') + s;
  }, 1000);
}

export function stopRest() {
  clearInterval(restInterval);
  restRunning = false;
  document.getElementById('rest-play').textContent = '▶';
  document.getElementById('rest-play').classList.remove('running');
  document.getElementById('rest-display').classList.remove('running');
}

export function resetRest() {
  stopRest();
  restSecs = 0;
  document.getElementById('rest-display').textContent = '0:00';
}

// ── SAVE ──────────────────────────────────────────────────────────────────────
export async function finishSeance() {
  if (!selectedEx) { toast('Sélectionne un exercice !', true); return; }
  if (!sets.length) { toast('Ajoute au moins une série !', true); return; }
  const btn = document.getElementById('finish-btn');
  btn.disabled = true; btn.textContent = 'Enregistrement...';
  const vol = sets.reduce((a, s) => a + s.weight * s.reps, 0);
  const best = Math.max(...sets.map(s => s.weight));
  try {
    await sbInsert('sessions', {
      user_id: _session.user.id,
      exercise: selectedEx,
      sets: sets.map(s => ({ ...s })),
      volume: vol,
      best_weight: best
    });
    sets.length = 0;
    setSelectedEx('');
    renderExGrid();
    renderSets();
    resetRest();
    toast(isVintage() ? 'Performance consignée 💪' : 'Séance enregistrée 💪');
  } catch (e) { toast('Erreur : ' + e.message, true); }
  btn.disabled = false;
  btn.textContent = isVintage() ? VINTAGE_LABELS.finishBtn : DEFAULT_LABELS.finishBtn;
}
