// ── NUTRITION ─────────────────────────────────────────────────────────────────
import { _session, sbSelect, sbInsert, sbDelete, sbUpsert } from './supabase.js';
import { toast } from './main.js';

// ── MEAL CONFIG ───────────────────────────────────────────────────────────────
export const MEALS = [
  { id: 'breakfast', label: 'Petit-déj', emoji: '🌅', order: 0 },
  { id: 'lunch',     label: 'Déjeuner',  emoji: '☀️',  order: 1 },
  { id: 'snack',     label: 'Collation', emoji: '🍎',  order: 2 },
  { id: 'dinner',    label: 'Dîner',     emoji: '🌙',  order: 3 },
  { id: 'supper',    label: 'Souper',    emoji: '🌛',  order: 4 },
];

// ── FOOD DATABASE ─────────────────────────────────────────────────────────────
export const FOOD_DB_DEFAULT = [
  { name: 'Poulet (blanc)',      unit: 'g',       cal: 1.65, p: 0.31,  c: 0,     f: 0.036 },
  { name: 'Steak haché 5%',     unit: 'g',       cal: 1.21, p: 0.21,  c: 0,     f: 0.05  },
  { name: 'Saumon',             unit: 'g',       cal: 2.08, p: 0.20,  c: 0,     f: 0.13  },
  { name: 'Thon (boite)',       unit: 'g',       cal: 1.16, p: 0.26,  c: 0,     f: 0.01  },
  { name: 'Cabillaud',          unit: 'g',       cal: 0.82, p: 0.18,  c: 0,     f: 0.007 },
  { name: 'Crevettes',          unit: 'g',       cal: 0.85, p: 0.18,  c: 0.001, f: 0.006 },
  { name: 'Oeuf entier',        unit: 'piece',   cal: 78,   p: 6,     c: 0.6,   f: 5.3   },
  { name: 'Blanc oeuf',         unit: 'piece',   cal: 17,   p: 3.6,   c: 0.2,   f: 0.06  },
  { name: 'Jambon blanc',       unit: 'tranche', cal: 35,   p: 5.5,   c: 0.5,   f: 1.2   },
  { name: 'Dinde (escalope)',   unit: 'g',       cal: 1.09, p: 0.24,  c: 0,     f: 0.015 },
  { name: 'Fromage blanc 0%',   unit: 'g',       cal: 0.45, p: 0.085, c: 0.04,  f: 0.002 },
  { name: 'Skyr nature',        unit: 'g',       cal: 0.63, p: 0.11,  c: 0.04,  f: 0.002 },
  { name: 'Yaourt grec 0%',     unit: 'g',       cal: 0.53, p: 0.10,  c: 0.035, f: 0.002 },
  { name: 'Lait ecreme',        unit: 'ml',      cal: 0.35, p: 0.034, c: 0.049, f: 0.001 },
  { name: 'Lait entier',        unit: 'ml',      cal: 0.61, p: 0.032, c: 0.048, f: 0.033 },
  { name: 'Cottage cheese',     unit: 'g',       cal: 0.98, p: 0.113, c: 0.034, f: 0.043 },
  { name: 'Mozzarella',         unit: 'g',       cal: 2.54, p: 0.18,  c: 0.027, f: 0.197 },
  { name: 'Parmesan',           unit: 'g',       cal: 3.92, p: 0.358, c: 0.032, f: 0.256 },
  { name: 'Whey proteine',      unit: 'g',       cal: 4.0,  p: 0.80,  c: 0.06,  f: 0.06  },
  { name: 'Tofu nature',        unit: 'g',       cal: 0.76, p: 0.082, c: 0.018, f: 0.046 },
  { name: 'Edamame',            unit: 'g',       cal: 1.21, p: 0.118, c: 0.085, f: 0.05  },
  { name: 'Lentilles cuites',   unit: 'g',       cal: 1.16, p: 0.09,  c: 0.2,   f: 0.004 },
  { name: 'Pois chiches cuits', unit: 'g',       cal: 1.64, p: 0.086, c: 0.274, f: 0.026 },
  { name: 'Riz blanc cuit',     unit: 'g',       cal: 1.3,  p: 0.027, c: 0.283, f: 0.003 },
  { name: 'Riz complet cuit',   unit: 'g',       cal: 1.11, p: 0.026, c: 0.23,  f: 0.009 },
  { name: 'Pates cuites',       unit: 'g',       cal: 1.31, p: 0.05,  c: 0.25,  f: 0.011 },
  { name: 'Flocons avoine',     unit: 'g',       cal: 3.68, p: 0.131, c: 0.581, f: 0.07  },
  { name: 'Pain complet',       unit: 'tranche', cal: 68,   p: 3,     c: 12,    f: 1     },
  { name: 'Patate douce',       unit: 'g',       cal: 0.86, p: 0.016, c: 0.202, f: 0.001 },
  { name: 'Pomme de terre',     unit: 'g',       cal: 0.77, p: 0.02,  c: 0.17,  f: 0.001 },
  { name: 'Quinoa cuit',        unit: 'g',       cal: 1.20, p: 0.044, c: 0.215, f: 0.019 },
  { name: 'Pain de mie',        unit: 'tranche', cal: 65,   p: 2.4,   c: 12,    f: 0.9   },
  { name: 'Banane',             unit: 'piece',   cal: 90,   p: 1.1,   c: 23,    f: 0.3   },
  { name: 'Pomme',              unit: 'piece',   cal: 72,   p: 0.4,   c: 19,    f: 0.2   },
  { name: 'Myrtilles',          unit: 'g',       cal: 0.57, p: 0.007, c: 0.145, f: 0.003 },
  { name: 'Fraises',            unit: 'g',       cal: 0.32, p: 0.007, c: 0.077, f: 0.003 },
  { name: 'Orange',             unit: 'piece',   cal: 62,   p: 1.2,   c: 15,    f: 0.2   },
  { name: 'Brocoli',            unit: 'g',       cal: 0.34, p: 0.028, c: 0.065, f: 0.004 },
  { name: 'Epinards',           unit: 'g',       cal: 0.23, p: 0.029, c: 0.036, f: 0.004 },
  { name: 'Haricots verts',     unit: 'g',       cal: 0.31, p: 0.018, c: 0.07,  f: 0.001 },
  { name: 'Carotte',            unit: 'g',       cal: 0.41, p: 0.009, c: 0.096, f: 0.002 },
  { name: 'Courgette',          unit: 'g',       cal: 0.17, p: 0.012, c: 0.033, f: 0.003 },
  { name: 'Concombre',          unit: 'g',       cal: 0.15, p: 0.006, c: 0.036, f: 0.001 },
  { name: 'Huile olive',        unit: 'ml',      cal: 8.8,  p: 0,     c: 0,     f: 1     },
  { name: 'Beurre cacahuete',   unit: 'g',       cal: 5.94, p: 0.238, c: 0.2,   f: 0.5   },
  { name: 'Avocat',             unit: 'piece',   cal: 240,  p: 3,     c: 12,    f: 22    },
  { name: 'Amandes',            unit: 'g',       cal: 5.78, p: 0.213, c: 0.216, f: 0.493 },
  { name: 'Noix',               unit: 'g',       cal: 6.54, p: 0.152, c: 0.138, f: 0.654 },
];

