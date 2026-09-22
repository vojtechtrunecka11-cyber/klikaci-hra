const STORAGE_KEY = "pixel-miner-save";
const upgradeDefinitions = [
  { id: "pickaxe", icon: "⛏️", name: "Ostrý krumpáč", description: "+1 mince za každý klik", baseCost: 25, effect: "click", amount: 1 },
  { id: "drill", icon: "🔩", name: "Automatický vrták", description: "+1 mince každou sekundu", baseCost: 100, effect: "passive", amount: 1 },
  { id: "crystal", icon: "💎", name: "Krystalový hrot", description: "+5 mincí za každý klik", baseCost: 300, effect: "click", amount: 5 },
  { id: "robot", icon: "🤖", name: "Těžební robot", description: "+10 mincí každou sekundu", baseCost: 900, effect: "passive", amount: 10 }
];

let state = { coins: 0, totalCoins: 0, clicks: 0, upgrades: {} };
try { state = { ...state, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; } catch (_) {}
const $ = (id) => document.getElementById(id);
const format = (number) => Math.floor(number).toLocaleString("cs-CZ");
const level = () => Math.floor(state.clicks / 100) + 1;
const cost = (upgrade, owned) => Math.floor(upgrade.baseCost * Math.pow(1.55, owned));

function spawnFloatingGain(x, y, value) {
  const floating = document.createElement("div");
  floating.className = "floating-gain";
  floating.textContent = `+${format(value)}`;
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
  $("floating-coins").appendChild(floating);
  setTimeout(() => floating.remove(), 1100);
}

function totals() {
  return upgradeDefinitions.reduce((result, upgrade) => {
    const owned = state.upgrades[upgrade.id] || 0;
    if (upgrade.effect === "click") result.click += owned * upgrade.amount;
    if (upgrade.effect === "passive") result.passive += owned * upgrade.amount;
    return result;
  }, { click: 1, passive: 0 });
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); $("save-status").textContent = "Automaticky uloženo"; }
function render() {
  const total = totals();
  $("coins").textContent = format(state.coins); $("per-click").textContent = format(total.click); $("per-second").textContent = format(total.passive); $("total-coins").textContent = format(state.totalCoins);
  $("mine-level").textContent = level(); const progress = state.clicks % 100; $("level-progress").style.width = `${progress}%`; $("level-progress-text").textContent = `${progress} / 100`;
  const ownedCount = upgradeDefinitions.filter(u => (state.upgrades[u.id] || 0) > 0).length; $("upgrade-count").textContent = `${ownedCount} / ${upgradeDefinitions.length}`;
  $("upgrades").innerHTML = upgradeDefinitions.map((upgrade) => { const owned = state.upgrades[upgrade.id] || 0; const price = cost(upgrade, owned); return `<div class="upgrade"><div class="upgrade-top"><span class="upgrade-icon">${upgrade.icon}</span><div><h3>${upgrade.name}</h3><p>${upgrade.description}</p></div></div><div class="upgrade-bottom"><span class="upgrade-level">Úroveň ${owned}</span><button class="buy-button" data-upgrade="${upgrade.id}" ${state.coins < price ? "disabled" : ""}>💰 ${format(price)}</button></div></div>`; }).join("");
}
function toast(message) { const element = $("toast"); element.textContent = message; element.classList.add("show"); setTimeout(() => element.classList.remove("show"), 1800); }
$("mine-button").addEventListener("click", (event) => { const amount = totals().click; state.coins += amount; state.totalCoins += amount; state.clicks += 1; spawnFloatingGain(event.clientX, event.clientY, amount); render(); save(); });
$("upgrades").addEventListener("click", (event) => { const button = event.target.closest("button[data-upgrade]"); if (!button) return; const upgrade = upgradeDefinitions.find(item => item.id === button.dataset.upgrade); const owned = state.upgrades[upgrade.id] || 0; const price = cost(upgrade, owned); if (state.coins < price) return; state.coins -= price; state.upgrades[upgrade.id] = owned + 1; toast(`Zakoupeno: ${upgrade.name}`); render(); save(); });
$("reset-button").addEventListener("click", () => { if (!confirm("Opravdu chceš smazat celý postup?")) return; state = { coins: 0, totalCoins: 0, clicks: 0, upgrades: {} }; save(); render(); toast("Postup byl resetován"); });
setInterval(() => { const amount = totals().passive; if (!amount) return; state.coins += amount; state.totalCoins += amount; render(); save(); }, 1000);
render();
