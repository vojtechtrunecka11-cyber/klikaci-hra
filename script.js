const defaultState = { coins: 0, perClick: 1, perSecond: 0, totalClicks: 0, level: 1, upgrades: { click: 0, worker: 0, multiplier: 0 } };
const upgrades = [
  { id: 'click', icon: '⚡', name: 'Silnější kliknutí', description: '+1 mince za kliknutí', baseCost: 25, effect: state => state.perClick += 1 },
  { id: 'worker', icon: '⛏️', name: 'Královský horník', description: '+1 mince každou sekundu', baseCost: 80, effect: state => state.perSecond += 1 },
  { id: 'multiplier', icon: '💎', name: 'Diamantový bonus', description: '+5 mincí za kliknutí', baseCost: 350, effect: state => state.perClick += 5 }
];
let state = JSON.parse(localStorage.getItem('clickerKingdom')) || structuredClone(defaultState);
const $ = id => document.getElementById(id);
const format = n => Math.floor(n).toLocaleString('cs-CZ');
function cost(upgrade) { return Math.floor(upgrade.baseCost * Math.pow(1.55, state.upgrades[upgrade.id])); }
function render() {
  $('coins').textContent = format(state.coins); $('perClick').textContent = format(state.perClick); $('perSecond').textContent = format(state.perSecond); $('totalClicks').textContent = format(state.totalClicks); $('levelLabel').textContent = `Úroveň ${state.level}`;
  const needed = state.level * 100, progress = state.totalClicks % needed; $('progressText').textContent = `${format(progress)} / ${format(needed)}`; $('progressBar').style.width = `${Math.min(100, progress / needed * 100)}%`;
  $('upgrades').innerHTML = upgrades.map(u => { const price = cost(u), owned = state.upgrades[u.id]; return `<article class="upgrade"><div class="upgrade-top"><span class="upgrade-icon">${u.icon}</span><div><h3>${u.name} <small>×${owned}</small></h3><p>${u.description}</p></div></div><div class="buy-row"><span class="cost">🪙 ${format(price)}</span><button class="buy-button" data-id="${u.id}" ${state.coins < price ? 'disabled' : ''}>Koupit</button></div></article>`; }).join('');
  localStorage.setItem('clickerKingdom', JSON.stringify(state));
}
$('coinButton').addEventListener('click', () => { state.coins += state.perClick; state.totalClicks++; if (state.totalClicks % (state.level * 100) === 0) state.level++; $('clickMessage').textContent = `+${format(state.perClick)} mincí!`; render(); });
$('upgrades').addEventListener('click', e => { const button = e.target.closest('.buy-button'); if (!button) return; const upgrade = upgrades.find(u => u.id === button.dataset.id), price = cost(upgrade); if (state.coins < price) return; state.coins -= price; state.upgrades[upgrade.id]++; upgrade.effect(state); render(); });
$('resetButton').addEventListener('click', () => { if (confirm('Opravdu chceš vymazat svůj postup?')) { state = structuredClone(defaultState); render(); } });
setInterval(() => { if (state.perSecond) { state.coins += state.perSecond; render(); } }, 1000); render();
