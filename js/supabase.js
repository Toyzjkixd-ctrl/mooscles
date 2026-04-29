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

export async function sbSelect(table, qs = '') {
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + qs, { headers: hdrs() });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || r.status); }
  return r.json();
}

export async function sbInsert(table, data) {
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: hdrs({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || r.status); }
  return r.json();
}

export async function sbUpsert(table, data, oc = 'id') {
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?on_conflict=' + oc, {
    method: 'POST',
    headers: hdrs({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || r.status); }
  return r.json();
}

export async function sbDelete(table, filter) {
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + filter, {
    method: 'DELETE',
    headers: hdrs()
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || r.status); }
}

export async function sbAuthPut(body) {
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
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + filter, {
    method: 'PATCH',
    headers: hdrs({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) { const err = await r.json(); throw new Error(err.message || r.status); }
  return r.json();
}
