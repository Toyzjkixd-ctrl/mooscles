// ── NUTRITION ─────────────────────────────────────────────────────────────────
import { _session, sbSelect, sbInsert, sbDelete } from './supabase.js';
import { toast } from './main.js';

// ── MEAL CONFIG ───────────────────────────────────────────────────────────────
export const MEALS = [
  { id: 'breakfast', label: 'Petit-déj',  emoji: '🌅', order: 0 },
  { id: 'lunch',     label: 'Déjeuner',   emoji: '☀️',  order: 1 },
  { id: 'snack',     label: 'Collation',  emoji: '🍎',  order: 2 },
  { id: 'dinner',    label: 'Dîner',      emoji: '🌙',  order: 3 },
  { id: 'supper',    label: 'Souper',     emoji: '🌛',  order: 4 },
];

// ── FOOD DATABASE ─────────────────────────────────────────────────────────────
export const FOOD_DB_DEFAULT = [
  // Protéines animales
  { name: 'Poulet (blanc)', unit: 'g', cal: 1.65, p: 0.31, c: 0, f: 0.036 },
  { name: 'Steak haché 5%', unit: 'g', cal: 1.21, p: 0.21, c: 0, f: 0.05 },
  { name: 'Saumon', unit: 'g', cal: 2.08, p: 0.20, c: 0, f: 0.13 },
  { name: 'Thon (boite)', unit: 'g', cal: 1.16, p: 0.26, c: 0, f: 0.01 },
  { name: 'Cabillaud', unit: 'g', cal: 0.82, p: 0.18, c: 0, f: 0.007 },
  { name: 'Crevettes', unit: 'g', cal: 0.85, p: 0.18, c: 0.001, f: 0.006 },
  { name: 'Oeuf entier', unit: 'piece', cal: 78, p: 6, c: 0.6, f: 5.3 },
  { name: 'Blanc oeuf', unit: 'piece', cal: 17, p: 3.6, c: 0.2, f: 0.06 },
  { name: 'Jambon blanc', unit: 'tranche', cal: 35, p: 5.5, c: 0.5, f: 1.2 },
  { name: 'Dinde (escalope)', unit: 'g', cal: 1.09, p: 0.24, c: 0, f: 0.015 },
  // Laitiers
  { name: 'Fromage blanc 0%', unit: 'g', cal: 0.45, p: 0.085, c: 0.04, f: 0.002 },
  { name: 'Skyr nature', unit: 'g', cal: 0.63, p: 0.11, c: 0.04, f: 0.002 },
  { name: 'Yaourt grec 0%', unit: 'g', cal: 0.53, p: 0.10, c: 0.035, f: 0.002 },
  { name: 'Lait ecreme', unit: 'ml', cal: 0.35, p: 0.034, c: 0.049, f: 0.001 },
  { name: 'Lait entier', unit: 'ml', cal: 0.61, p: 0.032, c: 0.048, f: 0.033 },
  { name: 'Cottage cheese', unit: 'g', cal: 0.98, p: 0.113, c: 0.034, f: 0.043 },
  { name: 'Mozzarella', unit: 'g', cal: 2.54, p: 0.18, c: 0.027, f: 0.197 },
  { name: 'Parmesan', unit: 'g', cal: 3.92, p: 0.358, c: 0.032, f: 0.256 },
  // Proteines veg & complements
  { name: 'Whey proteine', unit: 'g', cal: 4.0, p: 0.80, c: 0.06, f: 0.06 },
  { name: 'Tofu nature', unit: 'g', cal: 0.76, p: 0.082, c: 0.018, f: 0.046 },
  { name: 'Edamame', unit: 'g', cal: 1.21, p: 0.118, c: 0.085, f: 0.05 },
  { name: 'Lentilles cuites', unit: 'g', cal: 1.16, p: 0.09, c: 0.2, f: 0.004 },
  { name: 'Pois chiches cuits', unit: 'g', cal: 1.64, p: 0.086, c: 0.274, f: 0.026 },
  // Glucides / feculents
  { name: 'Riz blanc cuit', unit: 'g', cal: 1.3, p: 0.027, c: 0.283, f: 0.003 },
  { name: 'Riz complet cuit', unit: 'g', cal: 1.11, p: 0.026, c: 0.23, f: 0.009 },
  { name: 'Pates cuites', unit: 'g', cal: 1.31, p: 0.05, c: 0.25, f: 0.011 },
  { name: 'Flocons avoine', unit: 'g', cal: 3.68, p: 0.131, c: 0.581, f: 0.07 },
  { name: 'Pain complet (tranche)', unit: 'tranche', cal: 68, p: 3, c: 12, f: 1 },
  { name: 'Patate douce', unit: 'g', cal: 0.86, p: 0.016, c: 0.202, f: 0.001 },
  { name: 'Pomme de terre', unit: 'g', cal: 0.77, p: 0.02, c: 0.17, f: 0.001 },
  { name: 'Quinoa cuit', unit: 'g', cal: 1.20, p: 0.044, c: 0.215, f: 0.019 },
  { name: 'Pain de mie (tranche)', unit: 'tranche', cal: 65, p: 2.4, c: 12, f: 0.9 },
  // Fruits
  { name: 'Banane', unit: 'piece', cal: 90, p: 1.1, c: 23, f: 0.3 },
  { name: 'Pomme', unit: 'piece', cal: 72, p: 0.4, c: 19, f: 0.2 },
  { name: 'Myrtilles', unit: 'g', cal: 0.57, p: 0.0074, c: 0.145, f: 0.003 },
  { name: 'Fraises', unit: 'g', cal: 0.32, p: 0.0067, c: 0.077, f: 0.003 },
  { name: 'Orange', unit: 'piece', cal: 62, p: 1.2, c: 15, f: 0.2 },
  // Legumes
  { name: 'Brocoli', unit: 'g', cal: 0.34, p: 0.028, c: 0.065, f: 0.004 },
  { name: 'Epinards', unit: 'g', cal: 0.23, p: 0.029, c: 0.036, f: 0.004 },
  { name: 'Haricots verts', unit: 'g', cal: 0.31, p: 0.018, c: 0.07, f: 0.001 },
  { name: 'Carotte', unit: 'g', cal: 0.41, p: 0.009, c: 0.096, f: 0.002 },
  { name: 'Courgette', unit: 'g', cal: 0.17, p: 0.012, c: 0.033, f: 0.003 },
  { name: 'Concombre', unit: 'g', cal: 0.15, p: 0.006, c: 0.036, f: 0.001 },
  // Graisses / lipides
  { name: 'Huile olive', unit: 'ml', cal: 8.8, p: 0, c: 0, f: 1 },
  { name: 'Beurre cacahuete', unit: 'g', cal: 5.94, p: 0.238, c: 0.2, f: 0.5 },
  { name: 'Avocat', unit: 'piece', cal: 240, p: 3, c: 12, f: 22 },
  { name: 'Amandes', unit: 'g', cal: 5.78, p: 0.213, c: 0.216, f: 0.493 },
  { name: 'Noix', unit: 'g', cal: 6.54, p: 0.152, c: 0.138, f: 0.654 },
];

