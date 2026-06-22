function saveGame() {
  const saveState = { ...gameState, lastMoneyChange: null };
  localStorage.setItem("indieDevPressureSave", JSON.stringify(saveState));
  addLog("Jogo salvo localmente. O navegador agora guarda seus traumas comerciais.");
  render();
}

function loadGame() {
  const saved = localStorage.getItem("indieDevPressureSave");
  if (!saved) return;
  Object.assign(gameState, JSON.parse(saved));
  gameState.lastMoneyChange = null;
  ensureRivalCompanyState();
  ensureIndieCompanyState();
  addLog("Save carregado. A pressao voltou do disco.");
  render();
}

