// Arquivo: js/utils.js
// Responsabilidade: Utilitarios compartilhados de numeros, dinheiro, logs e interface.

// 3. Utilidades
/** Sorteia um numero inteiro inclusivo entre os limites informados. */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Sorteia um numero decimal entre os limites informados. */
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/** Limita um valor ao intervalo minimo e maximo. */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Formata um numero como moeda em dolar. */
function formatMoney(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Altera o caixa e cria um popup visual independente. */
function changeMoney(amount) {
  if (amount === 0) return;
  gameState.money += amount;
  showMoneyPopup(amount);
}

/** Obtem ou cria a pilha persistente de popups financeiros. */
function getMoneyPopupStack() {
  let stack = document.getElementById("moneyPopupStack");
  if (stack) return stack;

  stack = document.createElement("div");
  stack.id = "moneyPopupStack";
  stack.className = "money-popup-stack";
  stack.setAttribute("aria-live", "polite");
  document.body.appendChild(stack);
  return stack;
}

/** Alinha a pilha de popups abaixo do indicador de dinheiro. */
function syncMoneyPopupPosition() {
  const stack = document.getElementById("moneyPopupStack");
  if (!stack) return;

  const moneyStat = document.getElementById("moneyStat");
  if (!moneyStat) {
    stack.hidden = true;
    return;
  }

  const rect = moneyStat.getBoundingClientRect();
  stack.hidden = false;
  stack.style.left = `${Math.round(rect.left + 10)}px`;
  stack.style.top = `${Math.round(rect.bottom + 5)}px`;
}

/** Exibe uma alteracao financeira por exatamente tres segundos. */
function showMoneyPopup(amount) {
  if (amount === 0) return;

  const popup = document.createElement("span");
  popup.className = `money-popup ${amount > 0 ? "gain" : "loss"}`;
  popup.textContent = `${amount > 0 ? "+" : "-"}${formatMoney(Math.abs(amount))}`;
  getMoneyPopupStack().appendChild(popup);
  syncMoneyPopupPosition();

  window.setTimeout(() => {
    popup.remove();
    const stack = document.getElementById("moneyPopupStack");
    if (stack && !stack.children.length) stack.remove();
  }, 3000);
}

// Registra um listener global necessario para manter a interface sincronizada.
window.addEventListener("resize", syncMoneyPopupPosition);
// Registra um listener global necessario para manter a interface sincronizada.
window.addEventListener("scroll", syncMoneyPopupPosition, true);

/** Adiciona log. */
function addLog(message) {
  gameState.logMessages.unshift(`Semana ${gameState.week}: ${message}`);
  gameState.logMessages = gameState.logMessages.slice(0, 32);
  speechBubbleText = message;
}

/** Formata quantidades inteiras para exibicao. */
function prettyNumber(value) {
  return Math.round(value).toLocaleString("pt-BR");
}

/** Converte a chave interna de uma area em texto visivel. */
function areaLabel(area) {
  return {
    programming: "Programacao",
    graphics: "Graficos",
    design: "Game Design",
    sound: "Som",
    polish: "Polimento"
  }[area];
}