// ── STATE ─────────────────────────────────────────────────────────────────────
let FOOD_DB = [...FOOD_DB_DEFAULT];
let customFoods = [];

let todayEntries = [];
let goals = { calories: 2500, protein: 180, carbs: 250, fat: 70 };
let selectedFood = null;
let selectedQty = 100;
let selectedMeal = 'breakfast'; // default meal for current add session
let activeTab = 'journal';
let _lastSearchValue = '';

// ── LOAD ──────────────────────────────────────────────────────────────────────
export async function loadNutrition() {
  try {
    const savedGoals = localStorage.getItem('nutri_goals');
    if (savedGoals) goals = { ...goals, ...JSON.parse(savedGoals) };

    // Auto-detect meal based on current hour
    selectedMeal = _guessMeal();

    const today = new Date().toISOString().slice(0, 10);
    const [logs, customs] = await Promise.all([
      sbSelect('nutrition_logs', 'user_id=eq.' + _session.user.id + '&date=eq.' + today + '&order=meal_order.asc,created_at.asc'),
      sbSelect('custom_foods', 'user_id=eq.' + _session.user.id + '&order=created_at').catch(() => []),
    ]);
    todayEntries = logs || [];
    customFoods  = customs || [];
    _rebuildFoodDB();
  } catch (e) {
    todayEntries = [];
    customFoods  = [];
  }
  renderNutrition();
}

function _guessMeal() {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 17) return 'snack';
  if (h < 21) return 'dinner';
  return 'supper';
}

