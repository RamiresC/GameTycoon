// Arquivo: js/systems/reviews.js
// Responsabilidade: Notas, criticos, revelacao de reviews, XP e reputacao.

// 7. Review
/** Calcula cobertura dos alvos. */
function calculateCoverage(project) {
  return {
    programming: project.progress.programming / project.targets.programming,
    graphics: project.progress.graphics / project.targets.graphics,
    design: project.progress.design / project.targets.design,
    sound: project.progress.sound / project.targets.sound,
    polish: project.progress.polish / project.targets.polish
  };
}

/** Calcula a media de preenchimento dos cinco alvos. */
function averageCoverage(project) {
  const c = calculateCoverage(project);
  return (c.programming + c.graphics + c.design + c.sound + c.polish) / 5;
}

/** Converte a cobertura de um alvo em nota-base. */
function coverageToScore(c) {
  let score;
  if (c < 0.5) score = 2 + c * 4;
  else if (c < 1) score = 4 + c * 2;
  else if (c < 1.5) score = 5.5 + (c - 1) * 3;
  else if (c < 2) score = 7 + (c - 1.5) * 2;
  else score = 8 + Math.min((c - 2) * 1.2, 2);
  return clamp(score, 1, 10);
}

/** Calcula deadline expectation penalty. */
function calculateDeadlineExpectationPenalty(project) {
  const plannedWeeks = project.plannedWeeks || Math.max(1, project.deadlineWeek - (project.launchedAt || gameState.week));
  const reasonableWeeks = calculateReasonableWeeks(project.ambition);
  const ratio = plannedWeeks / reasonableWeeks;

  if (ratio < 1.6) return 0;
  if (ratio < 2.2) return 0.35;
  if (ratio < 3) return 0.75;
  return 1.2;
}

/** Calcula a nota de um critico sem usar a logica comercial de vendas. */
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

/** Calcula a media recente de reviews do estudio. */
function studioReviewHistory() {
  if (!gameState.releasedGames.length) return gameState.reputation / 10;
  const last = gameState.releasedGames.slice(-3);
  return last.reduce((sum, game) => sum + game.averageReview, 0) / last.length;
}

/** Estima a qualidade para regras de desbloqueio de criticos. */
function estimateQuality(project) {
  const fakeReviewer = { weights: { programming: 0.22, graphics: 0.2, design: 0.28, sound: 0.1, polish: 0.2 }, name: "Estimate" };
  return calculateReviewerScore(project, fakeReviewer);
}

/** Gera review quote. */
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

/** Finaliza o projeto, gera reviews e inicia sua vida comercial. */
function releaseGame() {
  const project = gameState.currentProject;
  if (!project) return;

  if (typeof tutorialActive !== "undefined" && tutorialActive) {
    project.reviews = [createTutorialReview(project)];
  } else {
    const unlocked = reviewers.filter((reviewer) => reviewer.unlock(project)).slice(0, 4);
    project.reviews = unlocked.map((reviewer) => {
      const score = Math.round(calculateReviewerScore(project, reviewer));
      return {
        name: reviewer.name,
        reach: reviewer.reach,
        score,
        quote: generateReviewQuote(project, score),
        image: getReviewerImagePath(reviewer.name)
      };
    });
  }

  project.averageReview = Math.round(project.reviews.reduce((sum, review) => sum + review.score, 0) / project.reviews.length);
  project.status = "released";
  project.launchedAt = gameState.week;
  project.launchReputation = clamp(Number(gameState.reputation || project.studioReputationAtStart || 0), 0, 100);
  project.salesCeiling = calculateSalesCeiling(project);
  project.weeklySalesDecay = project.averageReview >= 8 ? 0.56 : project.averageReview >= 6 ? 0.48 : 0.36;
  if (project.hype > 80) project.weeklySalesDecay += 0.05;

  if (typeof tutorialActive === "undefined" || !tutorialActive) {
    updateDeveloperXP(project);
    updateStudioAfterRelease(project);
  }
  gameState.releasedGames.push(project);
  gameState.lastReviews = project.reviews;
  gameState.currentProject = null;
  addLog(`${project.name} foi lancado com media ${project.averageReview}. Agora ele sera julgado por carteiras, cliques e memoria seletiva.`);
  if (project.luckyBreak && project.luckyBreak.active) {
    addLog(`${project.name} encontrou uma sorte rara: clipes, recomendacoes e curiosidade empurraram o jogo alem do nicho esperado.`);
  }
  if (typeof tutorialActive !== "undefined" && tutorialActive) {
    startTutorialReviewIntro(project);
  } else {
    updateReleasedGamesSales(project);
    showReviewReveal(project);
  }
}

