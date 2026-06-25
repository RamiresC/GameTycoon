// Arquivo: js/systems/save-load.js
// Responsabilidade: Persistencia local e migracao de saves antigos.

/** Salva jogo. */
function saveGame() {
  localStorage.setItem("indieDevPressureSave", JSON.stringify(gameState));
  addLog("Jogo salvo localmente. O navegador agora guarda seus traumas comerciais.");
  render();
}

/** Carrega jogo. */
function loadGame() {
  const saved = localStorage.getItem("indieDevPressureSave");
  if (!saved) return;
  Object.assign(gameState, JSON.parse(saved));
  ensureProgressionState();
  delete gameState.lastMoneyChange;
  ensureRivalCompanyState();
  ensureIndieCompanyState();
  addLog("Save carregado. A pressao voltou do disco.");
  render();
}

/** Normaliza campos ausentes e migra saves de versoes anteriores. */
function ensureProgressionState() {
  gameState.careerXp = Number(gameState.careerXp || 0);
  gameState.skillPoints = Number(gameState.skillPoints || 0);
  gameState.skillPointsEarned = Number(gameState.skillPointsEarned || 0);
  if (!gameState.savedDeveloper) {
    gameState.savedDeveloper = { ...gameState.developer };
  }
  ["programming", "graphics", "design", "sound", "polish"].forEach((key) => {
    gameState.developer[key] = clamp(Number(gameState.developer[key] || 0), 0, DEVELOPER_ATTRIBUTE_MAX);
    gameState.savedDeveloper[key] = clamp(Number(gameState.savedDeveloper[key] || 0), 0, DEVELOPER_ATTRIBUTE_MAX);
  });
  gameState.releasedGames.forEach((game) => {
    game.discount = Number(game.discount || 0);
    game.discountWeeksRemaining = Number(game.discountWeeksRemaining || 0);
    game.longTailStarted = Boolean(game.longTailStarted);
    game.salesTrajectory = game.salesTrajectory || null;
    game.totalGrossSales = Number(game.totalGrossSales ?? game.totalSales ?? 0);
    game.totalRefunds = Number(game.totalRefunds || 0);
    game.totalRefundValue = Number(game.totalRefundValue || 0);
    game.studioReputationAtStart = Number(game.studioReputationAtStart ?? game.launchReputation ?? 0);
    game.launchReputation = Number(game.launchReputation ?? game.studioReputationAtStart ?? 0);
  });
  if (gameState.currentProject) {
    gameState.currentProject.studioReputationAtStart = Number(gameState.currentProject.studioReputationAtStart ?? gameState.reputation ?? 0);
    gameState.currentProject.launchReputation = gameState.currentProject.launchReputation ?? null;
    gameState.currentProject.hype = clamp(Number(gameState.currentProject.hype || 0), 0, 100);
  }
}

