// 8. Vendas
function priceSalesMultiplier(project) {
  const ratio = project.price / project.suggestedPrice;
  if (ratio <= 0.5) return 1.45;
  if (ratio <= 0.8) return 1.2;
  if (ratio <= 1.1) return 1;
  if (ratio <= 1.4) return 0.8;
  if (ratio <= 1.8) return 0.55;
  return 0.35;
}

function scopeSalesMultiplier(project) {
  return clamp(Math.pow(project.ambition / 50, 1.45) * 0.75, 0.025, 1.35);
}

function calculateLuckyBreak(project) {
  if (project.luckyBreak) return project.luckyBreak;

  const lowAmbitionBonus = project.ambition <= 10 ? 1 : project.ambition <= 20 ? 0.4 : 0;
  const qualityBonus = project.averageReview >= 8 ? 0.002 : project.averageReview >= 7 ? 0.001 : 0;
  const chance = lowAmbitionBonus ? 0.005 * lowAmbitionBonus + qualityBonus : 0.001;

  if (Math.random() < chance) {
    project.luckyBreak = {
      active: true,
      multiplier: randomFloat(3, 4),
      chance
    };
  } else {
    project.luckyBreak = {
      active: false,
      multiplier: 1,
      chance
    };
  }

  return project.luckyBreak;
}

function calculateSalesCeiling(project) {
  const platform = platforms[project.platform];
  const reviewReachMultiplier = 1 + project.reviews.reduce((sum, review) => sum + review.reach, 0) / 180;
  const qualityMultiplier = clamp(Math.pow(project.averageReview / 8, 1.25), 0.45, 1.8);
  const hypeMultiplier = clamp(0.72 + project.hype / 140, 0.65, 1.45);
  const platformMultiplier = platform.marketShare / 40;
  const scopeBase = 3200 + Math.pow(project.ambition, 1.72) * 90;
  const luckyBreak = calculateLuckyBreak(project);

  return Math.max(250, Math.round(
    scopeBase *
    qualityMultiplier *
    hypeMultiplier *
    reviewReachMultiplier *
    platformMultiplier *
    priceSalesMultiplier(project) *
    luckyBreak.multiplier *
    randomFloat(0.9, 1.12)
  ));
}

function calculateWeeklySales(project) {
  const platform = platforms[project.platform];
  const reviewReachMultiplier = 1 + project.reviews.reduce((sum, review) => sum + review.reach, 0) / 100;
  const qualityMultiplier = clamp(project.averageReview / 7, 0.3, 1.8);
  const ambitionMultiplier = scopeSalesMultiplier(project);
  const interest = (
    project.hype * 0.35 +
    project.projectTrust * 0.2 +
    project.averageReview * 10 * 0.25 +
    project.marketingScore * 0.1 +
    project.communityScore * 0.05 +
    project.influencerScore * 0.05 +
    project.betaResult * 0.08
  );
  if (!project.salesCeiling) project.salesCeiling = calculateSalesCeiling(project);
  const remainingSales = Math.max(0, project.salesCeiling - project.totalSales);
  if (remainingSales <= 0) return 0;

  if (!project.salesHistory.length) {
    const launchSales = Math.max(0, Math.round(
      platform.marketBase *
      (platform.marketShare / 30) *
      (interest / 50) *
      reviewReachMultiplier *
      qualityMultiplier *
      ambitionMultiplier *
      priceSalesMultiplier(project) *
      randomFloat(0.85, 1.15)
    ));
    return Math.min(remainingSales, launchSales);
  }

  const decay = Number(project.weeklySalesDecay || 0.45);
  const tailSales = Math.max(0, Math.round(project.salesHistory[project.salesHistory.length - 1].sales * decay * randomFloat(0.9, 1.05)));
  return Math.min(remainingSales, tailSales);
}

function updateReleasedGamesSales(onlyProject = null) {
  const games = onlyProject ? [onlyProject] : gameState.releasedGames;
  games.filter((game) => game.status === "released").forEach((game) => {
    const platform = platforms[game.platform];
    if (!game.salesCeiling) game.salesCeiling = calculateSalesCeiling(game);
    const sales = calculateWeeklySales(game);
    const effectivePrice = game.price * (1 - game.discount);
    const revenue = Math.round(sales * effectivePrice * platform.revenueShare);
    game.salesHistory.push({ week: gameState.week, sales, revenue });
    game.totalSales += sales;
    game.totalRevenue += revenue;
    changeMoney(revenue);
    if (sales > 0) addLog(`${game.name} vendeu ${prettyNumber(sales)} copias e gerou ${formatMoney(revenue)}.`);
  });
}

function advanceIdleWeek() {
  addLog("Semana avancada sem projeto novo. Jogos antigos continuam pagando cafe e boleto.");
  advanceWeek({ randomEvent: false });
}

