// ── SPOTIFY NATIVE DEEP LINKS ─────────────────────────────────────────────────
// Ouvre l'app Spotify installée sur le device via spotify: URI scheme.
// Fallback vers open.spotify.com si l'app n'est pas installée.
// Aucun Client ID, aucune auth, aucun SDK requis.

// ── PLAYLISTS ─────────────────────────────────────────────────────────────────
const PLAYLISTS = [
  { id: '37i9dQZF1DX9qNs32fujYe', label: 'Metal Workout',  emoji: '🤘' },
  { id: '37i9dQZF1DX0XUsuxWHRQd', label: 'Rap Workout',    emoji: '🔥' },
  { id: '37i9dQZF1DX4dyzvuaRJ0n', label: 'Beast Mode',     emoji: '💥' },
  { id: '37i9dQZF1DWXIcbzpLauPS', label: 'Rock Workout',   emoji: '🎸' },
  { id: '37i9dQZF1DX70RN3TfWWJh', label: 'Hype',           emoji: '🚀' },
  { id: '37i9dQZF1DX0vHZ8ElSiMT', label: 'HIIT Training',  emoji: '🏃' },
  { id: '37i9dQZF1DX76Wlfdnj7AP', label: 'BPM 140+',       emoji: '🎛️' },
  { id: '37i9dQZF1DX2RxBh64BHjQ', label: 'Trap Nation',    emoji: '🎤' },
];

// ── OPEN SPOTIFY ──────────────────────────────────────────────────────────────
// Tente d'ouvrir l'app native via spotify: scheme.
// Si l'app n'est pas là, redirige vers open.spotify.com dans un nouvel onglet.
export function openPlaylist(id) {
  const appUri = 'spotify:playlist:' + id;
  const webUrl = 'https://open.spotify.com/playlist/' + id;

  // Sur iOS/Android, le scheme spotify: ouvre l'app native directement.
  // Après 1.2s, si la page est toujours visible → app absente → fallback web.
  const start = Date.now();
  window.location.href = appUri;

  setTimeout(() => {
    if (!document.hidden && Date.now() - start < 2000) {
      window.open(webUrl, '_blank', 'noopener');
    }
  }, 1200);

  try { localStorage.setItem('sp_last_playlist', id); } catch (e) {}
  renderPlayer();
}

export function openSpotify() {
  const start = Date.now();
  window.location.href = 'spotify:';
  setTimeout(() => {
    if (!document.hidden && Date.now() - start < 2000) {
      window.open('https://open.spotify.com', '_blank', 'noopener');
    }
  }, 1200);
}

// ── RENDER ────────────────────────────────────────────────────────────────────
export function renderPlayer() {
  const container = document.getElementById('spotify-player');
  if (!container) return;

  const lastId = (() => { try { return localStorage.getItem('sp_last_playlist'); } catch (e) { return null; } })();
  const lastPl = lastId ? PLAYLISTS.find(p => p.id === lastId) : null;

  container.innerHTML = `
    <div class="sp-wrap">
      <div class="sp-main-row">
        <div class="sp-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <div class="sp-label">
          ${lastPl
            ? `<span class="sp-last">${lastPl.emoji} ${lastPl.label}</span><span class="sp-sub">Dernière playlist</span>`
            : `<span class="sp-last">Spotify</span><span class="sp-sub">Lance une playlist workout</span>`
          }
        </div>
        <button class="sp-open-btn" onclick="import('./js/spotify.js').then(m=>m.openSpotify())">
          Ouvrir ↗
        </button>
      </div>
      <div class="sp-playlists">
        ${PLAYLISTS.map(p => `
          <button
            class="sp-pill${lastId === p.id ? ' sp-pill-active' : ''}"
            onclick="import('./js/spotify.js').then(m=>m.openPlaylist('${p.id}'))">
            ${p.emoji} ${p.label}
          </button>`).join('')}
      </div>
    </div>`;
}

// ── INIT ──────────────────────────────────────────────────────────────────────
export function initSpotify() {
  renderPlayer();
}
