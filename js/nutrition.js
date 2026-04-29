// ── NUTRITION ─────────────────────────────────────────────────────────────────
import { _session, sbSelect, sbInsert, sbDelete, sbUpsert } from './supabase.js';
import { toast } from './main.js';

// ── FOOD DATABASE ─────────────────────────────────────────────────────────────
export const FOOD_DB = [
  // Protéines animales
  { name: 'Poulet (blanc)', unit: 'g', cal: 1.65, p: 0.31, c: 0, f: 0.036 },
  { name: 'Steak haché 5%', unit: 'g', cal: 1.21, p: 0.21, c: 0, f: 0.05 },
  { name: 'Saumon', unit: 'g', cal: 2.08, p: 0.20, c: 0, f: 0.13 },
  { name: 'Thon (boîte)', unit: 'g', cal: 1.16, p: 0.26, c: 0, f: 0.01 },
  { name: 'Cabillaud', unit: 'g', cal: 0.82, p: 0.18, c: 0, f: 0.007 },
  { name: 'Crevettes', unit: 'g', cal: 0.85, p: 0.18, c: 0.001, f: 0.006 },
  { name: 'Oeuf entier', unit: 'pièce', cal: 78, p: 6, c: 0.6, f: 5.3 },
  { name: 'Blanc d\'oeuf', unit: 'pièce', cal: 17, p: 3.6, c: 0.2, f: 0.06 },
  { name: 'Jambon blanc (tranche)', unit: 'tranche', cal: 35, p: 5.5, c: 0.5, f: 1.2 },
  { name: 'Dinde (escalope)', unit: 'g', cal: 1.09, p: 0.24, c: 0, f: 0.015 },
  // Laitiers
  { name: 'Fromage blanc 0%', unit: 'g', cal: 0.45, p: 0.085, c: 0.04, f: 0.002 },
  { name: 'Skyr nature', unit: 'g', cal: 0.63, p: 0.11, c: 0.04, f: 0.002 },
  { name: 'Yaourt grec 0%', unit: 'g', cal: 0.53, p: 0.10, c: 0.035, f: 0.002 },
  { name: 'Lait écrémé', unit: 'ml', cal: 0.35, p: 0.034, c: 0.049, f: 0.001 },
  { name: 'Lait entier', unit: 'ml', cal: 0.61, p: 0.032, c: 0.048, f: 0.033 },
  { name: 'Cottage cheese', unit: 'g', cal: 0.98, p: 0.113, c: 0.034, f: 0.043 },
  { name: 'Mozzarella', unit: 'g', cal: 2.54, p: 0.18, c: 0.027, f: 0.197 },
  { name: 'Parmesan', unit: 'g', cal: 3.92, p: 0.358, c: 0.032, f: 0.256 },
  // Protéines veg & compléments
  { name: 'Whey protéine', unit: 'g', cal: 4.0, p: 0.80, c: 0.06, f: 0.06 },
  { name: 'Tofu nature', unit: 'g', cal: 0.76, p: 0.082, c: 0.018, f: 0.046 },
  { name: 'Edamame', unit: 'g', cal: 1.21, p: 0.118, c: 0.085, f: 0.05 },
  { name: 'Lentilles cuites', unit: 'g', cal: 1.16, p: 0.09, c: 0.2, f: 0.004 },
  { name: 'Pois chiches cuits', unit: 'g', cal: 1.64, p: 0.086, c: 0.274, f: 0.026 },
  // Glucides / féculents
  { name: 'Riz blanc cuit', unit: 'g', cal: 1.3, p: 0.027, c: 0.283, f: 0.003 },
  { name: 'Riz complet cuit', unit: 'g', cal: 1.11, p: 0.026, c: 0.23, f: 0.009 },
  { name: 'Pâtes cuites', unit: 'g', cal: 1.31, p: 0.05, c: 0.25, f: 0.011 },
  { name: 'Flocons d\'avoine', unit: 'g', cal: 3.68, p: 0.131, c: 0.581, f: 0.07 },
  { name: 'Pain complet (tranche)', unit: 'tranche', cal: 68, p: 3, c: 12, f: 1 },
  { name: 'Patate douce', unit: 'g', cal: 0.86, p: 0.016, c: 0.202, f: 0.001 },
  { name: 'Pomme de terre', unit: 'g', cal: 0.77, p: 0.02, c: 0.17, f: 0.001 },
  { name: 'Quinoa cuit', unit: 'g', cal: 1.20, p: 0.044, c: 0.215, f: 0.019 },
  { name: 'Pain de mie (tranche)', unit: 'tranche', cal: 65, p: 2.4, c: 12, f: 0.9 },
  // Fruits
  { name: 'Banane', unit: 'pièce', cal: 90, p: 1.1, c: 23, f: 0.3 },
  { name: 'Pomme', unit: 'pièce', cal: 72, p: 0.4, c: 19, f: 0.2 },
  { name: 'Myrtilles', unit: 'g', cal: 0.57, p: 0.0074, c: 0.145, f: 0.003 },
  { name: 'Fraises', unit: 'g', cal: 0.32, p: 0.0067, c: 0.077, f: 0.003 },
  { name: 'Orange', unit: 'pièce', cal: 62, p: 1.2, c: 15, f: 0.2 },
  // Légumes
  { name: 'Brocoli', unit: 'g', cal: 0.34, p: 0.028, c: 0.065, f: 0.004 },
  { name: 'Épinards', unit: 'g', cal: 0.23, p: 0.029, c: 0.036, f: 0.004 },
  { name: 'Haricots verts', unit: 'g', cal: 0.31, p: 0.018, c: 0.07, f: 0.001 },
  { name: 'Carotte', unit: 'g', cal: 0.41, p: 0.009, c: 0.096, f: 0.002 },
  { name: 'Courgette', unit: 'g', cal: 0.17, p: 0.012, c: 0.033, f: 0.003 },
  { name: 'Concombre', unit: 'g', cal: 0.15, p: 0.006, c: 0.036, f: 0.001 },
  // Graisses / lipides
  { name: 'Huile d\'olive', unit: 'ml', cal: 8.8, p: 0, c: 0, f: 1 },
  { name: 'Beurre de cacahuète', unit: 'g', cal: 5.94, p: 0.238, c: 0.2, f: 0.5 },
  { name: 'Avocat', unit: 'pièce', cal: 240, p: 3, c: 12, f: 22 },
  { name: 'Amandes', unit: 'g', cal: 5.78, p: 0.213, c: 0.216, f: 0.493 },
  { name: 'Noix', unit: 'g', cal: 6.54, p: 0.152, c: 0.138, f: 0.654 },
];

