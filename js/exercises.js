// ── EXERCISES ─────────────────────────────────────────────────────────────────
import { _session, sbSelect, sbInsert, sbDelete } from './supabase.js';
import { toast } from './main.js';
import { updateSummary } from './seance.js';

export const DEF_EX = [
  'Développé couché', 'Squat', 'Soulevé de terre', 'Développé épaules',
  'Tractions', 'Rowing barre', 'Curl biceps', 'Extension triceps'
];

export let exercises = [...DEF_EX];
export let selectedEx = '';

export function setSelectedEx(v) {
  selectedEx = v;
  const el = document.getElementById('selected-ex-name');
  if (el) el.textContent = v || '—';
}

export function resetExercises() {
  exercises = [...DEF_EX];
}

export async function loadExercises() {
  try {
    const d = await sbSelect('exercises', 'user_id=eq.' + _session.user.id + '&order=created_at');
    const custom = d.map(e => e.name).filter(n => !DEF_EX.includes(n));
    exercises = [...DEF_EX, ...custom];
  } catch (e) {}
}

export function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function renderExGrid() {
  const search = normalize(document.getElementById('ex-search')?.value || '');
  const filtered = exercises.filter(ex => !search || normalize(ex).includes(search));
  const useDropdown = exercises.length >= 15;

  const pillContainer = document.getElementById('ex-grid-all');
  const dropSection = document.getElementById('ex-dropdown-section');
  const dropList = document.getElementById('ex-dropdown-list');
  if (!pillContainer) return;

  if (useDropdown) {
    pillContainer.style.display = 'none';
    dropSection.style.display = 'block';
    dropList.innerHTML = '';
    if (!filtered.length) {
      dropList.innerHTML = '<div style="padding:12px 14px;font-size:13px;color:var(--text3);">Aucun exercice trouvé</div>';
    } else {
      filtered.forEach(ex => {
        const isCustom = !DEF_EX.includes(ex);
        const row = document.createElement('div');
        row.className = 'ex-dropdown-item' + (selectedEx === ex ? ' selected' : '');
        const label = document.createElement('span');
        label.className = 'ex-dropdown-label'; label.textContent = ex;
        row.addEventListener('click', () => { setSelectedEx(ex); renderExGrid(); updateSummary(); });
        row.appendChild(label);
        if (isCustom) {
          const del = document.createElement('button');
          del.className = 'ex-dropdown-del'; del.textContent = '✕'; del.title = 'Supprimer';
          del.addEventListener('click', e => { e.stopPropagation(); deleteCustomEx(ex); });
          row.appendChild(del);
        }
        dropList.appendChild(row);
      });
    }
  } else {
    dropSection.style.display = 'none';
    pillContainer.style.display = 'flex';
    pillContainer.innerHTML = '';
    filtered.forEach(ex => {
      const isCustom = !DEF_EX.includes(ex);
      if (isCustom) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;display:inline-block;';
        const b = document.createElement('button');
        b.className = 'ex-pill' + (selectedEx === ex ? ' selected' : '');
        b.textContent = ex;
        b.onclick = () => { setSelectedEx(ex); renderExGrid(); updateSummary(); };
        const del = document.createElement('button');
        del.textContent = '✕'; del.title = 'Supprimer';
        del.style.cssText = 'position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:var(--danger);border:none;color:#fff;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;z-index:1;';
        del.onclick = e => { e.stopPropagation(); deleteCustomEx(ex); };
        wrap.appendChild(b); wrap.appendChild(del); pillContainer.appendChild(wrap);
      } else {
        const b = document.createElement('button');
        b.className = 'ex-pill' + (selectedEx === ex ? ' selected' : '');
        b.textContent = ex;
        b.onclick = () => { setSelectedEx(ex); renderExGrid(); updateSummary(); };
        pillContainer.appendChild(b);
      }
    });
  }
}

export async function addCustomEx() {
  const inp = document.getElementById('custom-input');
  const v = inp.value.trim();
  if (!v) return;
  if (!exercises.includes(v)) {
    exercises.push(v);
    try { await sbInsert('exercises', { user_id: _session.user.id, name: v }); } catch (e) {}
  }
  setSelectedEx(v);
  inp.value = '';
  renderExGrid();
}

export async function deleteCustomEx(ex) {
  if (!confirm('Supprimer "' + ex + '" de ta liste ?')) return;
  try {
    await sbDelete('exercises', 'user_id=eq.' + _session.user.id + '&name=eq.' + encodeURIComponent(ex));
    exercises = exercises.filter(e => e !== ex);
    if (selectedEx === ex) setSelectedEx('');
    renderExGrid();
    toast('Exercice supprimé');
  } catch (e) { toast('Erreur suppression', true); }
}