// ── STATE ─────────────────────────────────────────────────────────────────────
let FOOD_DB = [...FOOD_DB_DEFAULT];
let customFoods = [];

// Journal state
let viewedDate   = _todayStr();          // currently viewed date in journal
let dayEntries   = [];                   // entries for viewedDate
let goals        = { calories: 2500, protein: 180, carbs: 250, fat: 70 };
let selectedFood = null;
let selectedQty  = 100;
let selectedMeal = _guessMeal();
let activeTab    = 'journal';
let _lastSearchValue = '';

// History state
let histRange    = '7';                  // '7' | '30' | '90' | 'custom'
let histFrom     = '';
let histTo       = '';
let histData     = [];                   // aggregated rows

// ── HELPERS ───────────────────────────────────────────────────────────────────
function _todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function _guessMeal() {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 17) return 'snack';
  if (h < 21) return 'dinner';
  return 'supper';
}

function _dateLabel(dateStr) {
  const today = _todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today)     return "Aujourd'hui";
  if (dateStr === yesterday) return 'Hier';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function _shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function _rebuildFoodDB() {
  const customMapped = customFoods.map(f => ({
    name: f.name, unit: f.unit,
    cal: f.cal_per_unit, p: f.p_per_unit, c: f.c_per_unit, f: f.f_per_unit,
    _custom: true, _id: f.id,
  }));
  FOOD_DB = [...customMapped, ...FOOD_DB_DEFAULT];
}

// ── LOAD ──────────────────────────────────────────────────────────────────────
export async function loadNutrition() {
  try {
    const [customs, profileRows] = await Promise.all([
      sbSelect('custom_foods', 'user_id=eq.' + _session.user.id + '&order=created_at').catch(() => []),
      sbSelect('profiles', 'id=eq.' + _session.user.id + '&select=nutrition_goals').catch(() => []),
    ]);
    
    if (profileRows?.[0]?.nutrition_goals) {
      goals = { ...goals, ...profileRows[0].nutrition_goals };
    }
    
    customFoods = customs || [];
    _rebuildFoodDB();
  } catch (e) {
    customFoods = [];
  }
  await _loadDay(viewedDate);
}

async function _loadDay(date) {
  viewedDate = date;
  try {
    const d = await sbSelect('nutrition_logs',
      'user_id=eq.' + _session.user.id +
      '&date=eq.' + date +
      '&order=meal_order.asc,created_at.asc');
    dayEntries = d || [];
  } catch (e) {
    dayEntries = [];
  }
  renderNutrition();
}

// ── HISTORY LOAD ──────────────────────────────────────────────────────────────
async function _loadHistory() {
  const today = _todayStr();
  let from, to;

  if (histRange === 'custom') {
    from = histFrom || _shiftDate(today, -6);
    to   = histTo   || today;
  } else {
    const days = parseInt(histRange);
    from = _shiftDate(today, -(days - 1));
    to   = today;
  }

  try {
    const rows = await sbSelect('nutrition_logs',
      'user_id=eq.' + _session.user.id +
      '&date=gte.' + from +
      '&date=lte.' + to +
      '&order=date.desc');

    // Aggregate by date
    const byDate = {};
    (rows || []).forEach(e => {
      if (!byDate[e.date]) byDate[e.date] = { date: e.date, cal: 0, p: 0, c: 0, f: 0, items: 0 };
      byDate[e.date].cal   += e.calories || 0;
      byDate[e.date].p     += e.protein  || 0;
      byDate[e.date].c     += e.carbs    || 0;
      byDate[e.date].f     += e.fat      || 0;
      byDate[e.date].items += 1;
    });

    // Fill gaps with empty days so the timeline is continuous
    histData = [];
    let cur = new Date(from + 'T12:00:00');
    const end = new Date(to + 'T12:00:00');
    while (cur <= end) {
      const ds = cur.toISOString().slice(0, 10);
      histData.unshift(byDate[ds] || { date: ds, cal: 0, p: 0, c: 0, f: 0, items: 0 });
      cur.setDate(cur.getDate() + 1);
    }
  } catch (e) {
    histData = [];
  }
  renderNutrition();
}

// ── ENTRIES ───────────────────────────────────────────────────────────────────
export async function addEntry(food, qty) {
  const meal  = MEALS.find(m => m.id === selectedMeal) || MEALS[0];
  const entry = {
    user_id:    _session.user.id,
    date:       viewedDate,
    meal:       meal.id,
    meal_order: meal.order,
    food_name:  food.name,
    quantity:   qty,
    calories:   Math.round(food.cal * qty),
    protein:    +(food.p * qty).toFixed(1),
    carbs:      +(food.c * qty).toFixed(1),
    fat:        +(food.f * qty).toFixed(1),
  };
  try {
    const d = await sbInsert('nutrition_logs', entry);
    dayEntries.push(d[0] || entry);
    dayEntries.sort((a, b) => a.meal_order - b.meal_order);
  } catch (e) {
    dayEntries.push({ ...entry, id: Date.now().toString() });
  }
  selectedFood = null;
  _lastSearchValue = '';
  activeTab = 'journal';
  renderNutrition();
  toast(`Ajouté au ${meal.label} ✓`);
}

export async function deleteEntry(id) {
  try { await sbDelete('nutrition_logs', 'id=eq.' + id); } catch (e) {}
  dayEntries = dayEntries.filter(e => e.id !== id);
  renderNutrition();
}