/** Cria tutorial review. */
function createTutorialReview(project) {
  return {
    name: "Indie Aficionado",
    reach: 10,
    score: 7,
    quote: `Olho neste novo desenvolvedor, seu primeiro jogo ja foi um estouro! Isso nao e normal, ainda mais para alguem sem investimento e historico. O jogo e muito divertido, tudo funciona perfeitamente. Este jogo simples, sem tanta ambicao, foi perfeitamente executado e com um prazo justo! Certamente estou empolgado para os proximos trabalhos do ${gameState.developerName}.`,
    image: getReviewerImagePath("Indie Aficionado")
  };
}

/** Abre o resumo e a confirmacao final de lancamento. */
function showLaunchConfirmation() {
  const project = gameState.currentProject;
  if (!project || activeModal?.type === "launch-confirmation") return;

  const coverage = calculateCoverage(project);
  const rows = ["programming", "graphics", "design", "sound", "polish"].map((key) => {
    const current = project.progress[key];
    const target = project.targets[key];
    const ratio = clamp((current / target) * 100, 0, 140);
    const value = key === "polish"
      ? `${Math.round(current)}% / ${Math.round(target)}%`
      : `${Math.round(current)} / ${Math.round(target)}`;
    return `
      <div class="launch-summary-row">
        <span>${areaLabel(key)}</span>
        <div><i style="width:${ratio}%"></i></div>
        <strong>${value}</strong>
      </div>
    `;
  }).join("");

  showModal(
    "Pronto para lancar?",
    `<form class="launch-confirm-form" onsubmit="event.preventDefault(); confirmLaunchGame()">
      <p>O prazo acabou. Revise os ultimos detalhes antes de colocar o jogo no mundo.</p>
      <label>Nome do jogo
        <input id="launchGameName" maxlength="34" value="${escapeAttribute(project.name)}">
      </label>
      <label>Preco de lancamento
        <input id="launchGamePrice" type="number" min="1" step="0.01" value="${project.price.toFixed(2)}">
        <small>Preco sugerido: <span class="success">$${project.suggestedPrice.toFixed(2)}</span></small>
      </label>
      <div class="launch-summary">
        <h3>Resumo atual</h3>
        ${rows}
      </div>
      <button class="launch-main-button" type="submit">Lancar o jogo!</button>
      <div class="launch-secondary-actions">
        <button class="pixel-button danger" type="button" onclick="closeModal(); showCancelProjectModal()">Cancelar jogo</button>
        <button class="pixel-button secondary" type="button" onclick="closeModal(); showDelayModal()">Adiar</button>
      </div>
    </form>`,
    []
  );
  activeModal.type = "launch-confirmation";
  document.getElementById("modal")?.classList.add("launch-confirmation-modal");
}

/** Escapa atributo. */
function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Aplica nome e preco finais antes de publicar o jogo. */
function confirmLaunchGame() {
  const project = gameState.currentProject;
  if (!project) return;

  const nameInput = document.getElementById("launchGameName");
  const priceInput = document.getElementById("launchGamePrice");
  project.name = nameInput?.value.trim() || project.name;
  project.price = clamp(Number(priceInput?.value || project.price), 1, 999);
  closeModal();
  releaseGame();
}

/** Obtem critico imagem caminho. */
function getReviewerImagePath(name) {
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `assets/images/reviewers/${slug}.png`;
}

let reviewRevealState = null;

