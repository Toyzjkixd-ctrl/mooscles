// ── PROGRAMMES ────────────────────────────────────────────────────────────────
import { _session, sbSelect, sbInsert, sbDelete, sbPatch } from './supabase.js';
import { exercises, DEF_EX } from './exercises.js';
import { isVintage } from './theme.js';
import { VINTAGE_LABELS, DEFAULT_LABELS } from './theme.js';
import { showTab, toast } from './main.js';

export let programmes = [];
export let activeSession = null;
export let builderBlocks = [];

let editProgId = null;
let editBuilderBlocks = [];
let changingExIdx = null;
let modalSelectedEx = '';
let _pendingImport = null;

// ── LOAD & RENDER LIST ────────────────────────────────────────────────────────
export async function loadProgrammes() {
  try {
    const d = await sbSelect('programmes', 'user_id=eq.' + _session.user.id + '&order=created_at');
    programmes = d || [];
  } catch (e) { programmes = []; }
}

export function renderProgrammesList() {
  const container = document.getElementById('programmes-list');
  container.innerHTML = '';
  if (!programmes.length) {
    container.innerHTML = '<div class="empty" style="padding:20px 0 24px"><span>📂</span>Crée ton premier programme ci-dessous</div>';
    return;
  }
  programmes.forEach(p => {
    const exos = p.blocks || [];
    const card = document.createElement('div');
    card.className = 'prog-card'; card.style.marginBottom = '12px';
    const exoHTML = exos.map(b =>
      `<div class="prog-exo-item"><div class="prog-exo-dot"></div>${b.exercise} — ${b.sets.length} série${b.sets.length > 1 ? 's' : ''} · ${b.sets[0]?.weight}kg×${b.sets[0]?.reps}</div>`
    ).join('');
    card.innerHTML = `
      <div class="prog-card-header">
        <div>
          <div class="prog-card-name">${p.name}</div>
          <div class="prog-card-meta">${exos.length} exercice${exos.length > 1 ? 's' : ''}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <button class="prog-del-btn" style="font-size:13px;color:var(--text2);border:0.5px solid var(--border);border-radius:6px;padding:4px 8px;"
            onclick="import('./js/programmes.js').then(m=>m.shareProgramme('${p.id}',event))">🔗</button>
          <button class="prog-del-btn" style="font-size:13px;color:var(--accent);border:0.5px solid var(--border2);border-radius:6px;padding:4px 8px;"
            onclick="import('./js/programmes.js').then(m=>m.openEditProgModal('${p.id}',event))">✏️</button>
          <button class="prog-del-btn"
            onclick="import('./js/programmes.js').then(m=>m.deleteProgramme('${p.id}',event))">✕</button>
        </div>
      </div>
      <div class="prog-exos-list">${exoHTML}</div>
      <button class="prog-launch-btn" onclick="import('./js/programmes.js').then(m=>m.launchProgramme('${p.id}'))">▶ Lancer ce programme</button>`;
    container.appendChild(card);
  });
}

// ── SHARE ─────────────────────────────────────────────────────────────────────
export async function shareProgramme(id, e) {
  e.stopPropagation();
  const p = programmes.find(x => x.id === id);
  if (!p) return;
  try {
    const d = await sbInsert('shared_programmes', { name: p.name, blocks: p.blocks });
    const url = location.origin + location.pathname + '#import=' + d[0].id;
    navigator.clipboard.writeText(url)
      .then(() => toast('Lien copié ! 🔗'))
      .catch(() => prompt('Copie ce lien :', url));
  } catch (e) { toast('Erreur partage : ' + e.message, true); }
}

export function closeImportModal() {
  document.getElementById('import-prog-modal').classList.add('hidden');
  _pendingImport = null;
  history.replaceState(null, '', location.pathname);
}

export async function confirmImport() {
  if (!_pendingImport) return;
  try {
    const d = await sbInsert('programmes', {
      user_id: _session.user.id,
      name: _pendingImport.name,
      blocks: _pendingImport.blocks
    });
    programmes.push(d[0]);
    renderProgrammesList();
    toast('Programme importé 💪');
  } catch (e) { toast('Erreur import : ' + e.message, true); }
  closeImportModal();
}

