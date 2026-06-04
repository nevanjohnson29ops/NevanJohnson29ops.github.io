const $ = id => document.getElementById(id);

let state = {
    cookies: 0,
    cps: 0,
    cpc: 1,
    items: {},
    clickUpgrades: 0
};

const shopItems = [
    { id: 'cursor', name: 'Cursor', baseCost: 15, baseCps: 0.1 },
    { id: 'grandma', name: 'Grandma', baseCost: 100, baseCps: 1 },
    { id: 'farm', name: 'Farm', baseCost: 1100, baseCps: 8 },
    { id: 'mine', name: 'Mine', baseCost: 12000, baseCps: 47 },
    { id: 'factory', name: 'Factory', baseCost: 130000, baseCps: 260 },
    { id: 'bank', name: 'Bank', baseCost: 1400000, baseCps: 1400 },
    { id: 'temple', name: 'Temple', baseCost: 20000000, baseCps: 7800 }
];

function format(n) { return Math.floor(n) === n ? n.toLocaleString() : n.toFixed(2) }

function load() {
    const saved = localStorage.getItem('clicker_state');
    if (saved) {
        const s = JSON.parse(saved);
        state = Object.assign(state, s);
    }
    // ensure items exist
    shopItems.forEach(it => { state.items[it.id] = state.items[it.id] || 0 });
}

function save() {
    localStorage.setItem('clicker_state', JSON.stringify(state));
    $('saveIndicator').textContent = 'Saved ' + new Date().toLocaleTimeString();
}

function getCost(base, owned) {
    return Math.max(1, Math.floor(base * Math.pow(1.15, owned)));
}

function rebuildShop() {
    const shop = $('shop'); shop.innerHTML = '';
    shopItems.forEach(it => {
        const owned = state.items[it.id] || 0;
        const cost = getCost(it.baseCost, owned);
        const el = document.createElement('div'); el.className = 'item';
        el.innerHTML = `<h3>${it.name} <small>×${owned}</small></h3>
      <p>Produces ${it.baseCps} cookies/sec each</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <button data-id="${it.id}">Buy — ${cost}</button>
        <div style="font-size:12px;color:#444">Cost</div>
      </div>`;
        el.querySelector('button').addEventListener('click', () => buyItem(it.id));
        shop.appendChild(el);
    });
}

function updateStats() {
    $('cookies').textContent = format(state.cookies);
    $('cps').textContent = format(state.cps);
    $('cpcDisplay').textContent = `Click power: ${state.cpc}`;
}

function recalcCps() {
    let total = 0;
    shopItems.forEach(it => {
        const owned = state.items[it.id] || 0;
        total += owned * it.baseCps;
    });
    state.cps = total;
}

function buyItem(id) {
    const it = shopItems.find(s => s.id === id);
    const owned = state.items[id] || 0;
    const cost = getCost(it.baseCost, owned);
    if (state.cookies >= cost) {
        state.cookies -= cost;
        state.items[id] = owned + 1;
        recalcCps();
        rebuildShop();
        updateStats();
        save();
    } else {
        flash('Not enough cookies');
    }
}

function flash(msg) {
    const old = $('saveIndicator').textContent;
    $('saveIndicator').textContent = msg;
    setTimeout(() => $('saveIndicator').textContent = old, 1200);
}

function animateClick(x, y, amount) {
    const el = document.createElement('div');
    el.className = 'floating';
    el.textContent = `+${format(amount)}`;
    document.body.appendChild(el);
    el.style.left = (x - 10) + 'px';
    el.style.top = (y - 10) + 'px';
    setTimeout(() => el.remove(), 900);
}

function clickCookie(e) {
    state.cookies += state.cpc;
    updateStats();
    // animate
    const rect = $('cookie').getBoundingClientRect();
    const x = e ? e.clientX : rect.left + rect.width / 2;
    const y = e ? e.clientY : rect.top + rect.height / 2;
    animateClick(x, y, state.cpc);
    // glow effect
    const btn = $('cookie');
    btn.classList.add('glow');
    setTimeout(() => btn.classList.remove('glow'), 650);
}

function upgradeClick() {
    const cost = Math.floor(50 * Math.pow(2, state.clickUpgrades));
    if (state.cookies >= cost) {
        state.cookies -= cost;
        state.clickUpgrades += 1;
        state.cpc += 1;
        updateStats();
        rebuildShop();
        save();
    } else flash('Not enough cookies');
}

function reset() {
    if (confirm('Reset your progress?')) {
        state = { cookies: 0, cps: 0, cpc: 1, items: {}, clickUpgrades: 0 };
        shopItems.forEach(it => state.items[it.id] = 0);
        rebuildShop(); updateStats(); save();
    }
}

// game loop: tick 10 times a second
function tick() {
    state.cookies += state.cps / 10;
    updateStats();
}

// init
load();
rebuildShop();
recalcCps();
updateStats();

$('cookie').addEventListener('click', (e) => { clickCookie(e); save(); });
$('upgradeClick').addEventListener('click', upgradeClick);
$('reset').addEventListener('click', reset);

setInterval(tick, 100);
setInterval(save, 2000);
window.addEventListener('beforeunload', save);
