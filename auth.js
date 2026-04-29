// ── AUTH & SESSION ────────────────────────────────────────────────────────────
import { SUPABASE_URL, SUPABASE_KEY, _session, setSession, sbSelect, sbUpsert } from './supabase.js';
import { initApp } from './main.js';

export let currentUsername = '';
export function setCurrentUsername(v) { currentUsername = v; }

let _refreshTimer = null;

export function scheduleRefresh(exp) {
  if (_refreshTimer) clearTimeout(_refreshTimer);
  const ms = exp * 1000 - Date.now() - 60000;
  _refreshTimer = setTimeout(refreshToken, ms > 0 ? ms : 0);
}

export async function refreshToken() {
  if (!_session?.refresh_token) return;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ refresh_token: _session.refresh_token })
    });
    if (!r.ok) { clearSession(); showAuthScreen(); return; }
    const d = await r.json();
    setSession(d);
    saveSession(d);
    scheduleRefresh(d.expires_at);
  } catch (e) {}
}

export function saveSession(s) {
  try { localStorage.setItem('sb_s', JSON.stringify(s)); } catch (e) {}
}

export function loadSession() {
  try { return JSON.parse(localStorage.getItem('sb_s')); } catch (e) { return null; }
}

export function clearSession() {
  setSession(null);
  if (_refreshTimer) clearTimeout(_refreshTimer);
  try { localStorage.removeItem('sb_s'); } catch (e) {}
}

export function showAuthScreen() {
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

// ── AUTH FORM ─────────────────────────────────────────────────────────────────
let authMode = 'login';

export function switchAuthTab(m) {
  authMode = m;
  document.querySelectorAll('.auth-tab').forEach((t, i) =>
    t.classList.toggle('active', (i === 0 && m === 'login') || (i === 1 && m === 'signup'))
  );
  document.getElementById('auth-submit').textContent = m === 'login' ? 'Se connecter' : "S'inscrire";
  document.getElementById('username-field').style.display = m === 'signup' ? 'flex' : 'none';
  document.getElementById('auth-error').style.display = 'none';
}

export async function handleAuth() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const username = document.getElementById('auth-username').value.trim();
  const btn = document.getElementById('auth-submit');
  if (!email || !password) { showAuthError('Remplis tous les champs.'); return; }
  if (authMode === 'signup' && !username) { showAuthError('Choisis un pseudo.'); return; }
  if (authMode === 'signup' && username.length < 3) { showAuthError('Pseudo trop court (3 min).'); return; }
  btn.disabled = true; btn.textContent = '...';
  try {
    if (authMode === 'login') {
      const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ email, password })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error_description || d.msg || 'Erreur');
      setSession(d); saveSession(d); scheduleRefresh(d.expires_at);
      await loadProfile(); await initApp();
    } else {
      const r = await fetch(SUPABASE_URL + '/auth/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ email, password })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error_description || d.msg || 'Erreur');
      if (d.access_token) {
        setSession(d); saveSession(d); scheduleRefresh(d.expires_at);
        try { await sbUpsert('profiles', { id: d.user.id, username }, 'id'); } catch (e) {}
        currentUsername = username;
        await initApp();
      } else {
        showAuthError('Vérifie tes emails pour confirmer ton compte.');
      }
    }
  } catch (e) { showAuthError(e.message); }
  btn.disabled = false;
  btn.textContent = authMode === 'login' ? 'Se connecter' : "S'inscrire";
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg; el.style.display = 'block';
}

export async function loadProfile() {
  try {
    const d = await sbSelect('profiles', 'id=eq.' + _session.user.id + '&select=username');
    currentUsername = (d && d[0]) ? d[0].username : _session.user.email.split('@')[0];
  } catch (e) {
    currentUsername = _session.user.email.split('@')[0];
  }
}

export async function logout() {
  clearSession();
  currentUsername = '';
  showAuthScreen();
}

// ── PROFIL ACTIONS ────────────────────────────────────────────────────────────
import { sbUpsert as _upsert, sbAuthPut } from './supabase.js';
import { isVintage } from './theme.js';

export async function changeUsername() {
  const nu = document.getElementById('new-username').value.trim();
  if (!nu) { showMsg('username-msg', 'Saisis un pseudo.', false); return; }
  if (nu.length < 3) { showMsg('username-msg', 'Minimum 3 caractères.', false); return; }
  try {
    await sbUpsert('profiles', { id: _session.user.id, username: nu }, 'id');
    currentUsername = nu;
    document.getElementById('header-user').textContent = isVintage() ? nu + ' · adhérent' : nu;
    document.getElementById('profil-name').textContent = nu;
    document.getElementById('new-username').value = '';
    showMsg('username-msg', '✓ Pseudo mis à jour !', true);
  } catch (e) {
    showMsg('username-msg', e.message.includes('unique') ? 'Ce pseudo est déjà pris.' : e.message, false);
  }
}

export async function changePassword() {
  const np = document.getElementById('new-password').value;
  const cp = document.getElementById('confirm-password').value;
  if (!np || !cp) { showMsg('pwd-msg', 'Remplis les deux champs.', false); return; }
  if (np !== cp) { showMsg('pwd-msg', 'Les mots de passe ne correspondent pas.', false); return; }
  if (np.length < 6) { showMsg('pwd-msg', 'Minimum 6 caractères.', false); return; }
  try {
    await sbAuthPut({ password: np });
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    showMsg('pwd-msg', '✓ Mot de passe mis à jour !', true);
  } catch (e) { showMsg('pwd-msg', e.message, false); }
}

export function showMsg(id, msg, ok) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.color = ok ? 'var(--accent)' : 'var(--danger)';
  el.style.background = ok ? 'var(--accent-dim)' : 'var(--danger-dim)';
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);
}