export async function saveGoals(g) {
  goals = g;
  try {
    await sbPatch('profiles', 'id=eq.' + _session.user.id, { nutrition_goals: g });
  } catch (e) {
    console.error('saveGoals FAIL', e);
  }
  activeTab = 'journal';
  renderNutrition();
  toast('Objectifs sauvegardés ✓');
}

// ── CUSTOM FOOD ───────────────────────────────────────────────────────────────
export async function saveCustomFood() {
  const name = document.getElementById('cf-name')?.value.trim();
  const unit = document.getElementById('cf-unit')?.value || 'g';
  const cal  = parseFloat(document.getElementById('cf-cal')?.value);
  const p    = parseFloat(document.getElementById('cf-p')?.value)  || 0;
  const c    = parseFloat(document.getElementById('cf-c')?.value)  || 0;
  const f    = parseFloat(document.getElementById('cf-f')?.value)  || 0;

  if (!name)    { toast('Donne un nom à cet aliment.', true); return; }
  if (isNaN(cal)) { toast('Saisis les calories.', true); return; }

  const isPerHundred = unit === 'g' || unit === 'ml';
  const div = isPerHundred ? 100 : 1;
  const food = { user_id: _session.user.id, name, unit,
    cal_per_unit: cal / div, p_per_unit: p / div, c_per_unit: c / div, f_per_unit: f / div };

  try {
    const d = await sbInsert('custom_foods', food);
    customFoods.push(d[0] || { ...food, id: Date.now().toString() });
    _rebuildFoodDB();
    activeTab = 'search';
    _lastSearchValue = name;
    const newFood = FOOD_DB.find(x => x.name === name && x._custom);
    if (newFood) { selectedFood = newFood; selectedQty = isPerHundred ? 100 : 1; }
    toast('Aliment créé !');
    renderNutrition();
  } catch (e) { toast('Erreur : ' + e.message, true); }
}

export async function deleteCustomFood(id) {
  if (!confirm('Supprimer cet aliment ?')) return;
  try { await sbDelete('custom_foods', 'id=eq.' + id); } catch (e) {}
  customFoods = customFoods.filter(f => f.id !== id);
  _rebuildFoodDB();
  renderNutrition();
  toast('Aliment supprimé');
}

// ── CALCULATIONS ──────────────────────────────────────────────────────────────
function _sumEntries(entries) {
  return entries.reduce((acc, e) => ({
    cal: acc.cal + (e.calories || 0), p: acc.p + (e.protein || 0),
    c:   acc.c   + (e.carbs    || 0), f: acc.f + (e.fat     || 0),
  }), { cal: 0, p: 0, c: 0, f: 0 });
}

// ── RENDER ────────────────────────────────────────────────────────────────────
export function renderNutrition() {
  const container = document.getElementById('tab-nutrition');
  if (!container) return;

  container.innerHTML = `
    <div>
      <div class="page-title">Nutrition</div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="filter-pill${activeTab==='journal'  ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('journal'))">Journal</button>
      <button class="filter-pill${activeTab==='search'   ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('search'))">+ Ajouter</button>
      <button class="filter-pill${activeTab==='add-food' ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('add-food'))">Nouvel aliment</button>
      <button class="filter-pill${activeTab==='history'  ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('history'))">Historique</button>
      <button class="filter-pill${activeTab==='goals'    ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('goals'))">Objectifs</button>
    </div>
    ${activeTab === 'journal'  ? renderJournal()  : ''}
    ${activeTab === 'search'   ? renderSearch()   : ''}
    ${activeTab === 'add-food' ? renderAddFood()  : ''}
    ${activeTab === 'history'  ? renderHistory()  : ''}
    ${activeTab === 'goals'    ? renderGoals()    : ''}
    <div style="height:8px;"></div>
  `;

  if (activeTab === 'search')   bindSearchEvents();
  if (activeTab === 'goals')    bindGoalEvents();
  if (activeTab === 'add-food') bindAddFoodEvents();
  if (activeTab === 'history')  bindHistoryEvents();
}

