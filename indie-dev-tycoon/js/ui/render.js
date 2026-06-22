// 10. Renderizacao
function render() {
  const previousComputerScroll = document.querySelector(".computer-screen")?.scrollTop || 0;
  const restoreComputerScroll = activeSceneWindow === "desk" && !shouldAnimateComputerOpen;
  renderHeader();
  renderSpeechBubble();
  const root = document.getElementById("app");
  root.classList.toggle("computer-ui", activeSceneWindow === "desk");
  root.innerHTML = renderSceneWindow();
  shouldAnimateComputerOpen = false;
  const form = document.querySelector("form");
  if (form) updateProjectFormHints(form);
  if (restoreComputerScroll) {
    const computerScreen = document.querySelector(".computer-screen");
    if (computerScreen) computerScreen.scrollTop = previousComputerScroll;
  }
}

function renderHeader() {
  document.getElementById("topbar").innerHTML = `
    <div class="stat"><strong>Estudio</strong><span>${gameState.studioName}</span></div>
    <div id="moneyStat" class="stat money-stat"><strong>Dinheiro</strong><span>${formatMoney(gameState.money)}</span></div>
    <div class="stat"><strong>Semana</strong><span>${gameState.week}</span></div>
    <div class="stat"><strong>Reputacao</strong><span>${gameState.reputation}/100</span></div>
  `;
  if (gameState.lastMoneyChange) showMoneyPopup(gameState.lastMoneyChange.amount, gameState.lastMoneyChange.id);
}

function renderSpeechBubble() {
  const bubble = document.getElementById("speechBubble");
  if (!bubble) return;
  bubble.classList.toggle("is-compact", Boolean(activeSceneWindow));
  bubble.textContent = speechBubbleText || "Clique no computador, na estante ou na janela para abrir os paineis.";
}

function openSceneWindow(windowName) {
  if (windowName === "desk" && activeSceneWindow !== "desk") {
    activeComputerApp = "desktop";
    shouldAnimateComputerOpen = true;
  }
  activeSceneWindow = windowName;
  render();
}

function closeSceneWindow() {
  activeSceneWindow = null;
  render();
}

function renderSceneWindow() {
  if (!activeSceneWindow) return "";

  if (activeSceneWindow === "shelf") {
    return `
      <div class="scene-window">
        <div class="window-title">Estante</div>
        <button class="window-close" onclick="closeSceneWindow()" aria-label="Fechar janela">X</button>
        ${renderWindowTabs()}
        ${renderDeveloper()}
        ${renderReleasedGames()}
        ${renderRankings()}
      </div>
    `;
  }

  if (activeSceneWindow === "window") {
    return `
      <div class="scene-window">
        <div class="window-title">Janela</div>
        <button class="window-close" onclick="closeSceneWindow()" aria-label="Fechar janela">X</button>
        ${renderWindowTabs()}
        ${gameState.lastReviews.length ? renderLastReviews() : ""}
        ${renderLogs()}
      </div>
    `;
  }

  return renderComputerWindow();
}

function setComputerApp(appName) {
  activeComputerApp = appName;
  render();
}

function setProjectActionTab(tabName) {
  activeProjectActionTab = tabName;
  render();
}

function renderComputerWindow() {
  const appTitle = {
    desktop: "Area de trabalho",
    create: gameState.currentProject ? "Projeto em desenvolvimento" : "Criar um jogo",
    ranking: "Ranking",
    chat: "Chat",
    bank: "Banco",
    anazon: "Anazon",
    guru: "Dev Guru"
  }[activeComputerApp];

  return `
    <div class="computer-shell ${shouldAnimateComputerOpen ? "is-opening" : ""}">
      <div class="computer-lid" aria-hidden="true"></div>
      <div class="computer-bezel">
        <div class="computer-titlebar">
          <span>KOSHI OS</span>
          <span>${appTitle}</span>
          <button class="computer-close" onclick="closeSceneWindow()" aria-label="Fechar computador">X</button>
        </div>
        <div class="computer-screen">
          ${renderComputerContent()}
        </div>
      </div>
    </div>
  `;
}