// ── STATE ─────────────────────────────────────────────────────────────────────
let todayEntries = [];
let goals = { calories: 2500, protein: 180, carbs: 250, fat: 70 };
let searchQuery = '';
let selectedFood = null;
let selectedQty = 100;
let activeTab = 'journal'; // 'journal' | 'search' | 'goals'

// ── LOAD / SAVE ───────────────────────────────────────────────────────────────
export async function loadNutrition() {
  try {
    // Load goals from localStorage
    const savedGoals = localStorage.getItem('nutri_goals');
    if (savedGoals) goals = { ...goals, ...JSON.parse(savedGoals) };

    // Load today's entries from Supabase
    const today = new Date().toISOString().slice(0, 10);
    const d = await sbSelect('nutrition_logs',
      'user_id=eq.' + _session.user.id + '&date=eq.' + today + '&order=created_at');
    todayEntries = d || [];
  } catch (e) {
    // Table might not exist yet — graceful fallback
    todayEntries = [];
  }
  renderNutrition();
}

export async function addEntry(food, qty) {
  const today = new Date().toISOString().slice(0, 10);
  const entry = {
    user_id: _session.user.id,
    date: today,
    food_name: food.name,
    quantity: qty,
    calories: Math.round(calcPer(food.cal, food.unit, qty)),
    protein:  +calcPer(food.p, food.unit, qty).toFixed(1),
    carbs:    +calcPer(food.c, food.unit, qty).toFixed(1),
    fat:      +calcPer(food.f, food.unit, qty).toFixed(1),
  };
  try {
    const d = await sbInsert('nutrition_logs', entry);
    todayEntries.push(d[0] || entry);
  } catch (e) {
    // If table doesn't exist, store locally
    todayEntries.push({ ...entry, id: Date.now().toString() });
  }
  selectedFood = null;
  searchQuery = '';
  activeTab = 'journal';
  renderNutrition();
  toast('Ajouté ✓');
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
  toast('Objectifs mis à jour ✓');
}

