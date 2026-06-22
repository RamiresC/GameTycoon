// 4. Projeto
function calculateSuggestedPrice(ambition) {
  const raw = 4.99 + ambition * 0.55;
  const prices = [9.99, 14.99, 19.99, 29.99, 39.99, 49.99, 59.99];
  return prices.reduce((best, price) => Math.abs(price - raw) < Math.abs(best - raw) ? price : best, prices[0]);
}

function calculateExpectedWeeks(ambition) {
  return clamp(Math.round(3 + ambition * 0.38), 4, 44);
}

function calculateReasonableWeeks(ambition) {
  return calculateExpectedWeeks(ambition) + 5;
}

function calculateDeadlineHypeModifier(ambition, weeks) {
  const reasonableWeeks = calculateReasonableWeeks(ambition);
  const ratio = weeks / reasonableWeeks;
  if (ratio > 2.4) return -8;
  if (ratio > 1.7) return -4;
  if (ratio < 0.65) return 4;
  return 0;
}

function generateTargets(genre, platformId, ambition) {
  const targetBase = ambition * 4;
  const weights = genres[genre];
  const targets = {
    programming: targetBase * weights.programming,
    graphics: targetBase * weights.graphics,
    design: targetBase * weights.design,
    sound: targetBase * weights.sound,
    polish: clamp(50 + ambition * 0.4, 45, 95)
  };

  if (platformId === "preystation") {
    targets.graphics *= 1.1;
    targets.polish = clamp(targets.polish + 5, 45, 98);
  }

  if (platformId === "zbox" && genre === "Acao") {
    targets.programming *= 1.1;
  }

  return targets;
}

function createProject(form) {
  const ambition = Number(form.ambition.value);
  const platform = platforms[form.platform.value];
  const weeks = Number(form.weeks.value);
  const price = Number(form.price.value);
  const suggestedPrice = calculateSuggestedPrice(ambition);
  const deadlineHypeModifier = calculateDeadlineHypeModifier(ambition, weeks);

  return {
    name: form.gameName.value.trim() || "Sem Nome Mas Com Pressao",
    theme: form.theme.value,
    genre: form.genre.value,
    platform: platform.id,
    ambition,
    plannedWeeks: weeks,
    deadlineWeek: gameState.week + weeks,
    releaseWeek: gameState.week + weeks,
    price,
    suggestedPrice,
    status: "development",
    progress: { programming: 0, graphics: 0, design: 0, sound: 0, polish: 0 },
    targets: generateTargets(form.genre.value, platform.id, ambition),
    hype: clamp(2 + Math.round(ambition / 6) + Math.floor(gameState.reputation / 12) + deadlineHypeModifier, 0, 100),
    projectTrust: clamp(25 + Math.floor(gameState.reputation / 2) + deadlineHypeModifier, 0, 100),
    trustImpact: 0,
    marketingScore: 10,
    communityScore: 10,
    influencerScore: 0,
    betaReleased: false,
    betaResult: 0,
    delays: 0,
    reviews: [],
    salesHistory: [],
    totalSales: 0,
    totalRevenue: 0,
    weeklySalesDecay: 0.7,
    discount: 0,
    focusHistory: { programming: 0, graphics: 0, design: 0, sound: 0, polish: 0 },
    launchedAt: null,
    averageReview: 0
  };
}

function startProject(event) {
  event.preventDefault();
  const project = createProject(event.target);
  const platform = platforms[project.platform];
  if (gameState.money < platform.licenceCost) {
    showModal("Licenca cara demais", `<p>Voce precisa de ${formatMoney(platform.licenceCost)} para publicar no ${platform.name}.</p>`, [{ label: "Voltar", action: closeModal }]);
    return;
  }

  changeMoney(-platform.licenceCost);
  gameState.currentProject = project;
  addLog(`${project.name} foi anunciado para ${platform.name}. Os foruns descobriram seu jogo. Agora ninguem dorme.`);
  render();
}

function getProjectPublicPressure(project) {
  return clamp(
    project.hype +
    project.marketingScore * 0.45 +
    project.communityScore * 0.35 +
    project.influencerScore * 0.8,
    0,
    160
  );
}

function applyReputationChange(amount) {
  gameState.reputation = clamp(gameState.reputation + amount, 0, 100);
}

function getEarlyLaunchReputationImpact(project) {
  const coverage = averageCoverage(project);
  if (coverage < 0.65 || project.progress.polish < 35) {
    return {
      amount: -6,
      message: "O lancamento adiantado saiu quebrado. A reputacao levou um tombo visivel."
    };
  }

  if (coverage < 1 || project.progress.polish < 60) {
    return {
      amount: 0,
      message: "O lancamento adiantado foi aceitavel. Ninguem aplaudiu o calendario, mas tambem nao virou desastre."
    };
  }

  return {
    amount: 3,
    message: "O lancamento adiantado surpreendeu: o jogo ja parecia pronto e isso gerou respeito."
  };
}

function launchGameEarly() {
  const project = gameState.currentProject;
  if (!project) return;

  const impact = getEarlyLaunchReputationImpact(project);
  project.earlyLaunchReputationImpact = impact.amount;
  project.releaseWeek = gameState.week;
  project.deadlineWeek = gameState.week;
  addLog(impact.message);
  releaseGame();
}

function showEarlyLaunchModal() {
  const project = gameState.currentProject;
  if (!project) return;

  const impact = getEarlyLaunchReputationImpact(project);
  const tone = impact.amount > 0 ? "success" : impact.amount < 0 ? "danger-text" : "subtle";
  showModal(
    "Lancar jogo adiantado",
    `<p>Voce vai publicar ${project.name} agora, antes do prazo.</p>
    <p class="${tone}">${impact.message}</p>`,
    [
      { label: "Lancar agora", className: impact.amount < 0 ? "danger" : "green", action: () => { closeModal(); launchGameEarly(); } },
      { label: "Continuar desenvolvimento", action: closeModal }
    ]
  );
}

function getCancelReputationImpact(project) {
  const pressure = getProjectPublicPressure(project);
  if (pressure < 35) {
    return {
      amount: 0,
      message: "O projeto foi cancelado antes de muita gente se importar. A reputacao nao mudou."
    };
  }

  if (pressure < 85) {
    return {
      amount: -4,
      message: "O cancelamento decepcionou parte da comunidade. A reputacao caiu."
    };
  }

  return {
    amount: -12,
    message: "O jogo estava muito hypado. O cancelamento virou noticia ruim e a reputacao despencou."
  };
}

function cancelCurrentProject() {
  const project = gameState.currentProject;
  if (!project) return;

  const impact = getCancelReputationImpact(project);
  applyReputationChange(impact.amount);
  gameState.currentProject = null;
  addLog(impact.message);
  render();
}

function showCancelProjectModal() {
  const project = gameState.currentProject;
  if (!project) return;

  const impact = getCancelReputationImpact(project);
  const tone = impact.amount < -8 ? "danger-text" : impact.amount < 0 ? "warning" : "subtle";
  showModal(
    "Cancelar jogo",
    `<p>Cancelar ${project.name} encerra o desenvolvimento imediatamente.</p>
    <p class="${tone}">${impact.message}</p>`,
    [
      { label: "Cancelar jogo", className: "danger", action: () => { closeModal(); cancelCurrentProject(); } },
      { label: "Voltar", action: closeModal }
    ]
  );
}

