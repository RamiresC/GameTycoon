// Arquivo: js/systems/sales.js
// Responsabilidade: Estreia, ciclo de vendas, reembolsos, descontos e cauda longa.

// 8. Vendas
/** Calcula o efeito do preco sobre a procura pelo jogo. */
function priceSalesMultiplier(project) {
  const ratio = project.price / project.suggestedPrice;
  if (ratio <= 0.5) return 1.45;
  if (ratio <= 0.8) return 1.2;
  if (ratio <= 1.1) return 1;
  if (ratio <= 1.4) return 0.8;
  if (ratio <= 1.8) return 0.55;
  return 0.35;
}

/** Calcula o potencial comercial oferecido pela ambicao. */
function scopeSalesMultiplier(project) {
  return clamp(Math.pow(project.ambition / 50, 1.45) * 0.75, 0.025, 1.35);
}

/** Reduz o potencial comercial de jogos com notas muito baixas. */
function weakGameCommercialMultiplier(project) {
  const score = Math.round(clamp(Number(project.averageReview || 0), 1, 10));
  const multiplier = {
    1: 0.22,
    2: 0.34,
    3: 0.5,
    4: 0.7,
    5: 0.86
  }[score] || 1;
  const trajectory = getSalesTrajectory(project);
  return trajectory.type === "controversial-hit" ? Math.max(multiplier, 0.9) : multiplier;
}

/** Combina genero, tema e plataforma para ponderar as areas nas vendas. */
function getProjectSalesAreaImportance(project) {
  const genreWeights = genres[project.genre] || {};
  const themeWeights = themeSalesWeights[project.theme] || {};
  const platformWeights = {
    steam: {},
    preystation: { graphics: 1.15, polish: 1.1 },
    zbox: { programming: 1.1, graphics: 1.05, sound: 1.05 }
  }[project.platform] || {};

  const areas = ["programming", "graphics", "design", "sound", "polish"];
  const raw = Object.fromEntries(areas.map((area) => [
    area,
    (genreWeights[area] || 1) * (themeWeights[area] || 1) * (platformWeights[area] || 1)
  ]));
  const averageWeight = areas.reduce((sum, area) => sum + raw[area], 0) / areas.length;
  return Object.fromEntries(areas.map((area) => [area, raw[area] / averageWeight]));
}

/** Mede a execucao comercial conforme alvos e importancia das areas. */
function executionSalesMultiplier(project) {
  const coverage = typeof calculateCoverage === "function"
    ? calculateCoverage(project)
    : { programming: 0, graphics: 0, design: 0, sound: 0, polish: 0 };
  const importance = getProjectSalesAreaImportance(project);
  const areas = Object.keys(importance);
  const totalWeight = areas.reduce((sum, area) => sum + importance[area], 0);
  const weightedAverage = areas.reduce(
    (sum, area) => sum + clamp(Number(coverage[area] || 0), 0, 2) * importance[area],
    0
  ) / totalWeight;
  const weightedDeficit = areas.reduce(
    (sum, area) => sum + Math.max(0, 1 - Number(coverage[area] || 0)) * importance[area],
    0
  ) / totalWeight;
  const criticalShortfall = Math.max(...areas.map((area) => {
    const shortfall = Math.max(0, 1 - Number(coverage[area] || 0));
    return shortfall * (0.65 + importance[area] * 0.35);
  }));

  let execution;
  if (weightedAverage < 0.25) execution = 0.025 + weightedAverage * 0.14;
  else if (weightedAverage < 0.5) execution = 0.06 + (weightedAverage - 0.25) * 0.4;
  else if (weightedAverage < 0.75) execution = 0.16 + (weightedAverage - 0.5) * 0.88;
  else if (weightedAverage < 1) execution = 0.38 + (weightedAverage - 0.75) * 1.76;
  else execution = 0.82 + Math.min(0.48, (weightedAverage - 1) * 0.32);

  execution *= clamp(1 - weightedDeficit * 0.34 - criticalShortfall * 0.16, 0.55, 1);

  const allTargetsReached = areas.every((area) => Number(coverage[area] || 0) >= 1);
  if (allTargetsReached) {
    const weakestCoverage = Math.min(...areas.map((area) => Number(coverage[area] || 0)));
    execution += Math.min(0.08, Math.max(0, weakestCoverage - 1) * 0.08);
  }

  const hypeRescue = clamp((project.hype || 0) / 100, 0, 1) * (1 - execution) * 0.34;
  return clamp(execution + hypeRescue, 0.02, 1.3);
}