export async function checkShareHash() {
  const hash = location.hash;
  if (!hash.startsWith('#import=')) return;
  const shortId = hash.slice(8);
  try {
    const d = await sbSelect('shared_programmes', 'id=eq.' + shortId);
    if (!d || !d[0]) return;
    _pendingImport = d[0];
    const preview = document.getElementById('import-prog-preview');
    const exoList = d[0].blocks.map(b =>
      `<div class="prog-exo-item" style="margin:4px 0"><div class="prog-exo-dot"></div>${b.exercise} — ${b.sets.length} série${b.sets.length > 1 ? 's' : ''}</div>`
    ).join('');
    preview.innerHTML = `<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:8px">${d[0].name}</div>${exoList}`;
    document.getElementById('import-prog-modal').classList.remove('hidden');
  } catch (e) {}
}

// ── BUILDER (nouveau programme) ───────────────────────────────────────────────
export function addBuilderBlock() {
  builderBlocks.push({ exercise: DEF_EX[0], sets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 10 }, { weight: 60, reps: 10 }] });
  renderBuilderBlocks();
}

export function renderBuilderBlocks() {
  _renderBuilderInto('builder-blocks', builderBlocks, 'builderBlocks');
}

export function builderRemoveBlock(bi) { builderBlocks.splice(bi, 1); renderBuilderBlocks(); }
export function builderAddSet(bi) {
  const last = builderBlocks[bi].sets[builderBlocks[bi].sets.length - 1];
  builderBlocks[bi].sets.push({ weight: last ? last.weight : 60, reps: last ? last.reps : 10 });
  renderBuilderBlocks();
}
export function builderRemoveSet(bi, si) { builderBlocks[bi].sets.splice(si, 1); renderBuilderBlocks(); }

export async function saveNewProgramme() {
  const name = document.getElementById('new-prog-name').value.trim();
  if (!name) { toast('Donne un nom au programme !', true); return; }
  if (!builderBlocks.length) { toast('Ajoute au moins un exercice !', true); return; }
  if (builderBlocks.some(b => !b.sets.length)) { toast('Chaque exercice doit avoir au moins une série.', true); return; }
  try {
    const d = await sbInsert('programmes', { user_id: _session.user.id, name, blocks: builderBlocks });
    programmes.push(d[0]);
    builderBlocks.length = 0;
    document.getElementById('new-prog-name').value = '';
    renderBuilderBlocks();
    renderProgrammesList();
    toast('Programme sauvegardé !');
  } catch (e) { toast('Erreur : ' + e.message, true); }
}

export async function deleteProgramme(id, e) {
  e.stopPropagation();
  try {
    await sbDelete('programmes', 'id=eq.' + id);
    programmes = programmes.filter(p => p.id !== id);
    renderProgrammesList();
  } catch (e) { toast('Erreur suppression', true); }
}

// ── EDIT PROGRAMME MODAL ──────────────────────────────────────────────────────
export function openEditProgModal(id, e) {
  e.stopPropagation();
  const p = programmes.find(x => x.id === id); if (!p) return;
  editProgId = id;
  editBuilderBlocks = (p.blocks || []).map(b => ({ exercise: b.exercise, sets: b.sets.map(s => ({ ...s })) }));
  document.getElementById('edit-prog-name').value = p.name;
  renderEditBuilderBlocks();
  document.getElementById('edit-prog-modal').classList.remove('hidden');
}

export function closeEditProgModal() {
  document.getElementById('edit-prog-modal').classList.add('hidden');
  editProgId = null; editBuilderBlocks = [];
}

function renderEditBuilderBlocks() {
  _renderBuilderInto('edit-builder-blocks', editBuilderBlocks, 'editBuilderBlocks');
}

export function addEditBuilderBlock() {
  editBuilderBlocks.push({ exercise: DEF_EX[0], sets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 10 }, { weight: 60, reps: 10 }] });
  renderEditBuilderBlocks();
}
export function editBuilderRemoveBlock(bi) { editBuilderBlocks.splice(bi, 1); renderEditBuilderBlocks(); }
export function editBuilderAddSet(bi) {
  const last = editBuilderBlocks[bi].sets[editBuilderBlocks[bi].sets.length - 1];
  editBuilderBlocks[bi].sets.push({ weight: last ? last.weight : 60, reps: last ? last.reps : 10 });
  renderEditBuilderBlocks();
}
export function editBuilderRemoveSet(bi, si) { editBuilderBlocks[bi].sets.splice(si, 1); renderEditBuilderBlocks(); }