function _rebuildFoodDB() {
  const customMapped = customFoods.map(f => ({
    name: f.name, unit: f.unit,
    cal: f.cal_per_unit, p: f.p_per_unit, c: f.c_per_unit, f: f.f_per_unit,
    _custom: true, _id: f.id,
  }));
  FOOD_DB = [...customMapped, ...FOOD_DB_DEFAULT];
}

// ── ENTRIES ───────────────────────────────────────────────────────────────────
export async function addEntry(food, qty) {
  const today = new Date().toISOString().slice(0, 10);
  const meal  = MEALS.find(m => m.id === selectedMeal) || MEALS[0];
  const entry = {
    user_id:    _session.user.id,
    date:       today,
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
    todayEntries.push(d[0] || entry);
    // Keep sorted
    todayEntries.sort((a, b) => a.meal_order - b.meal_order);
  } catch (e) {
    todayEntries.push({ ...entry, id: Date.now().toString() });
  }
  selectedFood = null;
  _lastSearchValue = '';
  activeTab = 'journal';
  renderNutrition();
  toast(`Ajouté au ${meal.label} ✓`);
}

export async function deleteEntry(id) {
  try { await sbDelete('nutrition_logs', 'id=eq.' + id); } catch (e) {}
  todayEntries = todayEntries.filter(e => e.id !== id);
  renderNutrition();
}

export function saveGoals(g) {
  goals = g;
  localStorage.setItem('nutri_goals', JSON.stringify(goals));
  activeTab = 'journal';
  renderNutrition();
  toast('Objectifs sauvegardés ✓');
}

