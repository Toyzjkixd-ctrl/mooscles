// ── MAIN — init, nav, toast ───────────────────────────────────────────────────
import { _session, setSession } from './supabase.js';
import { loadSession, saveSession, clearSession, scheduleRefresh, refreshToken, loadProfile, currentUsername, showAuthScreen } from './auth.js';
import { applyStoredTheme } from './theme.js';
import { loadExercises, renderExGrid, resetExercises } from './exercises.js';
import { addSet } from './seance.js';
import { loadProgrammes, renderProgrammesList, activeSession, renderActiveSession, checkShareHash } from './programmes.js';
import { renderHistory } from './history.js';
import { renderRecords } from './records.js';
import { loadNutrition, renderNutrition } from './nutrition.js';

// ── TOAST ─────────────────────────────────────────────────────────────────────
export function toast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── NAV ───────────────────────────────────────────────────────────────────────
export function showTab(t) {
  document.querySelectorAll('.content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + t).classList.remove('hidden');
  document.getElementById('nav-' + t).classList.add('active');
  if (t === 'historique') renderHistory();
  if (t === 'records') renderRecords();
  if (t === 'nutrition') renderNutrition();
  if (t === 'programmes') {
    renderProgrammesList();
    if (activeSession) {
      document.getElementById('active-session-container').style.display = 'block';
      document.getElementById('programmes-list-container').style.display = 'none';
      renderActiveSession();
    } else {
      document.getElementById('active-session-container').style.display = 'none';
      document.getElementById('programmes-list-container').style.display = 'block';
    }
  }
}

// ── APP INIT ──────────────────────────────────────────────────────────────────
export async function initApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'flex';
  const vintage = document.body.classList.contains('vintage');
  document.getElementById('header-user').textContent = vintage ? currentUsername + ' · adhérent' : currentUsername;
  document.getElementById('profil-name').textContent = currentUsername;
  document.getElementById('profil-email').textContent = _session.user.email;
  document.getElementById('seance-date').textContent = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  resetExercises();
  await Promise.all([loadExercises(), loadProgrammes()]);
  renderExGrid();
  renderProgrammesList();
  // Ensure at least one set row on the free session tab
  const { sets } = await import('./seance.js');
  if (sets.length === 0) addSet();
  // Pre-load nutrition in background
  loadNutrition();
  checkShareHash();
  import('./spotify.js').then(m => m.initSpotify());
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('auth-screen').style.display !== 'none') {
    import('./auth.js').then(m => m.handleAuth());
  }
});

(async () => {
  applyStoredTheme();
  const saved = loadSession();
  if (saved?.access_token && saved.expires_at * 1000 > Date.now()) {
    setSession(saved);
    scheduleRefresh(saved.expires_at);
    await loadProfile();
    await initApp();
  } else if (saved?.refresh_token) {
    setSession(saved);
    await refreshToken();
    if (_session?.access_token) {
      await loadProfile();
      await initApp();
    }
  }
})();