function renderComputerContent() {
  if (activeComputerApp === "ranking") {
    return `
      <div class="computer-workspace">
        ${renderComputerTabs()}
        <main class="computer-app-area">
          ${renderComputerRankings()}
        </main>
      </div>
    `;
  }

  if (activeComputerApp === "create" || gameState.currentProject) {
    return `
      <div class="computer-workspace">
        ${renderComputerTabs()}
        <main class="computer-app-area">
          ${gameState.currentProject ? renderProject(gameState.currentProject) : renderHome()}
        </main>
      </div>
    `;
  }

  return `
    <div class="computer-workspace">
      ${renderComputerTabs()}
      <main class="computer-app-area">
        <div class="computer-desktop">
          <button class="computer-desktop-app" onclick="setComputerApp('create')">
            <span class="computer-app-icon">+</span>
            <strong>Criar um jogo</strong>
          </button>
          <button class="computer-desktop-app is-locked" aria-disabled="true">
            <span class="computer-app-icon">A</span>
            <strong>Anazon</strong>
          </button>
          <button class="computer-desktop-app is-locked" aria-disabled="true">
            <span class="computer-app-icon">D</span>
            <strong>Dev Guru</strong>
          </button>
          <button class="computer-desktop-app" onclick="setComputerApp('ranking')">
            <span class="computer-app-icon">#</span>
            <strong>Ranking</strong>
          </button>
          <button class="computer-desktop-app is-locked" aria-disabled="true">
            <span class="computer-app-icon">C</span>
            <strong>Chat</strong>
          </button>
          <button class="computer-desktop-app is-locked" aria-disabled="true">
            <span class="computer-app-icon">$</span>
            <strong>Banco</strong>
          </button>
        </div>
      </main>
    </div>
  `;
}

function renderComputerTabs() {
  return `
    <nav class="computer-tabs" aria-label="Aplicativos do computador">
      ${renderComputerAppButton("desktop", "Inicio", true)}
      ${renderComputerAppButton("create", "Criar um jogo", true)}
      ${renderComputerAppButton("ranking", "Ranking", true)}
      ${renderComputerAppButton("chat", "Chat", false)}
      ${renderComputerAppButton("bank", "Banco", false)}
      ${renderComputerAppButton("anazon", "Anazon", false)}
      ${renderComputerAppButton("guru", "Dev Guru", false)}
    </nav>
  `;
}

function renderComputerAppButton(appName, label, enabled) {
  const active = appName === activeComputerApp || (appName === "create" && gameState.currentProject);
  return `
    <button class="computer-tab ${active ? "active" : ""} ${enabled ? "" : "is-locked"}" ${enabled ? `onclick="setComputerApp('${appName}')"` : `aria-disabled="true"`}>
      ${label}
    </button>
  `;
}

function renderWindowTabs() {
  return `
    <div class="window-tabs">
      <button class="pixel-button ${activeSceneWindow === "desk" ? "green" : "ghost"}" onclick="openSceneWindow('desk')">Computador</button>
      <button class="pixel-button ${activeSceneWindow === "shelf" ? "green" : "ghost"}" onclick="openSceneWindow('shelf')">Estante</button>
      <button class="pixel-button ${activeSceneWindow === "window" ? "green" : "ghost"}" onclick="openSceneWindow('window')">Janela</button>
    </div>
  `;
}

function renderHome() {
  return `
    <section class="create-app">
      ${renderCreateProject()}
      <div class="modal-actions">
        <button class="pixel-button secondary" onclick="advanceIdleWeek()">Avancar semana</button>
      </div>
    </section>
  `;
}

function renderCreateProject() {
  const defaultAmbition = 50;
  return `
    <form class="form-grid" onsubmit="startProject(event)" onchange="updateProjectFormHints(this)" oninput="updateProjectFormHints(this)">
      <label>Nome do jogo
        <input name="gameName" maxlength="34" value="Neon Deadline">
      </label>
      <label>Tema
        <select name="theme">${themes.map((theme) => `<option>${theme}</option>`).join("")}</select>
      </label>
      <label>Genero
        <select name="genre">${Object.keys(genres).map((genre) => `<option>${genre}</option>`).join("")}</select>
      </label>
      <label>Plataforma
        <select name="platform">${Object.values(platforms).map((platform) => `<option value="${platform.id}">${platform.name}</option>`).join("")}</select>
      </label>
      <label>Ambicao: <span id="ambitionHint">${defaultAmbition}</span>
        <input type="range" name="ambition" min="1" max="100" value="${defaultAmbition}">
      </label>
      <label>Prazo em semanas
        <input type="number" name="weeks" min="4" max="80" value="24">
      </label>
      <label>Preço de lancamento
        <input type="number" name="price" min="1" step="0.01" value="${calculateSuggestedPrice(defaultAmbition)}">
      </label>
      <div class="card">
        <h3>Resumo</h3>
        <p id="formHint" class="subtle"></p>
      </div>
      <button class="pixel-button green" type="submit">Criar novo jogo</button>
    </form>
  `;
}