export async function saveEditProgramme() {
  const name = document.getElementById('edit-prog-name').value.trim();
  if (!name) { toast('Donne un nom au programme !', true); return; }
  if (!editBuilderBlocks.length) { toast('Ajoute au moins un exercice !', true); return; }
  if (editBuilderBlocks.some(b => !b.sets.length)) { toast('Chaque exercice doit avoir au moins une série.', true); return; }
  try {
    const updated = await sbPatch('programmes', 'id=eq.' + editProgId, { name, blocks: editBuilderBlocks });
    const idx = programmes.findIndex(p => p.id === editProgId);
    if (idx >= 0) programmes[idx] = updated[0];
    closeEditProgModal();
    renderProgrammesList();
    toast('Programme mis à jour ✓');
  } catch (e) { toast('Erreur : ' + e.message, true); }
}

// ── SHARED BUILDER RENDERER ───────────────────────────────────────────────────
// Used by both new-programme builder and edit modal.
// `varName` is the JS variable name used in inline onchange handlers (still needed
// since we can't use ES module refs in inline HTML event attributes easily).
function _renderBuilderInto(containerId, blocks, varName) {
  const c = document.getElementById(containerId); c.innerHTML = '';
  blocks.forEach((b, bi) => {
    const div = document.createElement('div'); div.className = 'builder-exo-block';
    const setsHTML = b.sets.map((s, si) => `
      <tr><td>S${si + 1}</td>
        <td><input type="number" value="${s.weight}" min="0" step="0.5" inputmode="decimal"
          onchange="import('./js/programmes.js').then(m=>{m.${varName}[${bi}].sets[${si}].weight=+this.value})"></td>
        <td><input type="number" value="${s.reps}" min="1" step="1" inputmode="numeric"
          onchange="import('./js/programmes.js').then(m=>{m.${varName}[${bi}].sets[${si}].reps=+this.value})"></td>
        <td><button class="prog-del-btn" style="font-size:13px"
          onclick="import('./js/programmes.js').then(m=>m.${varName === 'builderBlocks' ? 'builderRemoveSet' : 'editBuilderRemoveSet'}(${bi},${si}))">✕</button></td>
      </tr>`).join('');
    const exoOptions = exercises.map(ex => `<option value="${ex}" ${b.exercise === ex ? 'selected' : ''}>${ex}</option>`).join('');
    const addSetFn = varName === 'builderBlocks' ? 'builderAddSet' : 'editBuilderAddSet';
    const removeBlockFn = varName === 'builderBlocks' ? 'builderRemoveBlock' : 'editBuilderRemoveBlock';
    div.innerHTML = `
      <div class="builder-exo-header">
        <select style="background:var(--bg2);border:0.5px solid var(--border2);color:var(--text);font-size:13px;padding:6px 10px;border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;flex:1"
          onchange="import('./js/programmes.js').then(m=>{m.${varName}[${bi}].exercise=this.value})">${exoOptions}</select>
        <button class="prog-del-btn" onclick="import('./js/programmes.js').then(m=>m.${removeBlockFn}(${bi}))">✕</button>
      </div>
      <table class="sets-table">
        <thead><tr><th>#</th><th>Poids kg</th><th>Reps</th><th></th></tr></thead>
        <tbody>${setsHTML}</tbody>
      </table>
      <button class="add-set-btn" style="margin-top:8px"
        onclick="import('./js/programmes.js').then(m=>m.${addSetFn}(${bi}))">+ Série</button>`;
    c.appendChild(div);
  });
}

// ── ACTIVE SESSION ────────────────────────────────────────────────────────────
export function launchProgramme(id) {
  const p = programmes.find(x => x.id === id); if (!p) return;
  activeSession = {
    progName: p.name,
    blocks: (p.blocks || []).map(b => ({ exercise: b.exercise, sets: b.sets.map(s => ({ ...s, done: false })) }))
  };
  renderActiveSession();
  document.getElementById('active-session-container').style.display = 'block';
  document.getElementById('programmes-list-container').style.display = 'none';
  showTab('programmes');
}