// ── CUSTOM FOOD ───────────────────────────────────────────────────────────────
export async function saveCustomFood() {
  const name = document.getElementById('cf-name')?.value.trim();
  const unit = document.getElementById('cf-unit')?.value || 'g';
  const cal  = parseFloat(document.getElementById('cf-cal')?.value);
  const p    = parseFloat(document.getElementById('cf-p')?.value) || 0;
  const c    = parseFloat(document.getElementById('cf-c')?.value) || 0;
  const f    = parseFloat(document.getElementById('cf-f')?.value) || 0;

  if (!name)   { toast('Donne un nom à cet aliment.', true); return; }
  if (isNaN(cal)) { toast('Saisis les calories.', true); return; }

  const isPerHundred = unit === 'g' || unit === 'ml';
  const div = isPerHundred ? 100 : 1;

  const food = {
    user_id: _session.user.id,
    name, unit,
    cal_per_unit: cal / div,
    p_per_unit:   p   / div,
    c_per_unit:   c   / div,
    f_per_unit:   f   / div,
  };

  try {
    const d = await sbInsert('custom_foods', food);
    const saved = d[0] || { ...food, id: Date.now().toString() };
    customFoods.push(saved);
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
function totalToday() {
  return todayEntries.reduce((acc, e) => ({
    cal: acc.cal + (e.calories || 0),
    p:   acc.p   + (e.protein  || 0),
    c:   acc.c   + (e.carbs    || 0),
    f:   acc.f   + (e.fat      || 0),
  }), { cal: 0, p: 0, c: 0, f: 0 });
}

function totalForMeal(mealId) {
  return todayEntries.filter(e => e.meal === mealId).reduce((acc, e) => ({
    cal: acc.cal + (e.calories || 0),
    p:   acc.p   + (e.protein  || 0),
    c:   acc.c   + (e.carbs    || 0),
    f:   acc.f   + (e.fat      || 0),
  }), { cal: 0, p: 0, c: 0, f: 0 });
}

// ── RENDER ────────────────────────────────────────────────────────────────────
export function renderNutrition() {
  const container = document.getElementById('tab-nutrition');
  if (!container) return;

  const total  = totalToday();
  const pctCal = Math.min(100, Math.round(total.cal / goals.calories * 100));
  const pctP   = Math.min(100, Math.round(total.p   / goals.protein  * 100));
  const pctC   = Math.min(100, Math.round(total.c   / goals.carbs    * 100));
  const pctF   = Math.min(100, Math.round(total.f   / goals.fat      * 100));
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  container.innerHTML = `
    <div>
      <div class="page-title">Nutrition</div>
      <div class="page-sub">${dateStr}</div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="filter-pill${activeTab==='journal'  ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('journal'))">Journal</button>
      <button class="filter-pill${activeTab==='search'   ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('search'))">+ Ajouter</button>
      <button class="filter-pill${activeTab==='add-food' ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('add-food'))">Nouvel aliment</button>
      <button class="filter-pill${activeTab==='goals'    ?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('goals'))">Objectifs</button>
    </div>
    ${activeTab === 'journal'  ? renderJournal(total, pctCal, pctP, pctC, pctF) : ''}
    ${activeTab === 'search'   ? renderSearch() : ''}
    ${activeTab === 'add-food' ? renderAddFood() : ''}
    ${activeTab === 'goals'    ? renderGoals() : ''}
    <div style="height:8px;"></div>
  `;

  if (activeTab === 'search')   bindSearchEvents();
  if (activeTab === 'goals')    bindGoalEvents();
  if (activeTab === 'add-food') bindAddFoodEvents();
}

// ── JOURNAL ───────────────────────────────────────────────────────────────────
function renderJournal(total, pctCal, pctP, pctC, pctF) {
  const calColor = pctCal >= 100 ? 'var(--danger)' : 'var(--accent)';

  // Group entries by meal, keep only meals that have entries, in order
  const mealGroups = MEALS
    .map(m => ({ meal: m, entries: todayEntries.filter(e => e.meal === m.id) }))
    .filter(g => g.entries.length > 0);

  const journalHTML = mealGroups.length === 0
    ? `<div class="empty" style="padding:24px 0 8px"><span>🥗</span>Aucun aliment ajouté aujourd'hui<br><span style="font-size:12px;margin-top:4px;display:block">Appuie sur "+ Ajouter" pour commencer</span></div>`
    : mealGroups.map(({ meal, entries }) => {
        const mTotal = totalForMeal(meal.id);
        const rows = entries.map(e => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:0.5px solid var(--border);">
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.food_name}</div>
              <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;margin-top:1px;">
                ${e.quantity}${getUnitLabel(e.food_name)}
                &nbsp;·&nbsp;<span style="color:#4fc3f7">${e.protein}g P</span>
                &nbsp;·&nbsp;<span style="color:#ffb74d">${e.carbs}g G</span>
                &nbsp;·&nbsp;<span style="color:#f06292">${e.fat}g L</span>
              </div>
            </div>
            <div style="font-size:12px;font-weight:600;font-family:'DM Mono',monospace;color:var(--text2);flex-shrink:0;">${e.calories} kcal</div>
            <button class="hist-del" onclick="import('./js/nutrition.js').then(m=>m.deleteEntry('${e.id}'))">✕</button>
          </div>`).join('');

        return `
          <div style="margin-bottom:10px;">
            <!-- Meal header -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg3);border-radius:var(--radius-sm) var(--radius-sm) 0 0;border:0.5px solid var(--border);border-bottom:none;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">${meal.emoji}</span>
                <span style="font-size:13px;font-weight:600;color:var(--text);">${meal.label}</span>
                <span style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;">${entries.length} aliment${entries.length > 1 ? 's' : ''}</span>
              </div>
              <div style="text-align:right;">
                <div style="font-size:13px;font-weight:600;font-family:'DM Mono',monospace;color:var(--accent);">${mTotal.cal} kcal</div>
                <div style="font-size:10px;color:var(--text3);font-family:'DM Mono',monospace;">
                  <span style="color:#4fc3f7">${mTotal.p.toFixed(0)}P</span>
                  <span style="color:var(--text3)"> · </span>
                  <span style="color:#ffb74d">${mTotal.c.toFixed(0)}G</span>
                  <span style="color:var(--text3)"> · </span>
                  <span style="color:#f06292">${mTotal.f.toFixed(0)}L</span>
                </div>
              </div>
            </div>
            <!-- Entries -->
            <div style="background:var(--bg2);border:0.5px solid var(--border);border-top:none;border-radius:0 0 var(--radius-sm) var(--radius-sm);padding:0 12px;">
              ${rows}
            </div>
          </div>`;
      }).join('');

  return `
    <!-- CALORIE RING + MACROS MINI -->
    <div class="card" style="text-align:center;padding:20px 16px 16px;">
      <div style="position:relative;width:130px;height:130px;margin:0 auto 12px;">
        <svg width="130" height="130" style="transform:rotate(-90deg)">
          <circle cx="65" cy="65" r="55" fill="none" stroke="var(--bg3)" stroke-width="12"/>
          <circle cx="65" cy="65" r="55" fill="none" stroke="${calColor}" stroke-width="12"
            stroke-dasharray="${2*Math.PI*55}" stroke-dashoffset="${2*Math.PI*55*(1-pctCal/100)}"
            stroke-linecap="round" style="transition:stroke-dashoffset 0.6s ease"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-family:'DM Mono',monospace;font-size:26px;font-weight:600;color:var(--text);line-height:1;">${total.cal}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:2px;">/ ${goals.calories} kcal</div>
          <div style="font-size:10px;color:${pctCal >= 100 ? 'var(--danger)' : 'var(--text3)'};margin-top:1px;">${pctCal}%</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
        ${macroMini('Protéines', total.p, goals.protein, 'g', '#4fc3f7', pctP)}
        ${macroMini('Glucides',  total.c, goals.carbs,   'g', '#ffb74d', pctC)}
        ${macroMini('Lipides',   total.f, goals.fat,     'g', '#f06292', pctF)}
      </div>
    </div>

    <!-- MACRO BARS -->
    <div class="card" style="display:flex;flex-direction:column;gap:10px;">
      <div class="card-title">Macros du jour</div>
      ${macroBar('Protéines', total.p, goals.protein, 'g', '#4fc3f7', pctP)}
      ${macroBar('Glucides',  total.c, goals.carbs,   'g', '#ffb74d', pctC)}
      ${macroBar('Lipides',   total.f, goals.fat,     'g', '#f06292', pctF)}
    </div>

    <!-- JOURNAL PAR REPAS -->
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="font-size:11px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:1px;font-family:'DM Mono',monospace;">Journal du jour</div>
        <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;">${todayEntries.length} aliment${todayEntries.length !== 1 ? 's' : ''}</div>
      </div>
      ${journalHTML}
    </div>`;
}

function macroMini(label, val, goal, unit, color, pct) {
  return `
    <div style="text-align:center;">
      <div style="font-size:16px;font-weight:600;color:${color};font-family:'DM Mono',monospace;">${val.toFixed(0)}<span style="font-size:10px;font-weight:400;color:var(--text3)">${unit}</span></div>
      <div style="font-size:10px;color:var(--text3);margin:2px 0 4px;">${label}</div>
      <div style="height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;">
        <div style="height:3px;background:${color};border-radius:2px;width:${pct}%;"></div>
      </div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px;">${pct}%</div>
    </div>`;
}

function macroBar(label, val, goal, unit, color, pct) {
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

function getUnitLabel(name) {
  const f = FOOD_DB.find(x => x.name === name);
  if (!f) return 'g';
  if (f.unit === 'g' || f.unit === 'ml') return f.unit;
  return ' ' + f.unit;
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function renderSearch() {
  if (selectedFood) {
    const food = selectedFood;
    const qty  = selectedQty;
    const isCountable = !['g', 'ml'].includes(food.unit);
    const calc = {
      cal: Math.round(food.cal * qty),
      p: +(food.p * qty).toFixed(1),
      c: +(food.c * qty).toFixed(1),
      f: +(food.f * qty).toFixed(1),
    };

    // Meal selector pills
    const mealPills = MEALS.map(m => `
      <button class="filter-pill${selectedMeal === m.id ? ' active' : ''}"
        style="font-size:12px;"
        onclick="import('./js/nutrition.js').then(mod=>mod.setMeal('${m.id}'))">
        ${m.emoji} ${m.label}
      </button>`).join('');

    return `
      <div class="card" id="nutri-detail">
        <!-- Back + name -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <button id="back-to-search" style="background:transparent;border:none;color:var(--text2);font-size:20px;cursor:pointer;line-height:1;">&#8592;</button>
          <div>
            <div style="font-size:16px;font-weight:600;color:var(--text);">${food.name}</div>
            ${food._custom ? '<div style="font-size:11px;color:var(--accent);margin-top:1px;">✦ Aliment perso</div>' : ''}
          </div>
        </div>

        <!-- Quantity -->
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;">
            Quantité (${food.unit})
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <button id="qty-minus" style="width:40px;height:40px;border-radius:50%;border:0.5px solid var(--border2);background:var(--bg3);color:var(--text);font-size:20px;cursor:pointer;line-height:1;">&#8722;</button>
            <input type="number" id="qty-input" value="${qty}" min="${isCountable ? 1 : 10}" step="${isCountable ? 1 : 10}" inputmode="decimal"
              style="flex:1;text-align:center;font-size:22px;font-weight:600;font-family:'DM Mono',monospace;background:var(--bg3);border:0.5px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);padding:10px;">
            <button id="qty-plus" style="width:40px;height:40px;border-radius:50%;border:0.5px solid var(--border2);background:var(--bg3);color:var(--text);font-size:20px;cursor:pointer;line-height:1;">+</button>
          </div>
        </div>

        <!-- Macro preview -->
        <div id="macro-preview" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:16px;">
          ${qtyMacro('Calories', calc.cal, 'kcal', 'var(--accent)')}
          ${qtyMacro('Protéines', calc.p, 'g', '#4fc3f7')}
          ${qtyMacro('Glucides', calc.c, 'g', '#ffb74d')}
          ${qtyMacro('Lipides', calc.f, 'g', '#f06292')}
        </div>

        <!-- Meal selector -->
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;color:var(--text3);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;">
            Ajouter à...
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${mealPills}
          </div>
        </div>

        <button class="btn-primary" id="add-food-btn">
          Ajouter au ${MEALS.find(m => m.id === selectedMeal)?.emoji} ${MEALS.find(m => m.id === selectedMeal)?.label}
        </button>
      </div>`;
  }

  return `
    <div class="card" id="nutri-search-card">
      <div class="card-header" style="margin-bottom:10px;">
        <span class="card-title">Base d'aliments (${FOOD_DB.length})</span>
        ${customFoods.length ? `<span style="font-size:11px;color:var(--accent);font-family:'DM Mono',monospace;">${customFoods.length} perso</span>` : ''}
      </div>
      <input type="text" id="food-search-input"
        placeholder="Rechercher un aliment..."
        autocomplete="off"
        style="width:100%;background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;padding:8px 12px;margin-bottom:10px;font-family:'DM Sans',sans-serif;direction:ltr;unicode-bidi:normal;">
      <div id="food-list-container" style="max-height:340px;overflow-y:auto;"></div>
    </div>`;
}

function renderFoodList(query) {
  const container = document.getElementById('food-list-container');
  if (!container) return;
  const q = (query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filtered = FOOD_DB.filter(food =>
    !q || food.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
  );
  container.innerHTML = '';
  if (!filtered.length) {
    container.innerHTML = '<div style="padding:12px 14px;font-size:13px;color:var(--text3);">Aucun aliment trouvé</div>';
    return;
  }
  filtered.forEach(food => {
    const row = document.createElement('div');
    row.className = 'ex-dropdown-item';
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
      selectedFood = food;
      selectedQty  = isPerGram ? 100 : 1;
      renderNutrition();
    });
    const delBtn = row.querySelector('[data-id]');
    if (delBtn) delBtn.addEventListener('click', e => { e.stopPropagation(); deleteCustomFood(food._id); });
    container.appendChild(row);
  });
}

function qtyMacro(label, val, unit, color) {
  return `
    <div style="background:var(--bg3);border-radius:var(--radius-sm);padding:10px 8px;text-align:center;">
      <div style="font-size:15px;font-weight:600;color:${color};font-family:'DM Mono',monospace;">${val}</div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
    </div>`;
}

function updateMacroPreview() {
  if (!selectedFood) return;
  const calc = {
    cal: Math.round(selectedFood.cal * selectedQty),
    p: +(selectedFood.p * selectedQty).toFixed(1),
    c: +(selectedFood.c * selectedQty).toFixed(1),
    f: +(selectedFood.f * selectedQty).toFixed(1),
  };
  const preview = document.getElementById('macro-preview');
  if (preview) {
    preview.innerHTML =
      qtyMacro('Calories',  calc.cal, 'kcal', 'var(--accent)') +
      qtyMacro('Protéines', calc.p,   'g',    '#4fc3f7') +
      qtyMacro('Glucides',  calc.c,   'g',    '#ffb74d') +
      qtyMacro('Lipides',   calc.f,   'g',    '#f06292');
  }
  const inp = document.getElementById('qty-input');
  if (inp) inp.value = selectedQty;
  // Update button label
  const btn = document.getElementById('add-food-btn');
  if (btn) {
    const meal = MEALS.find(m => m.id === selectedMeal);
    btn.textContent = `Ajouter au ${meal?.emoji} ${meal?.label}`;
  }
}

function bindSearchEvents() {
  if (selectedFood) {
    const isCountable = !['g', 'ml'].includes(selectedFood.unit);
    const step = isCountable ? 1 : 10;
    document.getElementById('back-to-search')?.addEventListener('click', () => { selectedFood = null; renderNutrition(); });
    document.getElementById('qty-minus')?.addEventListener('click', () => { selectedQty = Math.max(isCountable ? 1 : 10, selectedQty - step); updateMacroPreview(); });
    document.getElementById('qty-plus')?.addEventListener('click',  () => { selectedQty += step; updateMacroPreview(); });
    document.getElementById('qty-input')?.addEventListener('input', e => { selectedQty = parseFloat(e.target.value) || (isCountable ? 1 : 10); updateMacroPreview(); });
    document.getElementById('add-food-btn')?.addEventListener('click', () => addEntry(selectedFood, selectedQty));
    return;
  }

  const inp = document.getElementById('food-search-input');
  if (inp) {
    inp.value = _lastSearchValue;
    renderFoodList(_lastSearchValue);
    inp.addEventListener('input', () => { _lastSearchValue = inp.value; renderFoodList(inp.value); });
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
        <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;">Nom de l'aliment</label>
        <input type="text" id="cf-name" placeholder="Ex: Crêpe maison, Mon shake..."
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
      <div id="cf-hint" style="font-size:12px;color:var(--accent);margin-bottom:12px;padding:8px 10px;background:var(--accent-dim);border-radius:var(--radius-sm);border:0.5px solid rgba(200,241,53,0.2);">
        Entrez les valeurs pour 100g
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
        ${cfField('cf-cal', 'Calories (kcal)')}
        ${cfField('cf-p',   'Protéines (g)')}
        ${cfField('cf-c',   'Glucides (g)')}
        ${cfField('cf-f',   'Lipides (g)')}
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

function cfField(id, label) {
  return `
    <div class="field">
      <label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.7px;font-family:'DM Mono',monospace;margin-bottom:4px;">${label}</label>
      <input type="number" id="${id}" placeholder="0" min="0" step="0.1" inputmode="decimal" value=""
        style="background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:15px;font-weight:600;padding:9px 10px;font-family:'DM Mono',monospace;width:100%;-moz-appearance:textfield;">
    </div>`;
}

function bindAddFoodEvents() {
  document.getElementById('save-cf-btn')?.addEventListener('click', saveCustomFood);
  const unitSel = document.getElementById('cf-unit');
  const hint    = document.getElementById('cf-hint');
  if (unitSel && hint) {
    unitSel.addEventListener('change', () => {
      const u = unitSel.value;
      const per100 = u === 'g' || u === 'ml';
      hint.textContent = per100 ? `Entrez les valeurs pour 100${u}` : `Entrez les valeurs par ${u}`;
    });
  }
}

// ── GOALS ─────────────────────────────────────────────────────────────────────
function renderGoals() {
  return `
    <div class="card">
      <div class="card-header" style="margin-bottom:14px;"><span class="card-title">Mes objectifs</span></div>
      ${goalField('goal-cal', 'Calories', goals.calories, 'kcal/jour', 1000, 5000, 50)}
      ${goalField('goal-p',   'Protéines', goals.protein,  'g/jour',   50,   300,  5)}
      ${goalField('goal-c',   'Glucides',  goals.carbs,    'g/jour',   50,   600,  10)}
      ${goalField('goal-f',   'Lipides',   goals.fat,      'g/jour',   20,   200,  5)}
      <button class="btn-primary" id="save-goals-btn" style="margin-top:6px;">Sauvegarder les objectifs</button>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:10px;">Calculateur rapide</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:12px;">Estimation Mifflin-St Jeor selon ton profil</div>
      ${calcField('calc-weight', 'Poids (kg)', 75, 40, 150, 1)}
      ${calcField('calc-age',    'Âge',        25, 15, 80,  1)}
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
          <option value="1.2">Sédentaire (peu ou pas d'exercice)</option>
          <option value="1.375">Légèrement actif (1-3×/sem)</option>
          <option value="1.55" selected>Modérément actif (3-5×/sem)</option>
          <option value="1.725">Très actif (6-7×/sem)</option>
          <option value="1.9">Extrêmement actif (pro)</option>
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

function goalField(id, label, val, unit, min, max, step) {
  return `
    <div class="field" style="margin-bottom:12px;">
      <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;display:flex;justify-content:space-between;margin-bottom:6px;">
        <span>${label}</span><span style="color:var(--text2);font-size:10px;">${unit}</span>
      </label>
      <input type="number" id="${id}" value="${val}" min="${min}" max="${max}" step="${step}" inputmode="decimal"
        style="background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:15px;font-weight:600;padding:10px 14px;font-family:'DM Mono',monospace;width:100%;">
    </div>`;
}

function calcField(id, label, val, min, max, step) {
  return `
    <div class="field" style="margin-bottom:10px;">
      <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;margin-bottom:6px;">${label}</label>
      <input type="number" id="${id}" value="${val}" min="${min}" max="${max}" step="${step}" inputmode="decimal"
        style="background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:15px;padding:9px 14px;font-family:'DM Mono',monospace;width:100%;">
    </div>`;
}

let _calcSex = 'm';
let _calcObj = 'maintain';
let _calcResult = null;

function bindGoalEvents() {
  document.getElementById('save-goals-btn')?.addEventListener('click', () => {
    saveGoals({
      calories: +document.getElementById('goal-cal').value || 2500,
      protein:  +document.getElementById('goal-p').value  || 180,
      carbs:    +document.getElementById('goal-c').value  || 250,
      fat:      +document.getElementById('goal-f').value  || 70,
    });
  });
  document.getElementById('calc-btn')?.addEventListener('click', () => {
    const w   = +document.getElementById('calc-weight').value   || 75;
    const age = +document.getElementById('calc-age').value      || 25;
    const act = +document.getElementById('calc-activity').value || 1.55;
    const bmr = _calcSex === 'm'
      ? 10 * w + 6.25 * 175 - 5 * age + 5
      : 10 * w + 6.25 * 162 - 5 * age - 161;
    let tdee = Math.round(bmr * act);
    if (_calcObj === 'bulk') tdee += 300;
    if (_calcObj === 'cut')  tdee -= 400;
    const protein = Math.round(w * 2);
    const fat     = Math.round(w * 1);
    const carbs   = Math.round((tdee - protein * 4 - fat * 9) / 4);
    _calcResult = { calories: tdee, protein, carbs, fat };
    document.getElementById('calc-result-text').innerHTML =
      `<strong style="color:var(--accent);font-size:15px;">${tdee} kcal/jour</strong><br>
       <span style="color:#4fc3f7;">Protéines : ${protein}g</span> &nbsp;·&nbsp;
       <span style="color:#ffb74d;">Glucides : ${carbs}g</span> &nbsp;·&nbsp;
       <span style="color:#f06292;">Lipides : ${fat}g</span>`;
    document.getElementById('calc-result').style.display = 'block';
    document.getElementById('apply-calc-btn')?.addEventListener('click', () => { if (_calcResult) saveGoals(_calcResult); });
  });
}

// ── PUBLIC HELPERS ────────────────────────────────────────────────────────────
export function setNutriTab(t) {
  activeTab = t;
  selectedFood = null;
  if (t !== 'search') _lastSearchValue = '';
  renderNutrition();
}

export function setMeal(id) {
  selectedMeal = id;
  // Update pill highlights without full re-render
  document.querySelectorAll('#nutri-detail .filter-pill').forEach(btn => {
    const isActive = btn.textContent.includes(MEALS.find(m => m.id === id)?.label || '');
    btn.classList.toggle('active', isActive);
  });
  const btn = document.getElementById('add-food-btn');
  if (btn) {
    const meal = MEALS.find(m => m.id === id);
    btn.textContent = `Ajouter au ${meal?.emoji} ${meal?.label}`;
  }
}

export function setSex(s) {
  _calcSex = s;
  document.getElementById('sex-m')?.classList.toggle('active', s === 'm');
  document.getElementById('sex-f')?.classList.toggle('active', s === 'f');
}

export function setObj(o) {
  _calcObj = o;
  ['maintain', 'bulk', 'cut'].forEach(x =>
    document.getElementById('obj-' + x)?.classList.toggle('active', x === o)
  );
}