/** Abre a experiencia animada de revelacao das reviews. */
function showReviewReveal(project) {
  showModal(
    "As reviews chegaram",
    `<div class="review-awards" style="--review-count:${project.reviews.length}">
      <header class="review-awards-head">
        <h2><span>*</span> Reviews recebidas <span>*</span></h2>
        <strong id="reviewRevealCounter">1 de ${project.reviews.length}</strong>
      </header>
      <div class="review-awards-stage">
        <div id="reviewNavCards" class="review-nav-cards">
          ${project.reviews.map((review, index) => renderReviewNavCard(review, index)).join("")}
        </div>
        <article class="review-awards-panel">
          <div class="review-panel-image" id="reviewPanelImage"></div>
          <div class="review-panel-copy">
            <h3 id="reviewPanelName"></h3>
            <p id="reviewPanelQuote"></p>
          </div>
          <div class="review-panel-score">
            <div id="reviewPanelScore">?</div>
            <span>/10</span>
          </div>
        </article>
      </div>
      <footer class="review-final-score">
        <span>Media final</span>
        <strong id="reviewFinalScore">--</strong>
        <em>/10</em>
      </footer>
    </div>`,
    [{ label: "Ver vendas", className: "green review-sales-button", action: goToSalesShelf }]
  );

  const modal = document.getElementById("modal");
  modal?.classList.add("review-reveal-modal");
  modal?.querySelector(".review-sales-button")?.setAttribute("disabled", "true");
  startReviewRevealAnimation(project);
}

/** Monta review nav card. */
function renderReviewNavCard(review, index) {
  return `
    <button class="review-nav-card" type="button" data-review-nav="${index}" onclick="selectReviewReveal(${index})">
      <span class="review-nav-image">
        <img src="${review.image}" alt="" onerror="this.remove()">
        <i>${review.name[0]}</i>
      </span>
      <strong>${review.name}</strong>
      <em data-review-nav-score="${index}">???</em>
    </button>
  `;
}

/** Inicia review reveal animation. */
function startReviewRevealAnimation(project) {
  const modal = document.getElementById("modal");
  if (!modal) return;

  reviewRevealState = {
    project,
    index: 0,
    speed: 1,
    revealed: new Set(),
    timers: [],
    scoreInterval: null,
    typingToken: 0,
    autoTimer: null
  };

  modal.addEventListener("click", speedUpReviewReveal, true);
  selectReviewReveal(0);
}

/** Seleciona review reveal. */
function selectReviewReveal(index) {
  if (!reviewRevealState) return;

  const project = reviewRevealState.project;
  if (!project.reviews[index]) return;

  clearReviewRevealTimers();
  reviewRevealState.index = index;
  renderActiveReview(index);

  if (reviewRevealState.revealed.has(index)) {
    showRevealedReview(index);
    return;
  }

  animateActiveReview(index);
}

/** Monta ativo review. */
function renderActiveReview(index) {
  const project = reviewRevealState.project;
  const review = project.reviews[index];
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.querySelector("#reviewRevealCounter").textContent = `${index + 1} de ${project.reviews.length}`;
  modal.querySelectorAll(".review-nav-card").forEach((card, cardIndex) => {
    card.classList.toggle("active", cardIndex === index);
    card.classList.toggle("revealed", reviewRevealState.revealed.has(cardIndex));
  });

  const image = modal.querySelector("#reviewPanelImage");
  image.innerHTML = `<img src="${review.image}" alt="" onerror="this.remove()"><span>${review.name[0]}</span>`;
  modal.querySelector("#reviewPanelName").textContent = "";
  modal.querySelector("#reviewPanelQuote").textContent = "";
  modal.querySelector("#reviewPanelScore").textContent = "?";
  modal.querySelector(".review-awards-panel").classList.remove("score-revealed");
}

/** Exibe revealed review. */
function showRevealedReview(index) {
  const review = reviewRevealState.project.reviews[index];
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.querySelector("#reviewPanelName").textContent = review.name;
  modal.querySelector("#reviewPanelQuote").textContent = `"${review.quote}"`;
  modal.querySelector("#reviewPanelScore").textContent = formatReviewScore(review.score);
  modal.querySelector(".review-awards-panel").classList.add("score-revealed");
}