export function renderActiveSession() {
  if (!activeSession) return;
  document.getElementById('active-session-name').textContent = '📂 ' + activeSession.progName;
  const total = activeSession.blocks.reduce((a, b) => a + b.sets.length, 0);
  const done = activeSession.blocks.reduce((a, b) => a + b.sets.filter(s => s.done).length, 0);
  document.getElementById('active-session-progress').textContent = `${done}/${total} séries complétées`;
  const c = document.getElementById('active-session-blocks'); c.innerHTML = '';
  activeSession.blocks.forEach((b, bi) => {
    const div = document.createElement('div'); div.className = 'session-exo-block';
    const setsHTML = b.sets.map((s, si) => `
      <tr><td>S${si + 1}</td>
        <td><input type="number" value="${s.weight}" min="0" step="0.5" inputmode="decimal"
          onchange="import('./js/programmes.js').then(m=>{m.activeSession.blocks[${bi}].sets[${si}].weight=+this.value;m.renderActiveSession()})"></td>
        <td><input type="number" value="${s.reps}" min="1" step="1" inputmode="numeric"
          onchange="import('./js/programmes.js').then(m=>{m.activeSession.blocks[${bi}].sets[${si}].reps=+this.value;m.renderActiveSession()})"></td>
        <td><button class="check-btn${s.done ? ' done' : ''}"
          onclick="import('./js/programmes.js').then(m=>m.toggleActiveSet(${bi},${si}))">✓</button></td>
      </tr>`).join('');
    div.innerHTML = `
      <div class="session-exo-header">
        <span class="session-exo-name">${b.exercise}</span>
        <button class="session-exo-change" onclick="import('./js/programmes.js').then(m=>m.openChangeEx(${bi}))">Changer →</button>
      </div>
      <table class="sets-table">
        <thead><tr><th>#</th><th>Poids kg</th><th>Reps</th><th>✓</th></tr></thead>
        <tbody>${setsHTML}</tbody>
      </table>`;
    c.appendChild(div);
  });
}

export function toggleActiveSet(bi, si) {
  activeSession.blocks[bi].sets[si].done = !activeSession.blocks[bi].sets[si].done;
  renderActiveSession();
}

export function cancelActiveSession() {
  if (!confirm('Annuler la séance en cours ?')) return;
  activeSession = null;
  document.getElementById('active-session-container').style.display = 'none';
  document.getElementById('programmes-list-container').style.display = 'block';
}

export async function finishActiveSession() {
  if (!activeSession) return;
  const allDone = activeSession.blocks.every(b => b.sets.some(s => s.done));
  if (!allDone && !confirm('Certaines séries ne sont pas cochées. Valider quand même ?')) return;
  const btn = document.getElementById('finish-active-btn');
  btn.disabled = true; btn.textContent = 'Enregistrement...';
  try {
    await Promise.all(activeSession.blocks.map(b => {
      const vol = b.sets.reduce((a, s) => a + s.weight * s.reps, 0);
      const best = Math.max(...b.sets.map(s => s.weight));
      return sbInsert('sessions', { user_id: _session.user.id, exercise: b.exercise, sets: b.sets, volume: vol, best_weight: best });
    }));
    activeSession = null;
    document.getElementById('active-session-container').style.display = 'none';
    document.getElementById('programmes-list-container').style.display = 'block';
    toast('Séance complète enregistrée 💪');
  } catch (e) { toast('Erreur : ' + e.message, true); }
  btn.disabled = false;
  btn.textContent = isVintage() ? VINTAGE_LABELS.finishActiveBtn : DEFAULT_LABELS.finishActiveBtn;
}

// ── CHANGE EXERCISE MODAL ─────────────────────────────────────────────────────
export function openChangeEx(bi) {
  changingExIdx = bi;
  modalSelectedEx = activeSession.blocks[bi].exercise;
  const g = document.getElementById('modal-ex-grid'); g.innerHTML = '';
  exercises.forEach(ex => {
    const b = document.createElement('button');
    b.className = 'ex-pill' + (modalSelectedEx === ex ? ' selected' : '');
    b.textContent = ex;
    b.onclick = () => {
      modalSelectedEx = ex;
      g.querySelectorAll('.ex-pill').forEach(p => p.classList.remove('selected'));
      b.classList.add('selected');
    };
    g.appendChild(b);
  });
  document.getElementById('modal-custom-ex').value = '';
  document.getElementById('change-ex-modal').classList.remove('hidden');
}

export function confirmChangeEx() {
  const custom = document.getElementById('modal-custom-ex').value.trim();
  const newEx = custom || modalSelectedEx;
  if (!newEx) { closeExModal(); return; }
  if (custom && !exercises.includes(custom)) exercises.push(custom);
  activeSession.blocks[changingExIdx].exercise = newEx;
  closeExModal();
  renderActiveSession();
}

export function closeExModal() {
  document.getElementById('change-ex-modal').classList.add('hidden');
  changingExIdx = null;
}