/** Sorteia uma rara oportunidade comercial fora da curva. */
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

/** Calcula o alcance comercial inicial estimado do jogo. */
function calculateSalesCeiling(project) {
  const platform = platforms[project.platform];
  const reviewReachMultiplier = 1 + project.reviews.reduce((sum, review) => sum + review.reach, 0) / 180;
  const qualityMultiplier = clamp(Math.pow(project.averageReview / 8, 1.25), 0.08, 1.8);
  const hypeMultiplier = clamp(0.72 + project.hype / 140, 0.65, 1.45);
  const platformMultiplier = platform.marketShare / 40;
  const scopeBase = 3200 + Math.pow(project.ambition, 1.72) * 90;
  const luckyBreak = calculateLuckyBreak(project);
  const executionMultiplier = executionSalesMultiplier(project);
  const weakGameMultiplier = weakGameCommercialMultiplier(project);

  return Math.max(250, Math.round(
    scopeBase *
    qualityMultiplier *
    hypeMultiplier *
    reviewReachMultiplier *
    platformMultiplier *
    priceSalesMultiplier(project) *
    executionMultiplier *
    weakGameMultiplier *
    luckyBreak.multiplier *
    randomFloat(0.9, 1.12)
  ));
}

/** Calcula as compras brutas da semana conforme a fase comercial do jogo. */
function calculateWeeklySales(project) {
  const platform = platforms[project.platform];
  const reviewReachMultiplier = 1 + project.reviews.reduce((sum, review) => sum + review.reach, 0) / 100;
  const qualityMultiplier = clamp(Math.pow(project.averageReview / 7, 1.35), 0.08, 1.8);
  const ambitionMultiplier = scopeSalesMultiplier(project);
  const executionMultiplier = executionSalesMultiplier(project);
  const weakGameMultiplier = weakGameCommercialMultiplier(project);
  const reputation = clamp(Number(project.launchReputation ?? project.studioReputationAtStart ?? gameState.reputation ?? 0), 0, 100);
  const interest = (
    project.hype * 0.42 +
    reputation * 0.14 +
    project.averageReview * 10 * 0.25 +
    project.marketingScore * 0.1 +
    project.communityScore * 0.05 +
    project.influencerScore * 0.05 +
    project.betaResult * 0.08
  );
  if (!project.salesCeiling) project.salesCeiling = calculateSalesCeiling(project);
  const marketSales = Number(project.totalGrossSales ?? project.totalSales ?? 0);
  const remainingSales = Math.max(0, project.salesCeiling - marketSales);

  if (!project.salesHistory.length) {
    const launchSales = Math.max(0, Math.round(
      platform.marketBase *
      (platform.marketShare / 30) *
      (interest / 50) *
      reviewReachMultiplier *
      qualityMultiplier *
      ambitionMultiplier *
      executionMultiplier *
      weakGameMultiplier *
      priceSalesMultiplier(project) *
      randomFloat(0.85, 1.15)
    ));
    const launchShare = clamp(
      0.48 +
      (project.hype || 0) / 500 +
      (project.averageReview || 0) / 100,
      0.5,
      0.78
    );
    const launchLimit = Math.max(1, Math.round(project.salesCeiling * launchShare));
    return Math.min(remainingSales, launchSales, launchLimit);
  }

  const previousWeek = project.salesHistory[project.salesHistory.length - 1];
  const previousRevenue = previousWeek.revenue || 0;
  if (remainingSales <= 0 || previousRevenue < 1200 || project.longTailStarted) {
    project.longTailStarted = true;
    return calculateLongTailSales(project);
  }

  const activeSales = calculateActiveLifecycleSales(project);
  if (activeSales > remainingSales) {
    const expansion = activeSales - remainingSales + Math.round(activeSales * 0.35);
    project.salesCeiling += expansion;
    return activeSales;
  }
  return activeSales;
}

