// 7. Review
function calculateCoverage(project) {
  return {
    programming: project.progress.programming / project.targets.programming,
    graphics: project.progress.graphics / project.targets.graphics,
    design: project.progress.design / project.targets.design,
    sound: project.progress.sound / project.targets.sound,
    polish: project.progress.polish / project.targets.polish
  };
}

function averageCoverage(project) {
  const c = calculateCoverage(project);
  return (c.programming + c.graphics + c.design + c.sound + c.polish) / 5;
}

function coverageToScore(c) {
  let score;
  if (c < 0.5) score = 2 + c * 4;
  else if (c < 1) score = 4 + c * 2;
  else if (c < 1.5) score = 5.5 + (c - 1) * 3;
  else if (c < 2) score = 7 + (c - 1.5) * 2;
  else score = 8 + Math.min((c - 2) * 1.2, 2);
  return clamp(score, 1, 10);
}

function calculateDeadlineExpectationPenalty(project) {
  const plannedWeeks = project.plannedWeeks || Math.max(1, project.deadlineWeek - (project.launchedAt || gameState.week));
  const reasonableWeeks = calculateReasonableWeeks(project.ambition);
  const ratio = plannedWeeks / reasonableWeeks;

  if (ratio < 1.6) return 0;
  if (ratio < 2.2) return 0.35;
  if (ratio < 3) return 0.75;
  return 1.2;
}

function calculateReviewerScore(project, reviewer) {
  const coverage = calculateCoverage(project);
  const areaScores = {
    programming: coverageToScore(coverage.programming),
    graphics: coverageToScore(coverage.graphics),
    design: coverageToScore(coverage.design),
    sound: coverageToScore(coverage.sound),
    polish: coverageToScore(coverage.polish)
  };

  let score = Object.keys(reviewer.weights).reduce((total, key) => total + areaScores[key] * reviewer.weights[key], 0);
  const main = [coverage.programming, coverage.graphics, coverage.design, coverage.sound];
  const lowest = Math.min(...main);
  const highest = Math.max(...main);
  const imbalance = highest - lowest;

  if (imbalance >= 1 && imbalance <= 2) score -= randomFloat(0.2, 0.6) * (lowest > 1 ? 0.5 : 1);
  if (imbalance > 2) score -= randomFloat(0.7, 1.2) * (lowest > 1 ? 0.5 : 1);

  if (project.progress.polish < 40) score -= 1.5;
  else if (project.progress.polish < 60) score -= 0.8;
  else if (project.progress.polish > 85) score += randomFloat(0.3, 0.7);

  const priceRatio = project.price / project.suggestedPrice;
  if (priceRatio > 1.4 && score < 7) score -= 0.7;
  if (priceRatio <= 0.8 && score >= 6) score += 0.25;

  score -= calculateDeadlineExpectationPenalty(project);

  const history = studioReviewHistory();
  if (history >= 8 && score < 7) score -= 0.2;
  if (history < 5 && score >= 7) score += 0.2;

  const variance = reviewer.name === "The Joystick" ? randomFloat(-0.25, 0.25) : randomFloat(-0.65, 0.65);
  return clamp(Number((score + variance).toFixed(1)), 1, 10);
}

function studioReviewHistory() {
  if (!gameState.releasedGames.length) return gameState.reputation / 10;
  const last = gameState.releasedGames.slice(-3);
  return last.reduce((sum, game) => sum + game.averageReview, 0) / last.length;
}

function estimateQuality(project) {
  const fakeReviewer = { weights: { programming: 0.22, graphics: 0.2, design: 0.28, sound: 0.1, polish: 0.2 }, name: "Estimate" };
  return calculateReviewerScore(project, fakeReviewer);
}

