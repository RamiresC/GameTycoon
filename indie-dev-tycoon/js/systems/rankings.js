// Arquivo: js/systems/rankings.js
// Responsabilidade: Simulacao do mercado, empresas rivais e telas de ranking.

// 9. Rankings e mercado
/** Cria rival empresa. */
function createRivalCompany(profile) {
  const firstWindow = profile.releaseWindows ? profile.releaseWindows[0] : [profile.cadence || 24, profile.cadence || 36];
  return {
    id: profile.id,
    name: profile.name,
    score: profile.initialScore,
    nextReleaseWeek: profile.nextReleaseWeek || randomInt(firstWindow[0], firstWindow[1]),
    releaseCount: 0,
    currentGame: null,
    releasedGames: [],
    lastGame: null
  };
}

/** Garante rival empresa estado. */
function ensureRivalCompanyState() {
  if (!Array.isArray(gameState.rivalCompanies)) {
    gameState.rivalCompanies = [];
  }

  rivalCompanies.forEach((profile) => {
    let company = gameState.rivalCompanies.find((item) => item.id === profile.id);
    if (!company) {
      company = createRivalCompany(profile);
      gameState.rivalCompanies.push(company);
    }

    company.name = profile.name;
    company.score = Number(company.score || profile.initialScore);
    if (!Number(company.nextReleaseWeek)) {
      const firstWindow = profile.releaseWindows ? profile.releaseWindows[0] : [profile.cadence || 24, profile.cadence || 36];
      company.nextReleaseWeek = profile.nextReleaseWeek || randomInt(firstWindow[0], firstWindow[1]);
    }
    company.releaseCount = Number(company.releaseCount || 0);
    if (company.id === "popstar" && company.releaseCount === 0 && company.nextReleaseWeek < 80) {
      company.nextReleaseWeek = randomInt(80, 120);
    }
    company.currentGame = company.currentGame || null;
    company.releasedGames = Array.isArray(company.releasedGames) ? company.releasedGames : [];
    if (company.currentGame && (!company.lastGame || company.lastGame.name === company.currentGame.name)) {
      company.lastGame = company.currentGame;
    }
  });
}

/** Obtem rival perfil. */
function getRivalProfile(companyId) {
  return rivalCompanies.find((profile) => profile.id === companyId);
}

/** Gera rival jogo nome. */
function generateRivalGameName(profile) {
  const prefix = profile.gamePrefixes[randomInt(0, profile.gamePrefixes.length - 1)];
  const suffixes = ["Reborn", "Legacy", "Ultimate", "World Tour", "Infinite", "Deluxe", "After Hours"];
  return `${prefix}: ${suffixes[randomInt(0, suffixes.length - 1)]}`;
}

/** Calcula rival lancamento. */
function calculateRivalRelease(profile) {
  const review = Number(randomFloat(profile.reviewRange[0], profile.reviewRange[1]).toFixed(1));
  const salesTarget = randomInt(profile.salesRange[0], profile.salesRange[1]);
  const reviewBonus = Math.max(0, review - 5) * 900;
  const launchSales = Math.round(salesTarget * randomFloat(0.16, 0.28));
  const weeklyDecay = review >= 8.5 ? 0.83 : review >= 7 ? 0.72 : 0.58;
  const scoreGain = Math.round((reviewBonus + launchSales / 1500) * profile.scoreMultiplier);

  return {
    name: generateRivalGameName(profile),
    week: gameState.week,
    review,
    sales: launchSales,
    totalSales: launchSales,
    salesTarget,
    weeklySales: launchSales,
    weeklyDecay,
    scoreGain
  };
}

/** Agenda proximo rival lancamento. */
function scheduleNextRivalRelease(company, profile) {
  const windows = profile.releaseWindows || [[24, 36]];
  const window = windows[Math.min(company.releaseCount, windows.length - 1)];
  company.nextReleaseWeek = gameState.week + randomInt(window[0], window[1]);
}

/** Atualiza rival jogo vendas. */
function updateRivalGameSales(company, profile) {
  const game = company.currentGame;
  if (!game || game.status !== "selling") return;
  if (gameState.week >= company.nextReleaseWeek) {
    game.status = "archived";
    return;
  }

  const remaining = Math.max(0, game.salesTarget - game.totalSales);
  if (remaining <= 0) return;

  const sales = Math.min(remaining, Math.round(game.weeklySales * randomFloat(0.86, 1.08)));
  game.weeklySales = Math.max(0, Math.round(sales * game.weeklyDecay));
  game.totalSales += sales;
  game.sales = game.totalSales;
  if (company.lastGame && company.lastGame.name === game.name) {
    company.lastGame.totalSales = game.totalSales;
    company.lastGame.sales = game.totalSales;
  }
  company.score += Math.round((sales / 1800) * profile.scoreMultiplier);
}