// ── CALCULATIONS ──────────────────────────────────────────────────────────────
function calcPer(perUnit, unit, qty) {
  // For per-gram/ml foods, multiply qty (in g/ml)
  // For per-piece/tranche foods, multiply qty (number of pieces)
  return perUnit * qty;
}

export function calcFood(food, qty) {
  return {
    cal: Math.round(calcPer(food.cal, food.unit, qty)),
    p:   +calcPer(food.p, food.unit, qty).toFixed(1),
    c:   +calcPer(food.c, food.unit, qty).toFixed(1),
    f:   +calcPer(food.f, food.unit, qty).toFixed(1),
  };
}

function totalToday() {
  return todayEntries.reduce((acc, e) => ({
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

  const total = totalToday();
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

    <!-- TABS -->
    <div style="display:flex;gap:6px;">
      <button class="filter-pill${activeTab==='journal'?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('journal'))">Journal</button>
      <button class="filter-pill${activeTab==='search'?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('search'))">+ Ajouter</button>
      <button class="filter-pill${activeTab==='goals'?' active':''}" onclick="import('./js/nutrition.js').then(m=>m.setNutriTab('goals'))">Objectifs</button>
    </div>

    ${activeTab === 'journal' ? renderJournal(total, pctCal, pctP, pctC, pctF) : ''}
    ${activeTab === 'search'  ? renderSearch() : ''}
    ${activeTab === 'goals'   ? renderGoals() : ''}

    <div style="height:8px;"></div>
  `;

  if (activeTab === 'search') bindSearchEvents();
  if (activeTab === 'goals')  bindGoalEvents();
}

function renderJournal(total, pctCal, pctP, pctC, pctF) {
  const calColor = pctCal >= 100 ? 'var(--danger)' : 'var(--accent)';
  return `
    <!-- BIG CALORIE RING -->
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
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
        ${macroMini('Protéines', total.p, goals.protein, 'g', '#4fc3f7')}
        ${macroMini('Glucides', total.c, goals.carbs, 'g', '#ffb74d')}
        ${macroMini('Lipides', total.f, goals.fat, 'g', '#f06292')}
      </div>
    </div>

    <!-- MACRO BARS -->
    <div class="card" style="display:flex;flex-direction:column;gap:10px;">
      <div class="card-title">Macros</div>
      ${macroBar('Protéines', total.p, goals.protein, 'g', '#4fc3f7', pctP)}
      ${macroBar('Glucides',  total.c, goals.carbs,   'g', '#ffb74d', pctC)}
      ${macroBar('Lipides',   total.f, goals.fat,     'g', '#f06292', pctF)}
    </div>

    <!-- JOURNAL LIST -->
    <div class="card">
      <div class="card-header"><span class="card-title">Aujourd'hui</span><span style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;">${todayEntries.length} aliment${todayEntries.length>1?'s':''}</span></div>
      ${todayEntries.length === 0 ? '<div class="empty" style="padding:20px 0 8px"><span>🥗</span>Aucun aliment ajouté</div>' :
        todayEntries.map(e => `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:0.5px solid var(--border);">
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.food_name}</div>
              <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;margin-top:1px;">
                ${e.quantity}${getUnit(e.food_name)} · <span style="color:#4fc3f7">${e.protein}g P</span> · <span style="color:#ffb74d">${e.carbs}g C</span> · <span style="color:#f06292">${e.fat}g L</span>
              </div>
            </div>
            <div style="font-size:13px;font-weight:600;font-family:'DM Mono',monospace;color:var(--text);flex-shrink:0;">${e.calories} kcal</div>
            <button class="hist-del" onclick="import('./js/nutrition.js').then(m=>m.deleteEntry('${e.id}'))">✕</button>
          </div>`).join('')}
    </div>`;
}

function macroMini(label, val, goal, unit, color) {
  const pct = Math.min(100, Math.round(val / goal * 100));
  return `
    <div style="text-align:center;">
      <div style="font-size:16px;font-weight:600;color:${color};font-family:'DM Mono',monospace;">${val.toFixed(0)}<span style="font-size:10px;font-weight:400;color:var(--text3)">${unit}</span></div>
      <div style="font-size:10px;color:var(--text3);margin:2px 0 4px;">${label}</div>
      <div style="height:3px;background:var(--bg3);border-radius:2px;"><div style="height:3px;background:${color};border-radius:2px;width:${pct}%;transition:width 0.4s;"></div></div>
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

function getUnit(name) {
  const f = FOOD_DB.find(x => x.name === name);
  if (!f) return 'g';
  if (f.unit === 'g' || f.unit === 'ml') return f.unit;
  return ' ' + f.unit + (1 > 1 ? 's' : '');
}

function renderSearch() {
  const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const filtered = FOOD_DB.filter(f =>
    !q || f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q)
  );

  if (selectedFood) {
    const food = selectedFood;
    const qty = selectedQty;
    const calc = calcFood(food, qty);
    const isCountable = !['g','ml'].includes(food.unit);
    return `
      <div class="card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <button onclick="import('./js/nutrition.js').then(m=>m.clearFoodSelection())" style="background:transparent;border:none;color:var(--text2);font-size:20px;cursor:pointer;line-height:1;">←</button>
          <div style="font-size:16px;font-weight:600;color:var(--text);">${food.name}</div>
        </div>
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;font-family:'DM Mono',monospace;">
            ${isCountable ? 'Quantité (' + food.unit + 's)' : 'Quantité (' + food.unit + ')'}
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <button id="qty-minus" style="width:40px;height:40px;border-radius:50%;border:0.5px solid var(--border2);background:var(--bg3);color:var(--text);font-size:20px;cursor:pointer;line-height:1;">−</button>
            <input type="number" id="qty-input" value="${qty}" min="${isCountable?1:10}" step="${isCountable?1:10}" inputmode="decimal"
              style="flex:1;text-align:center;font-size:22px;font-weight:600;font-family:'DM Mono',monospace;background:var(--bg3);border:0.5px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);padding:10px;">
            <button id="qty-plus" style="width:40px;height:40px;border-radius:50%;border:0.5px solid var(--border2);background:var(--bg3);color:var(--text);font-size:20px;cursor:pointer;line-height:1;">+</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px;">
          ${qtyMacro('Calories', calc.cal, 'kcal', 'var(--accent)')}
          ${qtyMacro('Protéines', calc.p, 'g', '#4fc3f7')}
          ${qtyMacro('Glucides', calc.c, 'g', '#ffb74d')}
          ${qtyMacro('Lipides', calc.f, 'g', '#f06292')}
        </div>
        <button class="btn-primary" id="add-food-btn">Ajouter au journal</button>
      </div>`;
  }

  return `
    <div class="card">
      <div class="card-header" style="margin-bottom:10px;"><span class="card-title">Base d'aliments</span></div>
      <input type="text" id="food-search-input" value="${searchQuery}" placeholder="🔍 Rechercher un aliment..."
        style="width:100%;background:var(--bg3);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;padding:8px 12px;margin-bottom:10px;font-family:'DM Sans',sans-serif;">
      <div style="max-height:320px;overflow-y:auto;">
        ${filtered.length === 0 ? '<div style="padding:12px;font-size:13px;color:var(--text3);">Aucun aliment trouvé</div>' :
          filtered.map((food, i) => `
            <div class="ex-dropdown-item" id="food-item-${i}" style="border-radius:${i===0?'var(--radius-sm) var(--radius-sm)':'0'} 0 0;">
              <div>
                <div class="ex-dropdown-label">${food.name}</div>
                <div style="font-size:11px;color:var(--text3);margin-top:1px;">${
                  food.unit==='g'||food.unit==='ml' ? 
                  `pour 100${food.unit} · ${Math.round(food.cal*100)} kcal · ${(food.p*100).toFixed(0)}g P` :
                  `par ${food.unit} · ${Math.round(food.cal)} kcal · ${food.p.toFixed(0)}g P`
                }</div>
              </div>
              <span style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;flex-shrink:0;">${food.unit}</span>
            </div>`).join('')}
      </div>
    </div>`;
}

function qtyMacro(label, val, unit, color) {
  return `
    <div style="background:var(--bg3);border-radius:var(--radius-sm);padding:10px 8px;text-align:center;">
      <div style="font-size:15px;font-weight:600;color:${color};font-family:'DM Mono',monospace;">${val}</div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
    </div>`;
}

function renderGoals() {
  return `
    <div class="card">
      <div class="card-header" style="margin-bottom:14px;"><span class="card-title">Mes objectifs</span></div>
      ${goalField('goal-cal',  'Calories', goals.calories, 'kcal/jour', 1000, 5000, 50)}
      ${goalField('goal-p',   'Protéines', goals.protein,  'g/jour',    50,   300,  5)}
      ${goalField('goal-c',   'Glucides',  goals.carbs,    'g/jour',    50,   600,  10)}
      ${goalField('goal-f',   'Lipides',   goals.fat,      'g/jour',    20,   200,  5)}
      <button class="btn-primary" id="save-goals-btn" style="margin-top:6px;">Sauvegarder les objectifs</button>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:10px;">Calculateur rapide</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:12px;">Estimation basée sur ton poids / activité</div>
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
          <option value="1.375">Légèrement actif (1-3x/sem)</option>
          <option value="1.55" selected>Modérément actif (3-5x/sem)</option>
          <option value="1.725">Très actif (6-7x/sem)</option>
          <option value="1.9">Extrêmement actif (pro)</option>
        </select>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:12px;">
        <button class="filter-pill active" id="obj-maintain" onclick="import('./js/nutrition.js').then(m=>m.setObj('maintain'))">Maintien</button>
        <button class="filter-pill" id="obj-bulk" onclick="import('./js/nutrition.js').then(m=>m.setObj('bulk'))">Prise masse</button>
        <button class="filter-pill" id="obj-cut" onclick="import('./js/nutrition.js').then(m=>m.setObj('cut'))">Sèche</button>
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

// ── EVENT BINDING (called after render) ───────────────────────────────────────
function bindSearchEvents() {
  const inp = document.getElementById('food-search-input');
  if (inp) {
    inp.focus();
    inp.addEventListener('input', () => {
      searchQuery = inp.value;
      selectedFood = null;
      renderNutrition();
    });
  }

  // Food item clicks
  FOOD_DB.forEach((food, i) => {
    const el = document.getElementById('food-item-' + i);
    if (el) el.addEventListener('click', () => {
      selectedFood = food;
      selectedQty = ['g','ml'].includes(food.unit) ? 100 : 1;
      renderNutrition();
    });
  });

  // Qty controls
  const qtyInput = document.getElementById('qty-input');
  if (qtyInput && selectedFood) {
    const isCountable = !['g','ml'].includes(selectedFood.unit);
    const step = isCountable ? 1 : 10;
    document.getElementById('qty-minus')?.addEventListener('click', () => {
      selectedQty = Math.max(isCountable ? 1 : 10, selectedQty - step);
      document.getElementById('qty-input').value = selectedQty;
      refreshQtyDisplay();
    });
    document.getElementById('qty-plus')?.addEventListener('click', () => {
      selectedQty += step;
      document.getElementById('qty-input').value = selectedQty;
      refreshQtyDisplay();
    });
    qtyInput.addEventListener('input', () => {
      selectedQty = +qtyInput.value || (isCountable ? 1 : 10);
      refreshQtyDisplay();
    });
    document.getElementById('add-food-btn')?.addEventListener('click', () => {
      addEntry(selectedFood, selectedQty);
    });
  }
}

function refreshQtyDisplay() {
  if (!selectedFood) return;
  const calc = calcFood(selectedFood, selectedQty);
  // Re-render only the macro boxes without full re-render
  renderNutrition();
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
    const w = +document.getElementById('calc-weight').value || 75;
    const age = +document.getElementById('calc-age').value || 25;
    const act = +document.getElementById('calc-activity').value || 1.55;
    // Mifflin-St Jeor
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
    const el = document.getElementById('calc-result');
    document.getElementById('calc-result-text').innerHTML =
      `<strong style="color:var(--accent);font-size:15px;">${tdee} kcal/jour</strong><br>
       <span style="color:#4fc3f7;">Protéines : ${protein}g</span> · 
       <span style="color:#ffb74d;">Glucides : ${carbs}g</span> · 
       <span style="color:#f06292;">Lipides : ${fat}g</span>`;
    el.style.display = 'block';
    document.getElementById('apply-calc-btn')?.addEventListener('click', () => {
      if (_calcResult) saveGoals(_calcResult);
    });
  });
}

export function setNutriTab(t) { activeTab = t; selectedFood = null; searchQuery = ''; renderNutrition(); }
export function clearFoodSelection() { selectedFood = null; renderNutrition(); }
export function setSex(s) {
  _calcSex = s;
  document.getElementById('sex-m')?.classList.toggle('active', s === 'm');
  document.getElementById('sex-f')?.classList.toggle('active', s === 'f');
}
export function setObj(o) {
  _calcObj = o;
  ['maintain','bulk','cut'].forEach(x => document.getElementById('obj-'+x)?.classList.toggle('active', x===o));
}