/** Calcula a taxa de reembolso por nota, execucao, preco e expectativa. */
function calculateRefundRate(project) {
  const score = clamp(Number(project.averageReview || 0), 1, 10);
  const execution = executionSalesMultiplier(project);
  const priceRatio = project.price / Math.max(1, project.suggestedPrice || project.price);
  const trajectory = getSalesTrajectory(project);
  const baseByScore = {
    1: 0.58,
    2: 0.48,
    3: 0.34,
    4: 0.22,
    5: 0.12,
    6: 0.06,
    7: 0.025,
    8: 0.012,
    9: 0.006,
    10: 0.003
  }[Math.round(score)] || 0.02;

  let rate = baseByScore;
  if (execution < 0.18) rate += 0.16;
  else if (execution < 0.35) rate += 0.1;
  else if (execution < 0.55) rate += 0.05;

  if (priceRatio > 1.6) rate += 0.12;
  else if (priceRatio > 1.3) rate += 0.08;
  else if (priceRatio > 1.1) rate += 0.035;

  const expectationGap = (project.hype || 0) / 10 - score;
  if (expectationGap > 3) rate += Math.min(0.1, expectationGap * 0.018);

  if (trajectory.type === "controversial-hit") rate *= 0.35;
  if (trajectory.type === "word-of-mouth") rate *= 0.72;
  return clamp(rate * randomFloat(0.88, 1.12), 0, 0.78);
}

/** Calcula semanais reembolsos. */
function calculateWeeklyRefunds(project, grossSales) {
  if (grossSales <= 0) return 0;
  return clamp(Math.round(grossSales * calculateRefundRate(project)), 0, grossSales);
}

/** Calcula vendas durante as primeiras semanas apos o lancamento. */
function calculateActiveLifecycleSales(project) {
  const history = project.salesHistory || [];
  const previousSales = history[history.length - 1]?.sales || 0;
  const peakSales = history.reduce((peak, week) => Math.max(peak, week.sales || 0), 0);
  const score = clamp(Number(project.averageReview || 0), 1, 10);
  const hype = clamp(Number(project.hype || 0), 0, 100);
  const reputation = clamp(Number(project.launchReputation ?? project.studioReputationAtStart ?? 0), 0, 100);
  const weeksAfterLaunch = history.length;
  const trajectory = getSalesTrajectory(project);

  let retention = 0.34 + score * 0.055 + hype * 0.0017 + reputation * 0.0007;
  const expectationGap = hype / 10 - score;
  if (expectationGap > 2) retention -= Math.min(0.24, expectationGap * 0.045);
  if (score >= 8) retention += 0.06;
  if (score <= 4) retention -= 0.08;
  retention -= Math.min(0.16, Math.max(0, weeksAfterLaunch - 1) * 0.025);
  retention += trajectory.retention;

  const volatilityRange = score <= 5 ? [0.78, 1.12] : [0.9, 1.08];
  const volatility = randomFloat(
    volatilityRange[0] - trajectory.volatility,
    volatilityRange[1] + trajectory.volatility
  );
  let sales = previousSales * clamp(retention * volatility, 0.22, 0.98);

  const breakoutQualityWeight = clamp((score - 3) / 6, 0.12, 1);
  const breakoutChance = clamp((
    0.025 +
    Math.max(0, score - 7) * 0.025 +
    hype * 0.00045 +
    Math.max(0, reputation - 60) * 0.00045 -
    weeksAfterLaunch * 0.008
  ) * breakoutQualityWeight + trajectory.breakoutChance,
    0.01,
    0.26
  );
  if (Math.random() < breakoutChance) {
    const breakoutStrength = randomFloat(
      1.02,
      1.2 + Math.max(0, score - 7) * 0.025 + trajectory.breakoutStrength
    );
    sales = Math.max(sales, peakSales * breakoutStrength);
  }

  return Math.max(0, Math.round(sales));
}

