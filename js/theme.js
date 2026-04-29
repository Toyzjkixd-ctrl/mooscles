// ── THEME (Mode Beauf Vintage) ────────────────────────────────────────────────
export const VINTAGE_LABELS = {
  appName: 'Club Sportif de la Musculation',
  seance: 'Entraînement',
  historique: 'Carnet',
  programmes: 'Programmes',
  records: 'Palmarès',
  profil: 'Fiche',
  finishBtn: 'Consigner la performance →',
  finishActiveBtn: 'Valider et archiver →',
  seanceTitle: 'Nouvelle séance',
  recordsTitle: 'Palmarès',
};

export const DEFAULT_LABELS = {
  appName: '// MY MOOSCLES ARE GETTING BIGGER',
  seance: 'Séance',
  historique: 'Historique',
  programmes: 'Programmes',
  records: 'Records',
  profil: 'Profil',
  finishBtn: 'Enregistrer la séance →',
  finishActiveBtn: 'Valider la séance complète →',
  seanceTitle: 'Séance libre',
  recordsTitle: 'Records',
};

export function isVintage() {
  return document.body.classList.contains('vintage');
}

export function toggleVintageMode(on) {
  document.body.classList.toggle('vintage', on);
  try { localStorage.setItem('vintage_mode', on ? '1' : '0'); } catch (e) {}
  const L = on ? VINTAGE_LABELS : DEFAULT_LABELS;
  document.getElementById('app-name-el').textContent = L.appName;
  document.getElementById('nav-label-seance').textContent = L.seance;
  document.getElementById('nav-label-historique').textContent = L.historique;
  document.getElementById('nav-label-programmes').textContent = L.programmes;
  document.getElementById('nav-label-records').textContent = L.records;
  document.getElementById('nav-label-profil').textContent = L.profil;
  document.getElementById('finish-btn').textContent = L.finishBtn;
  const fab = document.getElementById('finish-active-btn');
  if (fab) fab.textContent = L.finishActiveBtn;
  document.getElementById('seance-title').textContent = L.seanceTitle;
  document.getElementById('records-title').textContent = L.recordsTitle;

  // Import currentUsername lazily to avoid circular dep at module load time
  import('./auth.js').then(({ currentUsername }) => {
    if (currentUsername) {
      document.getElementById('header-user').textContent =
        on ? currentUsername + ' · adhérent' : currentUsername;
    }
  });
}

export function applyStoredTheme() {
  try {
    const on = localStorage.getItem('vintage_mode') === '1';
    if (on) {
      document.getElementById('vintage-toggle').checked = true;
      toggleVintageMode(true);
    }
  } catch (e) {}
}
