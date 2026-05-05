// ── SUPABASE CLIENT ───────────────────────────────────────────────────────────
export const SUPABASE_URL = 'https://wzwzmnuwvxvkbzantuxg.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6d3ptbnV3dnh2a2J6YW50dXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTU4OTksImV4cCI6MjA5Mjk3MTg5OX0.U-zWJRVaWkRHyELv8mIEsttLVElz1se4HFt2FS5lP8w';

export let _session = null;

export function setSession(s) { _session = s; }

export function hdrs(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + (_session?.access_token || SUPABASE_KEY),
    ...extra
  };
}

// ── TOKEN REFRESH PROACTIF ────────────────────────────────────────────────────
// Appelé avant chaque requête : si le token expire dans moins de 2 min, on le
// rafraîchit immédiatement. Protège contre la suspension des timers en arrière-plan.
async function ensureFreshToken() {
  if (!_session) return;
  const expiresAt = _session.expires_at; // timestamp en secondes
  if (!expiresAt) return;
  const secsLeft = expiresAt - Math.floor(Date.now() / 1000);
  if (secsLeft > 120) return; // encore ok

  if (!_session.refresh_token) return;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ refresh_token: _session.refresh_token })
    });
    if (!r.ok) return;
    const d = await r.json();
    setSession(d);
    // Persister en localStorage
    try { localStorage.setItem('sb_s', JSON.stringify(d)); } catch (e) {}
    // Re-planifier le refresh timer
    const { scheduleRefresh } = await import('./auth.js');
    scheduleRefresh(d.expires_at);
  } catch (e) {}
}

export async function sbSelect(table, qs = '') {
  await ensureFreshToken();
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + qs, { headers: hdrs() });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || r.status); }
  return r.json();
}

export async function sbInsert(table, data) {
  await ensureFreshToken();
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: hdrs({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || r.status); }
  return r.json();
}

export async function sbUpsert(table, data, oc = 'id') {
  await ensureFreshToken();
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?on_conflict=' + oc, {
    method: 'POST',
    headers: hdrs({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || r.status); }
  return r.json();
}

export async function sbDelete(table, filter) {
  await ensureFreshToken();
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + filter, {
    method: 'DELETE',
    headers: hdrs()
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || r.status); }
}

export async function sbAuthPut(body) {
  await ensureFreshToken();
  const r = await fetch(SUPABASE_URL + '/auth/v1/user', {
    method: 'PUT',
    headers: hdrs(),
    body: JSON.stringify(body)
  });
  const t = await r.text();
  const d = t ? JSON.parse(t) : {};
  if (!r.ok) throw new Error(d.error_description || d.msg || d.message || r.status);
  return d;
}

export async function sbPatch(table, filter, data) {
  await ensureFreshToken();
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + filter, {
    method: 'PATCH',
    headers: hdrs({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) { const err = await r.json(); throw new Error(err.message || r.status); }
  return r.json();
}