/** Executa digitacao, imagem e nota da review selecionada. */
function animateActiveReview(index) {
  const review = reviewRevealState.project.reviews[index];
  const modal = document.getElementById("modal");
  if (!modal) return;

  const nameElement = modal.querySelector("#reviewPanelName");
  const quoteElement = modal.querySelector("#reviewPanelQuote");
  const scoreElement = modal.querySelector("#reviewPanelScore");
  const panel = modal.querySelector(".review-awards-panel");
  const token = reviewRevealState.typingToken + 1;
  reviewRevealState.typingToken = token;

  nameElement.textContent = "";
  quoteElement.textContent = "";
  panel.classList.add("is-writing");

  reviewRevealState.scoreInterval = window.setInterval(() => {
    scoreElement.textContent = randomInt(0, 10);
  }, 70);

  typeReviewText(nameElement, review.name.toUpperCase(), () => {
    typeReviewText(quoteElement, `"${review.quote}"`, () => revealReviewScore(index), 5200);
  }, 700);
}

/** Digita review texto. */
function typeReviewText(element, text, onDone, maxDuration = 6000) {
  if (!reviewRevealState || !element) return;

  const token = reviewRevealState.typingToken;
  let index = 0;
  const baseDelay = clamp(Math.floor(maxDuration / Math.max(1, text.length)), 12, 48);

  /** Executa o proximo quadro da digitacao ou animacao atual. */
  function step() {
    if (!reviewRevealState || token !== reviewRevealState.typingToken) return;
    element.textContent = text.slice(0, index);

    if (index >= text.length) {
      if (typeof onDone === "function") onDone();
      return;
    }

    index += 1;
    reviewRevealState.timers.push(window.setTimeout(step, baseDelay / reviewRevealState.speed));
  }

  step();
}

/** Finaliza a animacao e revela a nota do critico. */
function revealReviewScore(index) {
  if (!reviewRevealState) return;

  const modal = document.getElementById("modal");
  const review = reviewRevealState.project.reviews[index];
  if (!modal || !review) return;

  clearInterval(reviewRevealState.scoreInterval);
  reviewRevealState.scoreInterval = null;
  modal.querySelector("#reviewPanelScore").textContent = formatReviewScore(review.score);
  modal.querySelector(".review-awards-panel").classList.remove("is-writing");
  modal.querySelector(".review-awards-panel").classList.add("score-revealed");
  reviewRevealState.revealed.add(index);
  updateReviewNavReveal(index);

  if (reviewRevealState.revealed.size >= reviewRevealState.project.reviews.length) {
    finishReviewReveal();
    return;
  }

  reviewRevealState.autoTimer = window.setTimeout(() => {
    const nextIndex = reviewRevealState.project.reviews.findIndex((_, reviewIndex) => !reviewRevealState.revealed.has(reviewIndex));
    if (nextIndex >= 0) selectReviewReveal(nextIndex);
  }, 900 / reviewRevealState.speed);
}

/** Atualiza review nav reveal. */
function updateReviewNavReveal(index) {
  const modal = document.getElementById("modal");
  const review = reviewRevealState.project.reviews[index];
  if (!modal || !review) return;

  const card = modal.querySelector(`[data-review-nav='${index}']`);
  const score = modal.querySelector(`[data-review-nav-score='${index}']`);
  card?.classList.add("revealed");
  if (score) score.textContent = `* ${formatReviewScore(review.score)}`;
}

/** Finaliza review reveal. */
function finishReviewReveal() {
  const modal = document.getElementById("modal");
  if (!modal || !reviewRevealState) return;

  modal.querySelector("#reviewFinalScore").textContent = formatReviewScore(reviewRevealState.project.averageReview);
  modal.querySelector(".review-sales-button")?.removeAttribute("disabled");
  modal.classList.add("review-reveal-complete");
}

/** Acelera review reveal. */
function speedUpReviewReveal(event) {
  if (!reviewRevealState) return;
  if (event.target.closest(".review-sales-button")) return;
  reviewRevealState.speed = 2;
  document.getElementById("modal")?.classList.add("review-reveal-fast");
}

/** Limpa review reveal temporizadores. */
function clearReviewRevealTimers() {
  if (!reviewRevealState) return;
  reviewRevealState.timers.forEach((timer) => window.clearTimeout(timer));
  reviewRevealState.timers = [];
  window.clearTimeout(reviewRevealState.autoTimer);
  reviewRevealState.autoTimer = null;
  window.clearInterval(reviewRevealState.scoreInterval);
  reviewRevealState.scoreInterval = null;
  reviewRevealState.typingToken += 1;
}

