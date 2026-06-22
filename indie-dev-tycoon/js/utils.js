// 3. Utilidades
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatMoney(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function changeMoney(amount) {
  if (amount === 0) return;
  gameState.money += amount;
  const id = Date.now() + Math.random();
  gameState.lastMoneyChange = {
    id,
    amount
  };
  showMoneyPopup(amount, id);
}

function showMoneyPopup(amount = gameState.lastMoneyChange?.amount, id = gameState.lastMoneyChange?.id) {
  const moneyStat = document.getElementById("moneyStat");
  if (!moneyStat || amount === 0) return;

  const oldPopup = moneyStat.querySelector(".money-popup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("span");
  popup.className = `money-popup ${amount > 0 ? "gain" : "loss"}`;
  popup.textContent = `${amount > 0 ? "+" : "-"}${formatMoney(Math.abs(amount))}`;
  moneyStat.appendChild(popup);

  window.setTimeout(() => {
    if (gameState.lastMoneyChange?.id === id) {
      gameState.lastMoneyChange = null;
    }
    popup.remove();
  }, 3000);
}

function addLog(message) {
  gameState.logMessages.unshift(`Semana ${gameState.week}: ${message}`);
  gameState.logMessages = gameState.logMessages.slice(0, 32);
  speechBubbleText = message;
}

function prettyNumber(value) {
  return Math.round(value).toLocaleString("pt-BR");
}

function areaLabel(area) {
  return {
    programming: "Programacao",
    graphics: "Graficos",
    design: "Game Design",
    sound: "Som",
    polish: "Polimento"
  }[area];
}