// ── JOURNAL ───────────────────────────────────────────────────────────────────
function renderJournal() {
  const total  = _sumEntries(dayEntries);
  const pctCal = Math.min(100, Math.round(total.cal / goals.calories * 100));
  const pctP   = Math.min(100, Math.round(total.p   / goals.protein  * 100));
  const pctC   = Math.min(100, Math.round(total.c   / goals.carbs    * 100));
  const pctF   = Math.min(100, Math.round(total.f   / goals.fat      * 100));
  const calColor = pctCal >= 100 ? 'var(--danger)' : 'var(--accent)';
  const isToday = viewedDate === _todayStr();

  // Meal groups
  const mealGroups = MEALS
    .map(m => ({ meal: m, entries: dayEntries.filter(e => e.meal === m.id) }))
    .filter(g => g.entries.length > 0);

  const journalHTML = mealGroups.length === 0
    ? `<div class="empty" style="padding:24px 0 8px">
        <span>${isToday ? '🥗' : '📅'}</span>
        ${isToday ? "Aucun aliment ajouté aujourd'hui<br><small style='margin-top:4px;display:block;font-size:11px;'>Appuie sur \"+ Ajouter\" pour commencer</small>"
                  : 'Aucun aliment enregistré ce jour'}
       </div>`
    : mealGroups.map(({ meal, entries }) => {
        const mt = _sumEntries(entries);
        return `
          <div style="margin-bottom:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 14px;background:var(--bg3);border-radius:var(--radius-sm) var(--radius-sm) 0 0;border:0.5px solid var(--border);border-bottom:none;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:15px;">${meal.emoji}</span>
                <span style="font-size:13px;font-weight:600;color:var(--text);">${meal.label}</span>
                <span style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;">${entries.length} item${entries.length > 1 ? 's' : ''}</span>
              </div>
              <div style="text-align:right;">
                <div style="font-size:13px;font-weight:600;font-family:'DM Mono',monospace;color:var(--accent);">${mt.cal} kcal</div>
                <div style="font-size:10px;color:var(--text3);font-family:'DM Mono',monospace;">
                  <span style="color:#4fc3f7">${mt.p.toFixed(0)}P</span> · <span style="color:#ffb74d">${mt.c.toFixed(0)}G</span> · <span style="color:#f06292">${mt.f.toFixed(0)}L</span>
                </div>
              </div>
            </div>
            <div style="background:var(--bg2);border:0.5px solid var(--border);border-top:none;border-radius:0 0 var(--radius-sm) var(--radius-sm);padding:0 12px;">
              ${entries.map(e => `
                <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:0.5px solid var(--border);">
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.food_name}</div>
                    <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;margin-top:1px;">
                      ${e.quantity}${_unitLabel(e.food_name)} · <span style="color:#4fc3f7">${e.protein}g P</span> · <span style="color:#ffb74d">${e.carbs}g G</span> · <span style="color:#f06292">${e.fat}g L</span>
                    </div>
                  </div>
                  <div style="font-size:12px;font-weight:600;font-family:'DM Mono',monospace;color:var(--text2);flex-shrink:0;">${e.calories} kcal</div>
                  ${isToday || true ? `<button class="hist-del" onclick="import('./js/nutrition.js').then(m=>m.deleteEntry('${e.id}'))">✕</button>` : ''}
                </div>`).join('')}
            </div>
          </div>`;
      }).join('');

  return `
    <!-- Date navigator -->
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;">
      <button onclick="import('./js/nutrition.js').then(m=>m.navDay(-1))"
        style="background:transparent;border:0.5px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);font-size:16px;width:34px;height:34px;cursor:pointer;">‹</button>
      <div style="text-align:center;flex:1;margin:0 10px;">
        <div style="font-size:14px;font-weight:600;color:var(--text);">${_dateLabel(viewedDate)}</div>
        <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;margin-top:1px;">${viewedDate}</div>
      </div>
      <button onclick="import('./js/nutrition.js').then(m=>m.navDay(1))"
        style="background:transparent;border:0.5px solid var(--border2);border-radius:var(--radius-sm);color:${viewedDate >= _todayStr() ? 'var(--text3)' : 'var(--text)'};font-size:16px;width:34px;height:34px;cursor:pointer;"
        ${viewedDate >= _todayStr() ? 'disabled' : ''}>›</button>
    </div>

    <!-- Calorie ring -->
    <div class="card" style="text-align:center;padding:20px 16px 16px;">
      <div style="position:relative;width:130px;height:130px;margin:0 auto 12px;">
        <svg width="130" height="130" style="transform:rotate(-90deg)">
          <circle cx="65" cy="65" r="55" fill="none" stroke="var(--bg3)" stroke-width="12"/>
          <circle cx="65" cy="65" r="55" fill="none" stroke="${calColor}" stroke-width="12"
            stroke-dasharray="${2*Math.PI*55}" stroke-dashoffset="${2*Math.PI*55*(1-pctCal/100)}"
            stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-family:'DM Mono',monospace;font-size:26px;font-weight:600;color:var(--text);line-height:1;">${total.cal}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:2px;">/ ${goals.calories} kcal</div>
          <div style="font-size:10px;color:${pctCal >= 100 ? 'var(--danger)' : 'var(--text3)'};margin-top:1px;">${pctCal}%</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
        ${_macroMini('Protéines', total.p, goals.protein, 'g', '#4fc3f7', pctP)}
        ${_macroMini('Glucides',  total.c, goals.carbs,   'g', '#ffb74d', pctC)}
        ${_macroMini('Lipides',   total.f, goals.fat,     'g', '#f06292', pctF)}
      </div>
    </div>

    <!-- Macro bars -->
    <div class="card" style="display:flex;flex-direction:column;gap:10px;">
      <div class="card-title">Macros</div>
      ${_macroBar('Protéines', total.p, goals.protein, 'g', '#4fc3f7', pctP)}
      ${_macroBar('Glucides',  total.c, goals.carbs,   'g', '#ffb74d', pctC)}
      ${_macroBar('Lipides',   total.f, goals.fat,     'g', '#f06292', pctF)}
    </div>

    <!-- Meal groups -->
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:1px;font-family:'DM Mono',monospace;">Repas</div>
        <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;">${dayEntries.length} aliment${dayEntries.length !== 1 ? 's' : ''}</div>
      </div>
      ${journalHTML}
    </div>`;
}