/** Formata review nota. */
function formatReviewScore(score) {
  return String(Math.round(score));
}

/** Fecha as reviews e abre a estante nas vendas. */
function goToSalesShelf() {
  clearReviewRevealTimers();
  reviewRevealState = null;
  if (typeof tutorialActive !== "undefined" && tutorialActive) {
    const project = projectFromLastRelease();
    const modal = document.getElementById("modal");
    if (modal) modal.remove();
    activeModal = null;
    handleTutorialSalesReveal(project);
    return;
  }

  closeModal();
  activeSceneWindow = "shelf";
  activeComputerApp = "desktop";
  render();
}

/** Retorna o jogo publicado mais recentemente. */
function projectFromLastRelease() {
  return gameState.releasedGames[gameState.releasedGames.length - 1];
}

/** Atualiza desenvolvedor xp. */
function updateDeveloperXP(project) {
  const xp = calculateCareerXpGain(project);
  if (xp <= 0) {
    addLog("O lancamento trouxe experiencia, mas nao o bastante para gerar pontos de habilidade.");
    return;
  }

  gameState.careerXp += xp;
  const earnedPoints = convertCareerXpToSkillPoints();
  const pointText = earnedPoints > 0 ? ` ${earnedPoints} ponto${earnedPoints === 1 ? "" : "s"} de habilidade disponivel${earnedPoints === 1 ? "" : "s"}.` : "";
  addLog(`${project.name} gerou ${xp} XP de carreira.${pointText}`);
}

/** Calcula o XP de carreira concedido pelo jogo lancado. */
function calculateCareerXpGain(project) {
  const score = Math.round(project.averageReview || 0);
  const scoreXp = {
    1: 0,
    2: 0,
    3: 1,
    4: 1,
    5: 2,
    6: 4,
    7: 7,
    8: 10,
    9: 14,
    10: 20
  }[score] || 0;

  const ambitionBonus = project.ambition >= 70 && score >= 7 ? 3 : project.ambition >= 40 && score >= 7 ? 1 : 0;
  const salesBonus = project.totalRevenue >= 100000 ? 3 : project.totalRevenue >= 40000 ? 1 : 0;
  return scoreXp + ambitionBonus + salesBonus;
}

/** Calcula o custo de XP do proximo ponto de habilidade. */
function getNextSkillPointCost() {
  const earned = Number(gameState.skillPointsEarned || 0);
  return Math.round(10 + earned * 6 + Math.pow(earned, 1.55) * 5 + Math.pow(earned, 2) * 0.45);
}

/** Converte o XP acumulado em pontos de habilidade. */
function convertCareerXpToSkillPoints() {
  let earned = 0;
  let nextCost = getNextSkillPointCost();

  while (gameState.careerXp >= nextCost) {
    gameState.careerXp -= nextCost;
    gameState.skillPoints += 1;
    gameState.skillPointsEarned = Number(gameState.skillPointsEarned || 0) + 1;
    earned += 1;
    nextCost = getNextSkillPointCost();
  }

  return earned;
}

/** Aplica a variacao de reputacao causada pelo lancamento. */
function updateStudioAfterRelease(project) {
  const avg = project.averageReview;
  let reputationChange = 0;
  if (avg >= 9) {
    reputationChange = 8;
  } else if (avg >= 8) {
    reputationChange = 5;
  } else if (avg >= 7) {
    reputationChange = 3;
  } else if (avg >= 6) {
    reputationChange = 1;
  } else if (avg < 3) {
    reputationChange = -10;
  } else if (avg < 5) {
    reputationChange = -5;
  } else {
    reputationChange = -2;
  }

  if (avg < 6) {
    const ambitionPenalty = Math.round((project.ambition / 100) * (6 - avg) * 3);
    reputationChange -= ambitionPenalty;
  }

  gameState.reputation += reputationChange;
  if (project.earlyLaunchReputationImpact) {
    gameState.reputation += project.earlyLaunchReputationImpact;
  }

  gameState.reputation = clamp(gameState.reputation, 0, 100);
  project.reputationChange = reputationChange + Number(project.earlyLaunchReputationImpact || 0);
}