/** Atualiza rival empresas. */
function updateRivalCompanies() {
  ensureRivalCompanyState();

  gameState.rivalCompanies.forEach((company) => {
    const profile = getRivalProfile(company.id);
    if (!profile) return;

    applyRivalPassiveGrowth(company, profile);
    updateRivalGameSales(company, profile);
    if (gameState.week < company.nextReleaseWeek) return;

    const release = calculateRivalRelease(profile);
    const activeRelease = { ...release, status: "selling" };
    company.score += activeRelease.scoreGain;
    company.currentGame = activeRelease;
    company.lastGame = activeRelease;
    company.releasedGames.unshift(activeRelease);
    company.releasedGames = company.releasedGames.slice(0, 4);
    company.releaseCount += 1;
    scheduleNextRivalRelease(company, profile);

    if (release.review >= 8.5 || release.salesTarget >= profile.salesRange[1] * 0.82) {
      addLog(`${company.name} lancou ${release.name}: nota ${release.review}, estreia com ${prettyNumber(release.totalSales)} copias. O mercado ficou mais barulhento.`);
    }
  });

  updateIndieCompanies();
}

/** Aplica rival passive growth. */
function applyRivalPassiveGrowth(company, profile) {
  const cadencePressure = Math.max(1, 40 / (profile.releaseWindows?.[0]?.[1] || 40));
  const brandPower = Math.max(1, profile.initialScore / 50000);
  const weeklyGain = Math.round(randomFloat(4, 14) * cadencePressure * brandPower * profile.scoreMultiplier);
  company.score += weeklyGain;
}

/** Retorna a lista de nomes usados pelas empresas indies simuladas. */
function getIndieCompanyNames() {
  return [
    "Garage Spark", "Tiny Meteor", "Blue Ant Studio", "Nightly Bug", "Pixel Broth",
    "Soft Lemon", "Patch Kids", "Moonlit Code", "Broken Save", "Late Coffee",
    "Bit Basement", "Demo Orchard", "Quiet Cartridge", "Small Torch", "Loop Harbor",
    "Mini Boss Lab", "Low Battery", "Coffee Save", "Small Patch", "Neon Jam",
    "Basement Forge", "Debug Valley", "Pixel Umbrella", "Pocket Noise", "Sleepy Engine"
  ];
}

/** Garante indie empresa estado. */
function ensureIndieCompanyState() {
  if (!Array.isArray(gameState.indieCompanies)) {
    gameState.indieCompanies = [];
  }

  const names = getIndieCompanyNames();
  names.forEach((name, index) => {
    let company = gameState.indieCompanies.find((item) => item.name === name);
    if (!company) {
      company = {
        id: `indie-${index}`,
        name,
        score: randomInt(40, 260),
        momentum: randomFloat(0.7, 1.45),
        nextGrowthWeek: randomInt(2, 8)
      };
      gameState.indieCompanies.push(company);
    }

    company.score = Number(company.score || 1);
    company.momentum = Number(company.momentum || 1);
    company.nextGrowthWeek = Number(company.nextGrowthWeek || gameState.week + randomInt(2, 8));
  });
}

/** Atualiza indie empresas. */
function updateIndieCompanies() {
  ensureIndieCompanyState();

  gameState.indieCompanies.forEach((company) => {
    if (gameState.week < company.nextGrowthWeek) return;

    const gain = Math.max(1, Math.round(randomInt(1, 5) * company.momentum));
    company.score += gain;
    company.nextGrowthWeek = gameState.week + randomInt(3, 9);
  });
}

/** Obtem empresa ranking. */
function getCompanyRanking() {
  ensureRivalCompanyState();
  return [...gameState.rivalCompanies].sort((a, b) => b.score - a.score);
}

/** Calcula quanto o dinheiro influencia a pontuacao de mercado. */
function getMoneyInfluenceScore() {
  if (gameState.money < 1000000) return 0;
  return Math.round((Math.log10(gameState.money) - 6) * 80);
}

/** Calcula a pontuacao de mercado atual do estudio. */
function getStudioMarketScore() {
  const catalogScore = gameState.releasedGames.reduce((sum, game) => {
    const qualityScore = Math.max(0, game.averageReview - 5) * 35;
    const salesScore = Math.min(game.totalSales / 5000, 80);
    return sum + qualityScore + salesScore + 10;
  }, 0);

  return Math.round(gameState.reputation * 8 + catalogScore + getMoneyInfluenceScore());
}