// ── HISTORY TAB ───────────────────────────────────────────────────────────────
function renderHistory() {
  const today = _todayStr();
  const ranges = [
    { v: '7',  l: '7 jours' },
    { v: '30', l: '30 jours' },
    { v: '90', l: '3 mois' },
    { v: 'custom', l: 'Perso' },
  ];

  // Aggregated totals for the period
  const periodTotal = histData.reduce((acc, d) => ({
    cal: acc.cal + d.cal, p: acc.p + d.p, c: acc.c + d.c, f: acc.f + d.f, days: acc.days + (d.cal > 0 ? 1 : 0)
  }), { cal: 0, p: 0, c: 0, f: 0, days: 0 });
  const daysWithData = Math.max(periodTotal.days, 1);
  const avgCal = Math.round(periodTotal.cal / daysWithData);
  const avgP   = (periodTotal.p / daysWithData).toFixed(0);
  const avgC   = (periodTotal.c / daysWithData).toFixed(0);
  const avgF   = (periodTotal.f / daysWithData).toFixed(0);

  // Bar chart: max cal across days
  const maxCal = Math.max(...histData.map(d => d.cal), 1);

  const customFields = histRange === 'custom' ? `
    <div style="display:flex;gap:8px;margin-top:8px;">
      <div style="flex:1;">
        <div style="font-size:10px;color:var(--text3);font-family:'DM Mono',monospace;margin-bottom:4px;">Du</div>
        <input type="date" id="hist-from" value="${histFrom || _shiftDate(today, -6)}" max="${today}"
          style="width:100%;background:var(--bg3);border:0.5px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);font-size:13px;padding:8px 10px;">
      </div>
      <div style="flex:1;">
        <div style="font-size:10px;color:var(--text3);font-family:'DM Mono',monospace;margin-bottom:4px;">Au</div>
        <input type="date" id="hist-to" value="${histTo || today}" max="${today}"
          style="width:100%;background:var(--bg3);border:0.5px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);font-size:13px;padding:8px 10px;">
      </div>
      <div style="display:flex;align-items:flex-end;">
        <button class="btn-sm" id="hist-apply" style="white-space:nowrap;padding:8px 12px;">OK</button>
      </div>
    </div>` : '';

  const statsCard = histData.length > 0 && periodTotal.cal > 0 ? `
    <div class="card">
      <div class="card-title" style="margin-bottom:12px;">Moyennes / jour (${daysWithData} jour${daysWithData > 1 ? 's' : ''} avec données)</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px;">
        ${_statBox('Calories moy.', avgCal, 'kcal', 'var(--accent)')}
        ${_statBox('Objectif', goals.calories, 'kcal', 'var(--text3)')}
        ${_statBox('Protéines moy.', avgP, 'g', '#4fc3f7')}
        ${_statBox('Glucides moy.',  avgC, 'g', '#ffb74d')}
      </div>
      <!-- Macro split bar -->
      <div style="margin-bottom:6px;">
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.8px;">Répartition calorique moyenne</div>
        ${_splitBar(+avgP, +avgC, +avgF)}
      </div>
    </div>` : '';

  // Day-by-day rows
  const dayRows = histData.length === 0
    ? '<div class="empty"><span>📅</span>Aucune donnée sur cette période</div>'
    : histData.map(d => {
        const pct = Math.round(d.cal / maxCal * 100);
        const calPct = Math.min(100, Math.round(d.cal / goals.calories * 100));
        const barColor = calPct >= 100 ? 'var(--danger)' : calPct >= 80 ? 'var(--accent)' : 'var(--text3)';
        const label = _dateLabel(d.date);
        return `
          <div style="padding:10px 0;border-bottom:0.5px solid var(--border);cursor:pointer;"
               onclick="import('./js/nutrition.js').then(m=>m.jumpToDay('${d.date}'))">
            <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:5px;">
              <div>
                <span style="font-size:13px;font-weight:500;color:${d.cal > 0 ? 'var(--text)' : 'var(--text3)'};">${label}</span>
                <span style="font-size:11px;color:var(--text3);margin-left:6px;font-family:'DM Mono',monospace;">${d.date}</span>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:10px;">
                ${d.cal > 0
                  ? `<span style="font-size:13px;font-weight:600;font-family:'DM Mono',monospace;color:${barColor};">${d.cal} kcal</span>`
                  : `<span style="font-size:12px;color:var(--text3);">—</span>`}
              </div>
            </div>
            ${d.cal > 0 ? `
            <div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-bottom:5px;">
              <div style="height:5px;background:${barColor};border-radius:3px;width:${pct}%;"></div>
            </div>
            <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;">
              <span style="color:#4fc3f7">${d.p.toFixed(0)}g P</span>
              &nbsp;·&nbsp;
              <span style="color:#ffb74d">${d.c.toFixed(0)}g G</span>
              &nbsp;·&nbsp;
              <span style="color:#f06292">${d.f.toFixed(0)}g L</span>
              &nbsp;·&nbsp;
              <span style="color:var(--text3)">${d.items} aliment${d.items > 1 ? 's' : ''}</span>
            </div>` : `<div style="font-size:11px;color:var(--text3);">Rien de saisi</div>`}
          </div>`;
      }).join('');

  return `
    <!-- Range selector -->
    <div class="card" style="padding:12px 14px;">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;margin-bottom:8px;">Période</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${ranges.map(r => `
          <button class="filter-pill${histRange === r.v ? ' active' : ''}"
            onclick="import('./js/nutrition.js').then(m=>m.setHistRange('${r.v}'))">${r.l}</button>`).join('')}
      </div>
      ${customFields}
    </div>

    ${statsCard}

    <!-- Day list -->
    <div class="card" style="padding:14px 16px;">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;margin-bottom:4px;">
        Détail par jour <span style="color:var(--text2);font-weight:400;"> — appuie pour voir le journal</span>
      </div>
      ${dayRows}
    </div>`;
}

function _statBox(label, val, unit, color) {
  return `
    <div style="background:var(--bg3);border-radius:var(--radius-sm);padding:12px;">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.7px;font-family:'DM Mono',monospace;margin-bottom:4px;">${label}</div>
      <div style="font-size:20px;font-weight:600;font-family:'DM Mono',monospace;color:${color};">${val}<span style="font-size:11px;font-weight:400;color:var(--text3);margin-left:2px;">${unit}</span></div>
    </div>`;
}

function _splitBar(p, c, f) {
  const calP = p * 4, calC = c * 4, calF = f * 9;
  const total = calP + calC + calF || 1;
  const pctP = Math.round(calP / total * 100);
  const pctC = Math.round(calC / total * 100);
  const pctF = 100 - pctP - pctC;
  return `
    <div style="height:14px;border-radius:7px;overflow:hidden;display:flex;margin-bottom:6px;">
      <div style="width:${pctP}%;background:#4fc3f7;"></div>
      <div style="width:${pctC}%;background:#ffb74d;"></div>
      <div style="width:${pctF}%;background:#f06292;"></div>
    </div>
    <div style="display:flex;gap:12px;font-size:11px;font-family:'DM Mono',monospace;">
      <span style="color:#4fc3f7;">P ${pctP}%</span>
      <span style="color:#ffb74d;">G ${pctC}%</span>
      <span style="color:#f06292;">L ${pctF}%</span>
    </div>`;
}