/** Escolhe e preserva a trajetoria comercial particular de cada jogo. */
function getSalesTrajectory(project) {
  if (project.salesTrajectory) return project.salesTrajectory;

  const score = clamp(Number(project.averageReview || 0), 1, 10);
  const hype = clamp(Number(project.hype || 0), 0, 100);
  const expectationGap = hype / 10 - score;
  const roll = Math.random();
  let type = "standard";

  if (score <= 4 && hype >= 15 && roll < 0.025) type = "controversial-hit";
  else if (score >= 8 && roll < 0.24) type = "word-of-mouth";
  else if (score >= 7 && roll < 0.43) type = "stable";
  else if (expectationGap > 2.5 && roll < 0.62) type = "front-loaded";
  else if (score <= 5 && roll < 0.38) type = "rough-landing";
  else if (roll > 0.86) type = "volatile";

  const profiles = {
    standard: { type, retention: 0, volatility: 0, breakoutChance: 0, breakoutStrength: 0 },
    stable: { type, retention: 0.07, volatility: -0.025, breakoutChance: 0.025, breakoutStrength: 0.04 },
    "word-of-mouth": { type, retention: 0.11, volatility: 0.035, breakoutChance: 0.11, breakoutStrength: 0.18 },
    "front-loaded": { type, retention: -0.13, volatility: 0.06, breakoutChance: -0.01, breakoutStrength: 0 },
    "rough-landing": { type, retention: -0.09, volatility: 0.09, breakoutChance: -0.015, breakoutStrength: 0 },
    "controversial-hit": { type, retention: 0.08, volatility: 0.12, breakoutChance: 0.06, breakoutStrength: 0.1 },
    volatile: { type, retention: -0.02, volatility: 0.14, breakoutChance: 0.045, breakoutStrength: 0.12 }
  };

  project.salesTrajectory = profiles[type];
  return project.salesTrajectory;
}

/** Calcula vendas baixas e oscilantes de catalogo antigo. */
function calculateLongTailSales(project) {
  const history = project.salesHistory || [];
  const previousSales = history[history.length - 1]?.sales || 0;
  const recentSales = history.slice(-4).reduce((sum, week) => sum + (week.sales || 0), 0) / Math.max(1, Math.min(4, history.length));
  const peakSales = history.reduce((peak, week) => Math.max(peak, week.sales || 0), 0);
  const legacyInterest = clamp(
    0.6 +
    (project.averageReview || 0) * 0.12 +
    (project.hype || 0) / 180 +
    Math.log10(Math.max(10, peakSales)) * 0.22,
    0.8,
    3.2
  );
  const naturalBase = Math.max(1, recentSales * randomFloat(0.72, 0.98), legacyInterest * randomFloat(0.65, 1.35));
  const discountActive = project.discount > 0 && project.discountWeeksRemaining > 0;
  const quietWeekChance = previousSales <= 3 ? 0.2 : 0;
  let sales = !discountActive && Math.random() < quietWeekChance ? 0 : naturalBase;

  if (Math.random() < 0.14) {
    sales = Math.max(sales, Math.max(1, previousSales) * randomFloat(1.08, 1.42));
  }

  if (discountActive) {
    const oldHype = clamp((project.hype || 0) / 100, 0, 1);
    const peakWeight = clamp(Math.log10(Math.max(10, peakSales)) / 4, 0.2, 1);
    const discountBoost = 1 + project.discount * (2.2 + oldHype * 1.5 + peakWeight);
    sales *= discountBoost * randomFloat(0.9, 1.18);
  }

  const organicFloor = previousSales >= 10
    ? Math.ceil(previousSales * 0.55)
    : previousSales >= 4
      ? Math.ceil(previousSales * 0.45)
      : 0;
  if (organicFloor > 0) sales = Math.max(sales, organicFloor);
  if (discountActive) sales = Math.max(sales, 1, Math.ceil(previousSales * 0.65));

  const effectivePrice = project.price * (1 - (project.discount || 0));
  const revenueShare = platforms[project.platform]?.revenueShare || 0.7;
  const lowRevenueCopyCap = Math.max(6, Math.ceil(1450 / Math.max(1, effectivePrice * revenueShare)));
  return clamp(Math.round(sales), 0, lowRevenueCopyCap);
}