function generateReviewQuote(project, score) {
  const coverage = calculateCoverage(project);
  const areas = ["programming", "graphics", "design", "sound", "polish"];
  const best = areas.reduce((a, b) => coverage[a] > coverage[b] ? a : b);
  const worst = areas.reduce((a, b) => coverage[a] < coverage[b] ? a : b);
  const priceRatio = project.price / project.suggestedPrice;
  const deadlinePenalty = calculateDeadlineExpectationPenalty(project);

  if (project.progress.polish < 45) return "Um projeto promissor, mas o polimento deixa cicatrizes visiveis.";
  if (deadlinePenalty >= 0.75 && score >= 7) return "Muito bem feito, mas com o prazo anunciado desde o inicio, esperavamos algo mais ambicioso.";
  if (deadlinePenalty > 0 && score >= 6) return "Polido e competente, embora o tempo de producao tenha criado expectativas maiores que o escopo entrega.";
  if (priceRatio > 1.4 && score < 7) return "Dificil recomendar pelo preco, especialmente quando a ambicao cobra juros.";
  if (score >= 8.5) return `O ${areaLabel(best)} brilha forte e o conjunto quase justifica todo o barulho.`;
  if (score >= 7) return `Um excelente jogo para seu nicho, ainda que ${areaLabel(worst)} peca passagem.`;
  if (score >= 5.5) return `${areaLabel(best)} segura a experiencia, mas o jogo parece abaixo da expectativa historica.`;
  return `Visualmente ou conceitualmente curioso, mas nao sustenta a ambicao que promete.`;
}

function releaseGame() {
  const project = gameState.currentProject;
  if (!project) return;

  const unlocked = reviewers.filter((reviewer) => reviewer.unlock(project));
  project.reviews = unlocked.map((reviewer) => {
    const score = calculateReviewerScore(project, reviewer);
    return {
      name: reviewer.name,
      reach: reviewer.reach,
      score,
      quote: generateReviewQuote(project, score)
    };
  });

  project.averageReview = Number((project.reviews.reduce((sum, review) => sum + review.score, 0) / project.reviews.length).toFixed(1));
  project.status = "released";
  project.launchedAt = gameState.week;
  project.salesCeiling = calculateSalesCeiling(project);
  project.weeklySalesDecay = project.averageReview >= 8 ? 0.56 : project.averageReview >= 6 ? 0.48 : 0.36;
  if (project.hype > 80) project.weeklySalesDecay += 0.05;
  if (project.projectTrust > 80) project.weeklySalesDecay += 0.05;

  updateDeveloperXP(project);
  updateStudioAfterRelease(project);
  gameState.releasedGames.push(project);
  gameState.lastReviews = project.reviews;
  gameState.currentProject = null;
  addLog(`${project.name} foi lancado com media ${project.averageReview}. Agora ele sera julgado por carteiras, cliques e memoria seletiva.`);
  if (project.luckyBreak && project.luckyBreak.active) {
    addLog(`${project.name} encontrou uma sorte rara: clipes, recomendacoes e curiosidade empurraram o jogo alem do nicho esperado.`);
  }
  updateReleasedGamesSales(project);
  showReviewModal(project);
}

function updateDeveloperXP(project) {
  Object.entries(project.focusHistory).forEach(([area, uses]) => {
    const gain = Math.floor(uses / 5);
    if (gain > 0) {
      gameState.developer[area] += gain;
      addLog(`${areaLabel(area)} evoluiu +${gain}. Dor tambem ensina.`);
    }
  });
}

function updateStudioAfterRelease(project) {
  const avg = project.averageReview;
  if (avg >= 9) {
    gameState.reputation += 8;
  } else if (avg >= 8) {
    gameState.reputation += 5;
  } else if (avg >= 7) {
    gameState.reputation += 3;
  } else if (avg >= 6) {
    gameState.reputation += 1;
  } else if (avg < 3) {
    gameState.reputation -= 10;
  } else if (avg < 5) {
    gameState.reputation -= 5;
  } else {
    gameState.reputation -= 2;
  }

  if (project.earlyLaunchReputationImpact) {
    gameState.reputation += project.earlyLaunchReputationImpact;
  }

  gameState.reputation = clamp(gameState.reputation, 0, 100);
}