function updateProjectFormHints(form) {
  const ambition = Number(form.ambition.value);
  const platform = platforms[form.platform.value];
  const suggested = calculateSuggestedPrice(ambition);
  const ambitionHint = document.getElementById("ambitionHint");
  const formHint = document.getElementById("formHint");
  if (ambitionHint) ambitionHint.textContent = ambition;
  if (formHint) {
    formHint.innerHTML = `
      Preco sugerido: <span class="success">$${suggested.toFixed(2)}</span><br>
      Licenca: <span class="${platform.licenceCost ? "warning" : "success"}">${formatMoney(platform.licenceCost)}</span><br>
      ${platform.description}
    `;
  }
}

function renderCreateProject() {
  const defaultAmbition = 50;
  const defaultTheme = themes[0];
  const defaultGenre = Object.keys(genres)[0];
  const defaultPlatform = platforms.steam;
  return `
    <form class="project-builder" onsubmit="startProject(event)" onchange="updateProjectFormHints(this)" oninput="updateProjectFormHints(this)">
      <input type="hidden" name="theme" value="${defaultTheme}">
      <input type="hidden" name="genre" value="${defaultGenre}">
      <input type="hidden" name="platform" value="${defaultPlatform.id}">

      <label class="project-name-field">Nome do jogo
        <input name="gameName" maxlength="34" value="Neon Deadline">
      </label>

      <div class="project-choice-row">
        ${renderChoiceField("theme", "Tema", defaultTheme)}
        ${renderChoiceField("genre", "Genero", defaultGenre)}
      </div>

      <div class="platform-choice" role="button" tabindex="0" onclick="showPlatformPicker(this.closest('form'))" onkeydown="if(event.key === 'Enter') showPlatformPicker(this.closest('form'))">
        <div id="platformArt" class="choice-art platform-art"><span>${defaultPlatform.name[0]}</span><img src="${getChoiceImagePath("platform", defaultPlatform.name)}" alt="" onerror="this.remove()"></div>
        <div>
          <strong>Plataforma</strong>
          <span id="platformChoiceName">${defaultPlatform.name}</span>
          <small id="platformChoiceSummary">${defaultPlatform.type} - mercado base ${prettyNumber(defaultPlatform.marketBase)} - ${Math.round(defaultPlatform.revenueShare * 100)}% por venda</small>
        </div>
      </div>

      <div class="scope-row">
        <label>Ambicao: <span id="ambitionHint">${defaultAmbition}</span>
          <input type="range" name="ambition" min="1" max="100" value="${defaultAmbition}">
        </label>
        <label>Prazo em semanas
          <input type="number" name="weeks" min="4" max="80" value="24">
        </label>
      </div>

      <div id="scopeAdvice" class="scope-advice"></div>

      <div class="price-summary-row">
        <label class="price-field">Preco do jogo
          <input type="number" name="price" min="1" step="0.01" value="${calculateSuggestedPrice(defaultAmbition)}">
          <small id="suggestedPriceHint"></small>
        </label>
        <div class="project-general-summary">
          <h3>Resumo geral</h3>
          <p id="projectSummary"></p>
        </div>
      </div>

      <div id="floatingPicker" class="floating-picker" hidden></div>
      <button class="pixel-button green" type="submit">Criar novo jogo</button>
    </form>
  `;
}