/** Calcula a posicao do estudio entre todas as empresas. */
function getStudioMarketPosition() {
  const score = getStudioMarketScore();
  return {
    score,
    position: clamp(1000 - score, 1, 1000),
    total: 1000
  };
}

/** Obtem all mercado jogos. */
function getAllMarketGames() {
  const rivalGames = gameState.rivalCompanies.flatMap((company) =>
    (company.releasedGames || []).map((game) => ({
      name: game.name,
      studio: company.name,
      weeklySales: game.weeklySales || 0,
      monthlySales: Math.round((game.weeklySales || game.totalSales || 0) * 2.6),
      totalSales: game.totalSales || game.sales || 0
    }))
  );

  const playerGames = gameState.releasedGames.map((game) => {
    const lastFour = game.salesHistory.slice(-4);
    return {
      name: game.name,
      studio: gameState.studioName,
      weeklySales: game.salesHistory.at(-1)?.sales || 0,
      monthlySales: lastFour.reduce((sum, week) => sum + week.sales, 0),
      totalSales: game.totalSales || 0
    };
  });

  return [...rivalGames, ...playerGames];
}

/** Monta top mercado jogos. */
function renderTopMarketGames(period) {
  const key = period === "month" ? "monthlySales" : "weeklySales";
  const label = period === "month" ? "mes" : "semana";
  const games = getAllMarketGames()
    .filter((game) => game[key] > 0)
    .sort((a, b) => b[key] - a[key])
    .slice(0, 5);

  if (!games.length) return `<p class="subtle">Nenhum jogo vendendo esta ${label}.</p>`;

  return games.map((game, index) => `
    <p>${index + 1}. ${game.name}<br>
      <span class="subtle">${game.studio} - ${prettyNumber(game[key])} copias</span>
    </p>
  `).join("");
}

/** Retorna empresas proximas ao jogador no ranking indie. */
function getIndieRankingNeighbors() {
  ensureIndieCompanyState();
  const studio = getStudioMarketPosition();
  const playerEntry = {
    name: gameState.studioName,
    score: studio.score,
    player: true
  };

  const ranked = [...gameState.indieCompanies, playerEntry]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      position: clamp(studio.position - 4 + index, 1, studio.total)
    }));

  const playerIndex = ranked.findIndex((entry) => entry.player);
  const start = clamp(playerIndex - 4, 0, Math.max(0, ranked.length - 9));

  return ranked.slice(start, start + 9);
}

/** Monta player jogo vendas ranking. */
function renderPlayerGameSalesRanking() {
  const games = [...gameState.releasedGames].sort((a, b) => b.totalSales - a.totalSales);
  if (!games.length) return "<p class='subtle'>Voce ainda nao tem jogos lancados.</p>";

  return games.map((game, index) => `
    <p>${index + 1}. ${game.name}<br>
      <span class="subtle">${prettyNumber(game.totalSales)} copias totais - ${formatMoney(game.totalRevenue)}</span>
    </p>
  `).join("");
}

/** Monta computador rankings. */
function renderComputerRankings() {
  ensureRivalCompanyState();

  const companies = getCompanyRanking().slice(0, 5);
  const studioPosition = getStudioMarketPosition();
  const indieNeighbors = getIndieRankingNeighbors();

  return `
    <section class="pc-ranking">
      <div class="pc-ranking-header">
        <h2>Ranking</h2>
        <span>Semana ${gameState.week}</span>
      </div>

      <div class="pc-ranking-grid">
        <article class="pc-ranking-card wide">
          <h3>Ranking global</h3>
          <div class="pc-ranking-columns">
            <div>
              <h4>Top 5 empresas</h4>
              ${companies.map((company, index) => `<p>${index + 1}. ${company.name} - ${prettyNumber(company.score)} pts</p>`).join("")}
            </div>
            <div>
              <h4>Top jogos da semana</h4>
              ${renderTopMarketGames("week")}
            </div>
            <div>
              <h4>Top jogos do mes</h4>
              ${renderTopMarketGames("month")}
            </div>
          </div>
        </article>

        <article class="pc-ranking-card">
          <h3>Seu ranking</h3>
          <p><strong>${studioPosition.position}/${studioPosition.total}</strong> - ${prettyNumber(studioPosition.score)} pts</p>
          ${indieNeighbors.map((entry) => `
            <p class="${entry.player ? "player-ranking-row" : ""}">
              ${entry.position}. ${entry.name} - ${prettyNumber(entry.score)} pts
            </p>
          `).join("")}
        </article>

        <article class="pc-ranking-card">
          <h3>Seus jogos por venda</h3>
          ${renderPlayerGameSalesRanking()}
        </article>
      </div>
    </section>
  `;
}