function bindHistoryEvents() {
  document.getElementById('hist-apply')?.addEventListener('click', () => {
    histFrom = document.getElementById('hist-from')?.value || '';
    histTo   = document.getElementById('hist-to')?.value   || '';
    _loadHistory();
  });
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function renderSearch() {
  if (selectedFood) {
    const food = selectedFood;
    const qty  = selectedQty;
    const isCountable = !['g', 'ml'].includes(food.unit);
    const calc = { cal: Math.round(food.cal * qty), p: +(food.p * qty).toFixed(1), c: +(food.c * qty).toFixed(1), f: +(food.f * qty).toFixed(1) };
    const mealPills = MEALS.map(m => `
      <button class="filter-pill${selectedMeal === m.id ? ' active' : ''}" style="font-size:12px;"
        onclick="import('./js/nutrition.js').then(mod=>mod.setMeal('${m.id}'))">${m.emoji} ${m.label}</button>`).join('');
    return `
      <div class="card" id="nutri-detail">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <button id="back-to-search" style="background:transparent;border:none;color:var(--text2);font-size:20px;cursor:pointer;line-height:1;">&#8592;</button>
          <div>
            <div style="font-size:16px;font-weight:600;color:var(--text);">${food.name}</div>
            ${food._custom ? '<div style="font-size:11px;color:var(--accent);margin-top:1px;">✦ Aliment perso</div>' : ''}
          </div>
        </div>
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;">Quantité (${food.unit})</div>
          <div style="display:flex;align-items:center;gap:10px;">
            <button id="qty-minus" style="width:40px;height:40px;border-radius:50%;border:0.5px solid var(--border2);background:var(--bg3);color:var(--text);font-size:20px;cursor:pointer;line-height:1;">&#8722;</button>
            <input type="number" id="qty-input" value="${qty}" min="${isCountable ? 1 : 10}" step="${isCountable ? 1 : 10}" inputmode="decimal"
              style="flex:1;text-align:center;font-size:22px;font-weight:600;font-family:'DM Mono',monospace;background:var(--bg3);border:0.5px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);padding:10px;">
            <button id="qty-plus" style="width:40px;height:40px;border-radius:50%;border:0.5px solid var(--border2);background:var(--bg3);color:var(--text);font-size:20px;cursor:pointer;line-height:1;">+</button>
          </div>
        </div>
        <div id="macro-preview" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:16px;">
          ${_qtyMacro('Calories', calc.cal, 'kcal', 'var(--accent)')}${_qtyMacro('Protéines', calc.p, 'g', '#4fc3f7')}${_qtyMacro('Glucides', calc.c, 'g', '#ffb74d')}${_qtyMacro('Lipides', calc.f, 'g', '#f06292')}
        </div>
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;color:var(--text3);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;">Ajouter à...</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">${mealPills}</div>
        </div>
        <button class="btn-primary" id="add-food-btn">Ajouter au ${MEALS.find(m=>m.id===selectedMeal)?.emoji} ${MEALS.find(m=>m.id===selectedMeal)?.label}</button>
      </div>`;
  }

  return `
    <div class="card" id="nutri-search-card">
      <div class="card-header" style="margin-bottom:10px;">
        <span class="card-title">Base d'aliments (${FOOD_DB.length})</span>
        ${customFoods.length ? `<span style="font-size:11px;color:var(--accent);font-family:'DM Mono',monospace;">${customFoods.length} perso</span>` : ''}
      </div>
      <input type="text" id="food-search-input" placeholder="Rechercher un aliment..." autocomplete="off"
        style="width:100%;background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;padding:8px 12px;margin-bottom:10px;font-family:'DM Sans',sans-serif;direction:ltr;unicode-bidi:normal;">
      <div id="food-list-container" style="max-height:340px;overflow-y:auto;"></div>
    </div>`;
}

function _renderFoodList(query) {
  const container = document.getElementById('food-list-container');
  if (!container) return;
  const q = (query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filtered = FOOD_DB.filter(f => !q || f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q));
  container.innerHTML = '';
  if (!filtered.length) { container.innerHTML = '<div style="padding:12px 14px;font-size:13px;color:var(--text3);">Aucun aliment trouvé</div>'; return; }
  filtered.forEach(food => {
    const row = document.createElement('div'); row.className = 'ex-dropdown-item';
    const isPerGram = food.unit === 'g' || food.unit === 'ml';
    const info = isPerGram
      ? `pour 100${food.unit} · ${Math.round(food.cal * 100)} kcal · ${(food.p * 100).toFixed(0)}g P`
      : `par ${food.unit} · ${Math.round(food.cal)} kcal · ${food.p.toFixed(1)}g P`;
    row.innerHTML = `
      <div style="flex:1;min-width:0;">
        <div class="ex-dropdown-label" style="${food._custom ? 'color:var(--accent)' : ''}">${food.name}${food._custom ? ' ✦' : ''}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:1px;">${info}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <span style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;">${food.unit}</span>
        ${food._custom ? `<button class="ex-dropdown-del" data-id="${food._id}">✕</button>` : ''}
      </div>`;
    row.addEventListener('click', e => {
      if (e.target.dataset.id) return;
      _lastSearchValue = document.getElementById('food-search-input')?.value || '';
      selectedFood = food; selectedQty = isPerGram ? 100 : 1; renderNutrition();
    });
    const delBtn = row.querySelector('[data-id]');
    if (delBtn) delBtn.addEventListener('click', e => { e.stopPropagation(); deleteCustomFood(food._id); });
    container.appendChild(row);
  });
}

function _updateMacroPreview() {
  if (!selectedFood) return;
  const calc = { cal: Math.round(selectedFood.cal * selectedQty), p: +(selectedFood.p * selectedQty).toFixed(1), c: +(selectedFood.c * selectedQty).toFixed(1), f: +(selectedFood.f * selectedQty).toFixed(1) };
  const preview = document.getElementById('macro-preview');
  if (preview) preview.innerHTML = _qtyMacro('Calories', calc.cal, 'kcal', 'var(--accent)') + _qtyMacro('Protéines', calc.p, 'g', '#4fc3f7') + _qtyMacro('Glucides', calc.c, 'g', '#ffb74d') + _qtyMacro('Lipides', calc.f, 'g', '#f06292');
  const inp = document.getElementById('qty-input'); if (inp) inp.value = selectedQty;
  const btn = document.getElementById('add-food-btn');
  if (btn) { const meal = MEALS.find(m => m.id === selectedMeal); btn.textContent = `Ajouter au ${meal?.emoji} ${meal?.label}`; }
}

function bindSearchEvents() {
  if (selectedFood) {
    const isCountable = !['g', 'ml'].includes(selectedFood.unit);
    const step = isCountable ? 1 : 10;
    document.getElementById('back-to-search')?.addEventListener('click', () => { selectedFood = null; renderNutrition(); });
    document.getElementById('qty-minus')?.addEventListener('click', () => { selectedQty = Math.max(isCountable ? 1 : 10, selectedQty - step); _updateMacroPreview(); });
    document.getElementById('qty-plus')?.addEventListener('click',  () => { selectedQty += step; _updateMacroPreview(); });
    document.getElementById('qty-input')?.addEventListener('input', e => { selectedQty = parseFloat(e.target.value) || (isCountable ? 1 : 10); _updateMacroPreview(); });
    document.getElementById('add-food-btn')?.addEventListener('click', () => addEntry(selectedFood, selectedQty));
    return;
  }
  const inp = document.getElementById('food-search-input');
  if (inp) {
    inp.value = _lastSearchValue;
    _renderFoodList(_lastSearchValue);
    inp.addEventListener('input', () => { _lastSearchValue = inp.value; _renderFoodList(inp.value); });
    if (window.innerWidth > 600) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  }
}

// ── ADD CUSTOM FOOD ───────────────────────────────────────────────────────────
function renderAddFood() {
  return `
    <div class="card">
      <div class="card-header" style="margin-bottom:6px;"><span class="card-title">Nouvel aliment</span></div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:14px;">Ajoute un aliment personnalisé à ta base.</div>
      <div class="field" style="margin-bottom:10px;">
        <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;">Nom</label>
        <input type="text" id="cf-name" placeholder="Ex: Crêpe maison..."
          style="background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:14px;padding:10px 12px;font-family:'DM Sans',sans-serif;width:100%;">
      </div>
      <div class="field" style="margin-bottom:10px;">
        <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;">Unité</label>
        <select id="cf-unit" style="background:var(--bg3);border:0.5px solid var(--border2);color:var(--text);font-size:13px;padding:9px 12px;border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;width:100%;">
          <option value="g">g — valeurs pour 100g</option>
          <option value="ml">ml — valeurs pour 100ml</option>
          <option value="piece">pièce — valeurs par pièce</option>
          <option value="tranche">tranche — valeurs par tranche</option>
          <option value="portion">portion — valeurs par portion</option>
        </select>
      </div>
      <div id="cf-hint" style="font-size:12px;color:var(--accent);margin-bottom:12px;padding:8px 10px;background:var(--accent-dim);border-radius:var(--radius-sm);border:0.5px solid rgba(200,241,53,0.2);">Entrez les valeurs pour 100g</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
        ${_cfField('cf-cal', 'Calories (kcal)')}${_cfField('cf-p', 'Protéines (g)')}${_cfField('cf-c', 'Glucides (g)')}${_cfField('cf-f', 'Lipides (g)')}
      </div>
      <button class="btn-primary" id="save-cf-btn">Créer l'aliment</button>
    </div>
    ${customFoods.length > 0 ? `
    <div class="card">
      <div class="card-header"><span class="card-title">Mes aliments (${customFoods.length})</span></div>
      ${customFoods.map(cf => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:0.5px solid var(--border);">
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:500;color:var(--accent);">${cf.name}</div>
            <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;margin-top:1px;">
              ${cf.unit === 'g' || cf.unit === 'ml'
                ? `${Math.round(cf.cal_per_unit * 100)} kcal/100${cf.unit} · ${(cf.p_per_unit * 100).toFixed(0)}g P · ${(cf.c_per_unit * 100).toFixed(0)}g G · ${(cf.f_per_unit * 100).toFixed(0)}g L`
                : `${Math.round(cf.cal_per_unit)} kcal/${cf.unit} · ${cf.p_per_unit.toFixed(1)}g P · ${cf.c_per_unit.toFixed(1)}g G · ${cf.f_per_unit.toFixed(1)}g L`}
            </div>
          </div>
          <button class="hist-del" onclick="import('./js/nutrition.js').then(m=>m.deleteCustomFood('${cf.id}'))">✕</button>
        </div>`).join('')}
    </div>` : ''}`;
}

function bindAddFoodEvents() {
  document.getElementById('save-cf-btn')?.addEventListener('click', saveCustomFood);
  const unitSel = document.getElementById('cf-unit'), hint = document.getElementById('cf-hint');
  if (unitSel && hint) unitSel.addEventListener('change', () => {
    const u = unitSel.value, per100 = u === 'g' || u === 'ml';
    hint.textContent = per100 ? `Entrez les valeurs pour 100${u}` : `Entrez les valeurs par ${u}`;
  });
}

// ── GOALS ─────────────────────────────────────────────────────────────────────
function renderGoals() {
  return `
    <div class="card">
      <div class="card-header" style="margin-bottom:14px;"><span class="card-title">Mes objectifs</span></div>
      ${_goalField('goal-cal', 'Calories', goals.calories, 'kcal/jour', 1000, 5000, 50)}
      ${_goalField('goal-p',   'Protéines', goals.protein, 'g/jour', 50, 300, 5)}
      ${_goalField('goal-c',   'Glucides',  goals.carbs,   'g/jour', 50, 600, 10)}
      ${_goalField('goal-f',   'Lipides',   goals.fat,     'g/jour', 20, 200, 5)}
      <button class="btn-primary" id="save-goals-btn" style="margin-top:6px;">Sauvegarder</button>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:10px;">Calculateur rapide</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:12px;">Estimation Mifflin-St Jeor</div>
      ${_calcField('calc-weight', 'Poids (kg)', 75, 40, 150, 1)}
      ${_calcField('calc-age',    'Âge',        25, 15, 80,  1)}
      <div class="field" style="margin-bottom:10px;">
        <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;margin-bottom:6px;">Sexe</label>
        <div style="display:flex;gap:6px;">
          <button class="filter-pill active" id="sex-m" onclick="import('./js/nutrition.js').then(m=>m.setSex('m'))">Homme</button>
          <button class="filter-pill" id="sex-f" onclick="import('./js/nutrition.js').then(m=>m.setSex('f'))">Femme</button>
        </div>
      </div>
      <div class="field" style="margin-bottom:12px;">
        <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;margin-bottom:6px;">Activité</label>
        <select id="calc-activity" style="background:var(--bg3);border:0.5px solid var(--border2);color:var(--text);font-size:13px;padding:9px 12px;border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;width:100%;">
          <option value="1.2">Sédentaire</option>
          <option value="1.375">Légèrement actif (1-3×/sem)</option>
          <option value="1.55" selected>Modérément actif (3-5×/sem)</option>
          <option value="1.725">Très actif (6-7×/sem)</option>
          <option value="1.9">Extrêmement actif</option>
        </select>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:12px;">
        <button class="filter-pill active" id="obj-maintain" onclick="import('./js/nutrition.js').then(m=>m.setObj('maintain'))">Maintien</button>
        <button class="filter-pill" id="obj-bulk"     onclick="import('./js/nutrition.js').then(m=>m.setObj('bulk'))">Prise masse</button>
        <button class="filter-pill" id="obj-cut"      onclick="import('./js/nutrition.js').then(m=>m.setObj('cut'))">Sèche</button>
      </div>
      <button class="btn-primary" id="calc-btn" style="background:var(--bg3);color:var(--text);border:0.5px solid var(--border2);">Calculer mes besoins</button>
      <div id="calc-result" style="display:none;margin-top:12px;padding:12px;background:var(--accent-dim);border-radius:var(--radius-sm);border:0.5px solid rgba(200,241,53,0.3);">
        <div id="calc-result-text" style="font-size:13px;color:var(--text);margin-bottom:10px;"></div>
        <button class="btn-primary" id="apply-calc-btn">Appliquer ces objectifs</button>
      </div>
    </div>`;
}

let _calcSex = 'm', _calcObj = 'maintain', _calcResult = null;

function bindGoalEvents() {
  document.getElementById('save-goals-btn')?.addEventListener('click', () => {
    saveGoals({ calories: +document.getElementById('goal-cal').value || 2500, protein: +document.getElementById('goal-p').value || 180, carbs: +document.getElementById('goal-c').value || 250, fat: +document.getElementById('goal-f').value || 70 });
  });
  document.getElementById('calc-btn')?.addEventListener('click', () => {
    const w = +document.getElementById('calc-weight').value || 75;
    const age = +document.getElementById('calc-age').value || 25;
    const act = +document.getElementById('calc-activity').value || 1.55;
    const bmr = _calcSex === 'm' ? 10*w + 6.25*175 - 5*age + 5 : 10*w + 6.25*162 - 5*age - 161;
    let tdee = Math.round(bmr * act);
    if (_calcObj === 'bulk') tdee += 300;
    if (_calcObj === 'cut')  tdee -= 400;
    const protein = Math.round(w * 2), fat = Math.round(w * 1), carbs = Math.round((tdee - protein*4 - fat*9) / 4);
    _calcResult = { calories: tdee, protein, carbs, fat };
    document.getElementById('calc-result-text').innerHTML = `<strong style="color:var(--accent);font-size:15px;">${tdee} kcal/jour</strong><br><span style="color:#4fc3f7;">Protéines : ${protein}g</span> · <span style="color:#ffb74d;">Glucides : ${carbs}g</span> · <span style="color:#f06292;">Lipides : ${fat}g</span>`;
    document.getElementById('calc-result').style.display = 'block';
    document.getElementById('apply-calc-btn')?.addEventListener('click', () => { if (_calcResult) saveGoals(_calcResult); });
  });
}

// ── SMALL HELPERS ─────────────────────────────────────────────────────────────
function _macroMini(label, val, goal, unit, color, pct) {
  return `
    <div style="text-align:center;">
      <div style="font-size:16px;font-weight:600;color:${color};font-family:'DM Mono',monospace;">${val.toFixed(0)}<span style="font-size:10px;font-weight:400;color:var(--text3)">${unit}</span></div>
      <div style="font-size:10px;color:var(--text3);margin:2px 0 4px;">${label}</div>
      <div style="height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;"><div style="height:3px;background:${color};border-radius:2px;width:${pct}%;"></div></div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px;">${pct}%</div>
    </div>`;
}

function _macroBar(label, val, goal, unit, color, pct) {
  return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <span style="font-size:12px;color:var(--text2);">${label}</span>
        <span style="font-size:12px;font-family:'DM Mono',monospace;color:${color};">${val.toFixed(0)} / ${goal}${unit}</span>
      </div>
      <div style="height:6px;background:var(--bg3);border-radius:4px;overflow:hidden;">
        <div style="height:6px;background:${color};border-radius:4px;width:${pct}%;transition:width 0.5s;"></div>
      </div>
    </div>`;
}

function _qtyMacro(label, val, unit, color) {
  return `<div style="background:var(--bg3);border-radius:var(--radius-sm);padding:10px 8px;text-align:center;"><div style="font-size:15px;font-weight:600;color:${color};font-family:'DM Mono',monospace;">${val}</div><div style="font-size:9px;color:var(--text3);margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div></div>`;
}

function _goalField(id, label, val, unit, min, max, step) {
  return `<div class="field" style="margin-bottom:12px;"><label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;display:flex;justify-content:space-between;margin-bottom:6px;"><span>${label}</span><span style="color:var(--text2);font-size:10px;">${unit}</span></label><input type="number" id="${id}" value="${val}" min="${min}" max="${max}" step="${step}" inputmode="decimal" style="background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:15px;font-weight:600;padding:10px 14px;font-family:'DM Mono',monospace;width:100%;"></div>`;
}

function _calcField(id, label, val, min, max, step) {
  return `<div class="field" style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;margin-bottom:6px;">${label}</label><input type="number" id="${id}" value="${val}" min="${min}" max="${max}" step="${step}" inputmode="decimal" style="background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:15px;padding:9px 14px;font-family:'DM Mono',monospace;width:100%;"></div>`;
}

function _cfField(id, label) {
  return `<div class="field"><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.7px;font-family:'DM Mono',monospace;margin-bottom:4px;">${label}</label><input type="number" id="${id}" placeholder="0" min="0" step="0.1" inputmode="decimal" value="" style="background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:15px;font-weight:600;padding:9px 10px;font-family:'DM Mono',monospace;width:100%;-moz-appearance:textfield;"></div>`;
}

function _unitLabel(name) {
  const f = FOOD_DB.find(x => x.name === name);
  if (!f) return 'g';
  if (f.unit === 'g' || f.unit === 'ml') return f.unit;
  return ' ' + f.unit;
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
export function setNutriTab(t) {
  activeTab = t;
  selectedFood = null;
  if (t !== 'search') _lastSearchValue = '';
  if (t === 'history' && histData.length === 0) { _loadHistory(); return; }
  renderNutrition();
}

export function navDay(delta) {
  const next = _shiftDate(viewedDate, delta);
  if (next > _todayStr()) return;
  _loadDay(next);
}

export function jumpToDay(date) {
  activeTab = 'journal';
  _loadDay(date);
}

export function setHistRange(v) {
  histRange = v;
  histData = [];
  _loadHistory();
}

export function setMeal(id) {
  selectedMeal = id;
  document.querySelectorAll('#nutri-detail .filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().includes(MEALS.find(m => m.id === id)?.label || '~~~'));
  });
  const btn = document.getElementById('add-food-btn');
  if (btn) { const meal = MEALS.find(m => m.id === id); btn.textContent = `Ajouter au ${meal?.emoji} ${meal?.label}`; }
}

export function setSex(s) {
  _calcSex = s;
  document.getElementById('sex-m')?.classList.toggle('active', s === 'm');
  document.getElementById('sex-f')?.classList.toggle('active', s === 'f');
}

export function setObj(o) {
  _calcObj = o;
  ['maintain', 'bulk', 'cut'].forEach(x => document.getElementById('obj-' + x)?.classList.toggle('active', x === o));
}