function renderChoiceField(type, label, value) {
  return `
    <button type="button" class="project-choice" onclick="showChoicePicker('${type}', this.closest('form'))">
      <span id="${type}ChoiceArt" class="choice-art"><span>${value[0]}</span><img src="${getChoiceImagePath(type, value)}" alt="" onerror="this.remove()"></span>
      <span>
        <strong>${label}</strong>
        <small id="${type}ChoiceName">${value}</small>
      </span>
    </button>
  `;
}

function getChoiceImagePath(type, value) {
  const slug = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `assets/images/${type}s/${slug}.png`;
}

function renderChoiceArt(type, value, extraClass = "") {
  return `
    <span class="choice-art ${extraClass}">
      <span>${value[0]}</span>
      <img src="${getChoiceImagePath(type, value)}" alt="" onerror="this.remove()">
    </span>
  `;
}

function showChoicePicker(type, form) {
  const picker = form.querySelector("#floatingPicker");
  const options = type === "theme" ? themes : Object.keys(genres);
  const title = type === "theme" ? "Escolha o tema" : "Escolha o genero";
  picker.hidden = false;
  picker.className = "floating-picker";
  picker.innerHTML = `
    <div class="floating-picker-head">
      <strong>${title}</strong>
      <button type="button" onclick="closeCreatePicker(this.closest('form'))">X</button>
    </div>
    <div class="choice-grid">
      ${options.map((option) => `
        <button type="button" class="choice-card" onclick="selectCreateOption('${type}', '${option}', this.closest('form'))">
          ${renderChoiceArt(type, option)}
          <strong>${option}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function showPlatformPicker(form) {
  const picker = form.querySelector("#floatingPicker");
  picker.hidden = false;
  picker.className = "floating-picker platform-picker";
  picker.innerHTML = `
    <div class="floating-picker-head">
      <strong>Escolha a plataforma</strong>
      <button type="button" onclick="closeCreatePicker(this.closest('form'))">X</button>
    </div>
    <div class="platform-grid">
      ${Object.values(platforms).map((platform) => `
        <button type="button" class="platform-card" onclick="selectCreateOption('platform', '${platform.id}', this.closest('form'))">
          ${renderChoiceArt("platform", platform.name, "platform-card-art")}
          <span>
            <strong>${platform.name}</strong>
            <small>${platform.description}</small>
            <em>Foco: ${platform.type}. Mercado base: ${prettyNumber(platform.marketBase)}. Ganho por venda: ${Math.round(platform.revenueShare * 100)}%.</em>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

function selectCreateOption(type, value, form) {
  form.elements[type].value = value;
  closeCreatePicker(form);
  updateProjectFormHints(form);
}

function closeCreatePicker(form) {
  const picker = form.querySelector("#floatingPicker");
  if (picker) picker.hidden = true;
}

function updateProjectFormHints(form) {
  const ambition = Number(form.ambition.value);
  const platform = platforms[form.platform.value];
  const theme = form.theme.value;
  const genre = form.genre.value;
  const weeks = Number(form.weeks.value);
  const price = Number(form.price.value);
  const suggested = calculateSuggestedPrice(ambition);
  const ambitionHint = document.getElementById("ambitionHint");
  if (ambitionHint) ambitionHint.textContent = ambition;
  updateChoicePreview("theme", theme);
  updateChoicePreview("genre", genre);
  updatePlatformPreview(platform);
  updateScopeAdvice(ambition, weeks);
  updateProjectSummary(form, platform, theme, genre, price, suggested);
}

function updateChoicePreview(type, value) {
  const name = document.getElementById(`${type}ChoiceName`);
  const art = document.getElementById(`${type}ChoiceArt`);
  if (name) name.textContent = value;
  if (art) art.innerHTML = `<span>${value[0]}</span><img src="${getChoiceImagePath(type, value)}" alt="" onerror="this.remove()">`;
}

function updatePlatformPreview(platform) {
  const name = document.getElementById("platformChoiceName");
  const summary = document.getElementById("platformChoiceSummary");
  const art = document.getElementById("platformArt");
  if (name) name.textContent = platform.name;
  if (summary) summary.textContent = `${platform.type} - mercado base ${prettyNumber(platform.marketBase)} - ${Math.round(platform.revenueShare * 100)}% por venda`;
  if (art) art.innerHTML = `<span>${platform.name[0]}</span><img src="${getChoiceImagePath("platform", platform.name)}" alt="" onerror="this.remove()">`;
}

function updateScopeAdvice(ambition, weeks) {
  const advice = document.getElementById("scopeAdvice");
  if (!advice) return;

  const expected = calculateExpectedWeeks(ambition);
  const reasonable = calculateReasonableWeeks(ambition);
  const ratio = weeks / reasonable;
  let tone = "success";
  let text = `Prazo saudavel: para ambicao ${ambition}, mire entre ${expected} e ${reasonable} semanas.`;
  if (ratio < 0.75) {
    tone = "danger-text";
    text = `Prazo apertado: ambicao ${ambition} tende a pedir pelo menos ${expected} semanas para nao sair cru.`;
  } else if (ratio > 1.8) {
    tone = "warning";
    text = `Prazo longo demais para esse escopo. O publico pode esperar algo maior que a ambicao ${ambition} entrega.`;
  }

  advice.innerHTML = `<strong>Recomendacao</strong><p class="${tone}">${text}</p>`;
}

function updateProjectSummary(form, platform, theme, genre, price, suggested) {
  const suggestedPriceHint = document.getElementById("suggestedPriceHint");
  const projectSummary = document.getElementById("projectSummary");
  if (suggestedPriceHint) suggestedPriceHint.innerHTML = `Sugerido: <span class="success">$${suggested.toFixed(2)}</span>`;
  if (!projectSummary) return;

  const perSale = price * platform.revenueShare;
  projectSummary.innerHTML = `
    <strong>${form.gameName.value.trim() || "Sem Nome"}</strong><br>
    Preco: $${price.toFixed(2)}<br>
    Ganho estimado por venda: <span class="success">$${perSale.toFixed(2)}</span><br>
    ${genre} de ${theme}<br>
    ${platform.name} - Licenca ${formatMoney(platform.licenceCost)}
  `;
}

function renderProject(project) {
  const weeksLeft = Math.max(0, project.releaseWeek - gameState.week);
  const deadlineTone = weeksLeft <= 3 ? "danger" : weeksLeft <= 8 ? "warn" : "safe";
  return `
    <section class="project-hud">
      <div class="project-strip">
        <div class="project-strip-title">
          <strong>${project.name}</strong>
        </div>
        <div><span>Tema</span><strong>${project.theme}</strong></div>
        <div><span>Genero</span><strong>${project.genre}</strong></div>
        <div><span>Plataforma</span><strong>${platforms[project.platform].name}</strong></div>
      </div>

      <div class="deadline-display ${deadlineTone}" data-week="${gameState.week}">
        <span>Prazo</span>
        <strong>${weeksLeft}</strong>
        <em>${weeksLeft === 1 ? "semana restante" : "semanas restantes"}</em>
      </div>

      ${renderProgress(project)}

      ${renderProjectActionTabs(project)}
    </section>
  `;
}

function renderProgress(project) {
  const rows = [
    ["programming", project.progress.programming, project.targets.programming, false],
    ["graphics", project.progress.graphics, project.targets.graphics, false],
    ["design", project.progress.design, project.targets.design, false],
    ["sound", project.progress.sound, project.targets.sound, false],
    ["polish", project.progress.polish, project.targets.polish, true]
  ];
  return rows.map(([key, current, target, percent]) => {
    const ratio = current / target;
    const width = clamp(ratio * 100, 0, 140);
    const tone = ratio < 0.5 ? "danger" : ratio < 1 ? "warn" : "";
    const value = percent ? `${Math.round(current)}% / ${Math.round(target)}%` : `${Math.round(current)} / ${Math.round(target)}`;
    return `
      <div class="project-progress-row">
        <div class="project-progress-head">
          <strong>${areaLabel(key)}</strong>
          <span>${value}</span>
        </div>
        <div class="project-progress-bar"><div class="project-progress-fill ${tone}" style="width:${width}%"></div></div>
        <button class="project-focus-button consumes-week" onclick="applyDevelopmentFocus('${key}')">Focar</button>
      </div>
    `;
  }).join("");
}

function renderProjectActionTabs(project) {
  if (!["marketing", "game"].includes(activeProjectActionTab)) activeProjectActionTab = "marketing";

  const tabs = {
    marketing: `
      <button class="pixel-button secondary consumes-week" onclick="publishDevlog()">Publicar devlog</button>
      <button class="pixel-button secondary consumes-week" onclick="interactCommunity()">Interagir</button>
      <button class="pixel-button pink consumes-week" onclick="showInfluencerModal()">Influenciadores</button>
    `,
    game: `
      <button class="pixel-button green consumes-week" onclick="launchBeta()" ${project.betaReleased ? "disabled" : ""}>Beta aberto</button>
      <button class="pixel-button green" onclick="showEarlyLaunchModal()">Lancar adiantado</button>
      <button class="pixel-button danger" onclick="showDelayModal()">Adiar</button>
      <button class="pixel-button danger" onclick="showCancelProjectModal()">Cancelar jogo</button>
    `
  };

  return `
    <div class="project-actions">
      <div class="project-action-tabs">
        <button class="${activeProjectActionTab === "marketing" ? "active" : ""}" onclick="setProjectActionTab('marketing')">Marketing</button>
        <button class="${activeProjectActionTab === "game" ? "active" : ""}" onclick="setProjectActionTab('game')">Jogo</button>
      </div>
      <div class="project-action-panel">
        ${tabs[activeProjectActionTab] || tabs.marketing}
      </div>
    </div>
  `;
}

function renderDeveloper() {
  const d = gameState.developer;
  return `
    <section class="panel">
      <h2>${gameState.developerName}</h2>
      <p><span class="pill">Programacao ${d.programming}</span><span class="pill">Graficos ${d.graphics}</span></p>
      <p><span class="pill">Design ${d.design}</span><span class="pill">Som ${d.sound}</span><span class="pill">Polimento ${d.polish}</span></p>
      <div class="modal-actions">
        <button class="pixel-button secondary" onclick="saveGame()">Salvar</button>
        <button class="pixel-button" onclick="loadGame()">Carregar</button>
      </div>
    </section>
  `;
}

function renderReleasedGames() {
  return `
    <section class="panel">
      <h2>Catalogo lancado</h2>
      <div class="catalog-grid">
        ${gameState.releasedGames.length ? gameState.releasedGames.map((game) => {
          const last = game.salesHistory[game.salesHistory.length - 1] || { sales: 0, revenue: 0 };
          return `
            <div class="card">
              <h3>${game.name}</h3>
              <p><span class="score">${game.averageReview}</span> media</p>
              <p>${platforms[game.platform].name} - ${game.genre} - ${game.theme}</p>
              <p>Ultima semana: ${prettyNumber(last.sales)} copias, ${formatMoney(last.revenue)}</p>
              <p>Total: ${prettyNumber(game.totalSales)} copias, ${formatMoney(game.totalRevenue)}</p>
            </div>
          `;
        }).join("") : "<p class='subtle'>Seu catalogo ainda e uma promessa com logo bonito.</p>"}
      </div>
    </section>
  `;
}

function renderLastReviews() {
  return `
    <section class="panel">
      <h2>Reviews recentes</h2>
      <div class="review-grid">
        ${gameState.lastReviews.map((review) => `
          <div class="card review-card">
            <h3>${review.name}</h3>
            <div class="score">${review.score}</div>
            <p>Alcance: ${review.reach}</p>
            <p>"${review.quote}"</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderLogs() {
  return `
    <section class="panel">
      <h2>Log</h2>
      <div class="log-box">
        ${gameState.logMessages.map((message) => `<div class="log-item">${message}</div>`).join("")}
      </div>
    </section>
  `;
}

function showReviewModal(project) {
  showModal(
    `${project.name} saiu!`,
    `<p>Media final: <span class="score">${project.averageReview}</span></p>
    <div class="review-grid">
      ${project.reviews.map((review) => `
        <div class="card review-card">
          <h3>${review.name}</h3>
          <div class="score">${review.score}</div>
          <p>Alcance: ${review.reach}</p>
          <p>"${review.quote}"</p>
        </div>
      `).join("")}
    </div>`,
    [{ label: "Ver vendas", className: "green", action: closeModal }]
  );
}

function showRankingsModal() {
  showModal("Rankings", renderRankings(), [{ label: "Fechar", action: closeModal }]);
}