/** Processa vendas, reembolsos e receita de todos os jogos lancados. */
function updateReleasedGamesSales(onlyProject = null) {
  const games = onlyProject ? [onlyProject] : gameState.releasedGames;
  games.filter((game) => game.status === "released").forEach((game) => {
    const platform = platforms[game.platform];
    if (!game.salesCeiling) game.salesCeiling = calculateSalesCeiling(game);
    const grossSales = calculateWeeklySales(game);
    const refunds = calculateWeeklyRefunds(game, grossSales);
    const sales = Math.max(0, grossSales - refunds);
    const effectivePrice = game.price * (1 - game.discount);
    const grossRevenue = Math.round(grossSales * effectivePrice * platform.revenueShare);
    const refundValue = Math.round(refunds * effectivePrice * platform.revenueShare);
    const revenue = Math.max(0, grossRevenue - refundValue);
    game.salesHistory.push({ week: gameState.week, sales, grossSales, refunds, grossRevenue, refundValue, revenue });
    game.totalGrossSales = Number(game.totalGrossSales || 0) + grossSales;
    game.totalSales += sales;
    game.totalRevenue += revenue;
    game.totalRefunds = Number(game.totalRefunds || 0) + refunds;
    game.totalRefundValue = Number(game.totalRefundValue || 0) + refundValue;
    changeMoney(revenue);
    if (sales > 0) addLog(`${game.name} vendeu ${prettyNumber(sales)} copias e gerou ${formatMoney(revenue)}.`);
    if (refunds > 0) addLog(`${prettyNumber(refunds)} compradores reembolsaram ${game.name}, devolvendo ${formatMoney(refundValue)}.`);
    updateGameDiscount(game);
  });
}

/** Atualiza jogo desconto. */
function updateGameDiscount(game) {
  if (!game.discount || game.discountWeeksRemaining <= 0) return;

  game.discountWeeksRemaining -= 1;
  if (game.discountWeeksRemaining <= 0) {
    game.discount = 0;
    game.discountWeeksRemaining = 0;
    addLog(`O desconto de ${game.name} terminou. O jogo voltou ao preco normal.`);
  }
}

/** Aplica jogo desconto. */
function applyGameDiscount(gameIndex, discount, durationWeeks) {
  const game = getShelfGames()[gameIndex];
  if (!game || game.status !== "released" || game.discountWeeksRemaining > 0) return;

  game.discount = clamp(Number(discount || 0), 0, 0.75);
  game.discountWeeksRemaining = clamp(Math.round(Number(durationWeeks || 1)), 1, 10);
  addLog(`${game.name} entrou em promocao com ${Math.round(game.discount * 100)}% de desconto por ${game.discountWeeksRemaining} ${game.discountWeeksRemaining === 1 ? "semana" : "semanas"}.`);
  render();
}

/** Aplica selected jogo desconto. */
function applySelectedGameDiscount(gameIndex, discount) {
  const duration = Number(document.getElementById("shelfDiscountDuration")?.value || 1);
  applyGameDiscount(gameIndex, discount, duration);
}

/** Avanca uma semana sem iniciar uma acao de projeto. */
function advanceIdleWeek() {
  addLog("Semana avancada sem projeto novo. Jogos antigos continuam pagando cafe e boleto.");
  advanceWeek({ randomEvent: false });
}

