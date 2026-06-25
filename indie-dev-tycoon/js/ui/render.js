// Arquivo: js/ui/render.js
// Responsabilidade: Renderizacao principal das telas, computador, estante e HUD.

// 10. Renderizacao
/** Redesenha a interface sem perder scroll ou estados temporarios. */
function render() {
  const previousComputerScroll = document.querySelector(".computer-screen")?.scrollTop || 0;
  const restoreComputerScroll = activeSceneWindow === "desk" && !shouldAnimateComputerOpen;
  renderHeader();
  renderSpeechBubble();
  const root = document.getElementById("app");
  root.classList.toggle("computer-ui", activeSceneWindow === "desk");
  root.innerHTML = renderSceneWindow();
  shouldAnimateComputerOpen = false;
  const form = document.querySelector(".project-builder");
  if (form) updateProjectFormHints(form);
  if (typeof syncTutorialUi === "function") syncTutorialUi();
  if (restoreComputerScroll) {
    const computerScreen = document.querySelector(".computer-screen");
    if (computerScreen) computerScreen.scrollTop = previousComputerScroll;
  }
  if (shouldScrollComputerToTop) {
    const computerScreen = document.querySelector(".computer-screen");
    if (computerScreen) computerScreen.scrollTop = 0;
    shouldScrollComputerToTop = false;
  }
  if (typeof syncMoneyPopupPosition === "function") syncMoneyPopupPosition();
}

/** Monta a HUD normal ou a HUD progressiva do tutorial. */
function renderHeader() {
  const topbar = document.getElementById("topbar");
  if (typeof isTutorialHeaderCondensed === "function" && isTutorialHeaderCondensed()) {
    const hasVisibleTutorialStat = isTutorialMoneyVisible() || isTutorialWeekVisible() || isTutorialReputationVisible() || isTutorialXpVisible();
    topbar.classList.add("is-condensed");
    topbar.classList.toggle("is-hidden", !hasVisibleTutorialStat);
    topbar.innerHTML = `
      <div class="stat"><strong>Estudio</strong><span>${gameState.studioName}</span></div>
      ${typeof isTutorialXpVisible === "function" && isTutorialXpVisible() ? renderCareerXpStat() : ""}
      ${typeof isTutorialMoneyVisible === "function" && isTutorialMoneyVisible()
        ? `<div id="moneyStat" class="stat money-stat"><strong>Dinheiro</strong><span>${formatMoney(gameState.money)}</span></div>`
        : ""}
      ${typeof isTutorialWeekVisible === "function" && isTutorialWeekVisible()
        ? `<div class="stat week-stat ${typeof isTutorialWeekHighlighted === "function" && isTutorialWeekHighlighted() ? "tutorial-hud-showcase" : ""}"><strong>Semana</strong><span>${gameState.week}</span></div>`
        : ""}
      ${typeof isTutorialReputationVisible === "function" && isTutorialReputationVisible()
        ? `<div class="stat reputation-stat ${typeof isTutorialReputationHighlighted === "function" && isTutorialReputationHighlighted() ? "tutorial-hud-showcase" : ""}"><strong>Reputacao</strong><span>${gameState.reputation}/100</span></div>`
        : ""}
    `;
    return;
  }

  topbar.classList.remove("is-condensed");
  topbar.classList.remove("is-hidden");
  topbar.innerHTML = `
    <div class="stat"><strong>Estudio</strong><span>${gameState.studioName}</span></div>
    ${renderCareerXpStat()}
    <div id="moneyStat" class="stat money-stat"><strong>Dinheiro</strong><span>${formatMoney(gameState.money)}</span></div>
    <div class="stat"><strong>Semana</strong><span>${gameState.week}</span></div>
    <div class="stat"><strong>Reputacao</strong><span>${gameState.reputation}/100</span></div>
  `;
}

/** Monta o indicador de experiencia e pontos de habilidade. */
function renderCareerXpStat() {
  const xp = Number(gameState.careerXp || 0);
  const points = Number(gameState.skillPoints || 0);
  const nextCost = typeof getNextSkillPointCost === "function" ? getNextSkillPointCost() : 10;
  const progress = clamp((xp / nextCost) * 100, 0, 100);
  return `
    <div class="stat career-xp-stat">
      <strong>Experiencia</strong>
      <span>${xp}/${nextCost} XP · ${points} pts</span>
      <div class="career-xp-bar"><i style="width:${progress}%"></i></div>
    </div>
  `;
}

/** Atualiza o balao principal de mensagens. */
function renderSpeechBubble() {
  const bubble = document.getElementById("speechBubble");
  if (!bubble) return;
  bubble.classList.toggle("is-compact", Boolean(activeSceneWindow));
  bubble.textContent = speechBubbleText || "Clique no computador, na estante ou na janela para abrir os paineis.";
}

/** Abre um painel interativo do escritorio. */
function openSceneWindow(windowName) {
  if (typeof handleTutorialSceneWindowAttempt === "function" && handleTutorialSceneWindowAttempt(windowName)) return;

  if (windowName === "desk" && activeSceneWindow !== "desk") {
    activeComputerApp = "desktop";
    shouldAnimateComputerOpen = true;
  }
  activeSceneWindow = windowName;
  render();
}

/** Fecha o painel atualmente aberto. */
function closeSceneWindow() {
  activeSceneWindow = null;
  render();
}

/** Monta o painel ativo sobre o escritorio. */
function renderSceneWindow() {
  if (!activeSceneWindow) return "";

  if (activeSceneWindow === "shelf") {
    return `
      <div class="scene-window shelf-window">
        <div class="window-title">Estante</div>
        <button class="window-close" onclick="closeSceneWindow()" aria-label="Fechar janela">X</button>
        ${renderShelf()}
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

/** Troca o aplicativo ativo dentro do computador. */
function setComputerApp(appName) {
  if (typeof handleTutorialComputerAppAttempt === "function" && handleTutorialComputerAppAttempt(appName)) return;

  activeComputerApp = appName;
  render();
}

/** Troca entre as abas de marketing e jogo. */
function setProjectActionTab(tabName) {
  if (typeof handleTutorialProjectTabAttempt === "function" && handleTutorialProjectTabAttempt(tabName)) return;

  activeProjectActionTab = tabName;
  render();
}

/** Monta a estrutura visual completa do computador. */
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

/** Monta o conteudo do aplicativo ativo. */
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

/** Monta as abas disponiveis no sistema operacional. */
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

/** Monta um botao de aplicativo com estado ativo ou bloqueado. */
function renderComputerAppButton(appName, label, enabled) {
  const active = appName === activeComputerApp || (appName === "create" && gameState.currentProject);
  return `
    <button class="computer-tab ${active ? "active" : ""} ${enabled ? "" : "is-locked"}" ${enabled ? `onclick="setComputerApp('${appName}')"` : `aria-disabled="true"`}>
      ${label}
    </button>
  `;
}

/** Monta a navegacao secundaria dos paineis. */
function renderWindowTabs() {
  return `
    <div class="window-tabs">
      <button class="pixel-button ${activeSceneWindow === "desk" ? "green" : "ghost"}" onclick="openSceneWindow('desk')">Computador</button>
      <button class="pixel-button ${activeSceneWindow === "shelf" ? "green" : "ghost"}" onclick="openSceneWindow('shelf')">Estante</button>
      <button class="pixel-button ${activeSceneWindow === "window" ? "green" : "ghost"}" onclick="openSceneWindow('window')">Janela</button>
    </div>
  `;
}

/** Monta a tela de criacao de um novo jogo. */
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

/** Monta o formulario completo de criacao de projeto. */
function renderCreateProject() {
  const tutorialMode = typeof tutorialActive !== "undefined" && tutorialActive;
  const defaultAmbition = tutorialMode ? 1 : 50;
  const defaultTheme = tutorialMode ? "" : themes[0];
  const defaultGenre = tutorialMode ? "" : Object.keys(genres)[0];
  const defaultPlatform = tutorialMode ? null : platforms.steam;
  const defaultWeeks = tutorialMode ? "" : 24;
  return `
    <form class="project-builder" onsubmit="startProject(event)" onchange="updateProjectFormHints(this)" oninput="updateProjectFormHints(this)">
      <input type="hidden" name="theme" value="${defaultTheme}">
      <input type="hidden" name="genre" value="${defaultGenre}">
      <input type="hidden" name="platform" value="${defaultPlatform?.id || ""}">

      <label class="project-name-field">Nome do jogo
        <input name="gameName" maxlength="34" value="" autocomplete="off">
      </label>

      <div class="project-choice-row">
        ${renderChoiceField("theme", "Tema", defaultTheme)}
        ${renderChoiceField("genre", "Genero", defaultGenre)}
      </div>

      <div class="platform-choice" role="button" tabindex="0" onclick="showPlatformPicker(this.closest('form'))" onkeydown="if(event.key === 'Enter') showPlatformPicker(this.closest('form'))">
        <div id="platformArt" class="choice-art platform-art">${renderChoiceArtContent("platform", defaultPlatform?.name || "")}</div>
        <div>
          <strong>Plataforma</strong>
          <span id="platformChoiceName">${defaultPlatform?.name || "Escolha uma plataforma"}</span>
          <small id="platformChoiceSummary">${defaultPlatform ? `${defaultPlatform.type} - mercado base ${prettyNumber(defaultPlatform.marketBase)} - ${Math.round(defaultPlatform.revenueShare * 100)}% por venda` : "Nenhuma plataforma selecionada"}</small>
        </div>
      </div>

      <div class="scope-row">
        <label>Ambicao: <span id="ambitionHint">${defaultAmbition}</span>
          <input type="range" name="ambition" min="1" max="100" value="${defaultAmbition}">
        </label>
        <label>Prazo em semanas
          <input type="number" name="weeks" min="4" max="80" value="${defaultWeeks}">
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

/** Monta um campo visual de tema ou genero. */
function renderChoiceField(type, label, value) {
  return `
    <button type="button" class="project-choice" onclick="showChoicePicker('${type}', this.closest('form'))">
      <span id="${type}ChoiceArt" class="choice-art">${renderChoiceArtContent(type, value)}</span>
      <span>
        <strong>${label}</strong>
        <small id="${type}ChoiceName">${value || `Escolha ${label.toLowerCase()}`}</small>
      </span>
    </button>
  `;
}

/** Monta a imagem ou placeholder de uma escolha. */
function renderChoiceArtContent(type, value) {
  if (!value) return "<span>?</span>";
  return `<span>${value[0]}</span><img src="${getChoiceImagePath(type, value)}" alt="" onerror="this.remove()">`;
}

/** Resolve o caminho de imagem para uma escolha. */
function getChoiceImagePath(type, value) {
  const slug = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `assets/images/${type}s/${slug}.png`;
}

/** Monta a miniatura reutilizavel de uma escolha. */
function renderChoiceArt(type, value, extraClass = "") {
  return `
    <span class="choice-art ${extraClass}">
      <span>${value[0]}</span>
      <img src="${getChoiceImagePath(type, value)}" alt="" onerror="this.remove()">
    </span>
  `;
}

/** Abre o seletor de tema ou genero. */
function showChoicePicker(type, form) {
  if (typeof handleTutorialChoicePickerAttempt === "function" && handleTutorialChoicePickerAttempt(type)) return;

  const picker = form.querySelector("#floatingPicker");
  const options = type === "theme" ? themes : Object.keys(genres);
  const title = type === "theme" ? "Escolha o tema" : "Escolha o genero";
  picker.hidden = false;
  picker.dataset.choiceType = type;
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
  if (typeof syncTutorialUi === "function") syncTutorialUi();
}

/** Abre o seletor de plataforma. */
function showPlatformPicker(form) {
  if (typeof handleTutorialChoicePickerAttempt === "function" && handleTutorialChoicePickerAttempt("platform")) return;

  const picker = form.querySelector("#floatingPicker");
  picker.hidden = false;
  picker.dataset.choiceType = "platform";
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
  if (typeof syncTutorialUi === "function") syncTutorialUi();
}

/** Aplica uma escolha ao formulario do projeto. */
function selectCreateOption(type, value, form) {
  form.elements[type].value = value;
  closeCreatePicker(form);
  updateProjectFormHints(form);
  if (typeof handleTutorialCreateOptionSelected === "function") handleTutorialCreateOptionSelected(type);
}

/** Fecha o seletor flutuante da criacao. */
function closeCreatePicker(form) {
  const picker = form.querySelector("#floatingPicker");
  if (picker) {
    picker.hidden = true;
    delete picker.dataset.choiceType;
  }
}

/** Atualiza sugestoes, previews e resumo do formulario. */
function updateProjectFormHints(form) {
  if (!form?.ambition || !form?.platform || !form?.theme || !form?.genre || !form?.weeks || !form?.price) return;

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

/** Atualiza nome e arte da escolha selecionada. */
function updateChoicePreview(type, value) {
  const name = document.getElementById(`${type}ChoiceName`);
  const art = document.getElementById(`${type}ChoiceArt`);
  if (name) name.textContent = value || `Escolha ${type === "theme" ? "o tema" : "o genero"}`;
  if (art) art.innerHTML = renderChoiceArtContent(type, value);
}

/** Atualiza os dados visuais da plataforma selecionada. */
function updatePlatformPreview(platform) {
  const name = document.getElementById("platformChoiceName");
  const summary = document.getElementById("platformChoiceSummary");
  const art = document.getElementById("platformArt");
  if (name) name.textContent = platform?.name || "Escolha uma plataforma";
  if (summary) summary.textContent = platform ? `${platform.type} - mercado base ${prettyNumber(platform.marketBase)} - ${Math.round(platform.revenueShare * 100)}% por venda` : "Nenhuma plataforma selecionada";
  if (art) art.innerHTML = renderChoiceArtContent("platform", platform?.name || "");
}

/** Atualiza a recomendacao de prazo para a ambicao. */
function updateScopeAdvice(ambition, weeks) {
  const advice = document.getElementById("scopeAdvice");
  if (!advice) return;
  if (!weeks) {
    advice.innerHTML = "<strong>Recomendacao</strong><p class='subtle'>Defina o prazo para comparar tempo e ambicao.</p>";
    return;
  }

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

/** Atualiza o resumo comercial do formulario. */
function updateProjectSummary(form, platform, theme, genre, price, suggested) {
  const suggestedPriceHint = document.getElementById("suggestedPriceHint");
  const projectSummary = document.getElementById("projectSummary");
  if (suggestedPriceHint) suggestedPriceHint.innerHTML = `Sugerido: <span class="success">$${suggested.toFixed(2)}</span>`;
  if (!projectSummary) return;

  if (!platform || !theme || !genre || !form.gameName.value.trim()) {
    projectSummary.innerHTML = "<span class='subtle'>Complete as escolhas para ver o resumo.</span>";
    return;
  }

  const perSale = price * platform.revenueShare;
  projectSummary.innerHTML = `
    <strong>${form.gameName.value.trim() || "Sem Nome"}</strong><br>
    Preco: $${price.toFixed(2)}<br>
    Ganho estimado por venda: <span class="success">$${perSale.toFixed(2)}</span><br>
    ${genre} de ${theme}<br>
    ${platform.name} - Licenca ${formatMoney(platform.licenceCost)}
  `;
}

/** Monta a tela principal do projeto em desenvolvimento. */
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
        <div><span>Hype</span><strong>${Math.round(project.hype || 0)}/100</strong></div>
        <div><span>Reputacao</span><strong>${Math.round(gameState.reputation || 0)}/100</strong></div>
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

/** Monta barras, alvos e botoes de foco do projeto. */
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
        <button class="project-focus-button consumes-week" data-focus-area="${key}" onclick="applyDevelopmentFocus('${key}')">Focar</button>
      </div>
    `;
  }).join("");
}

/** Monta as acoes disponiveis nas abas do projeto. */
function renderProjectActionTabs(project) {
  if (!["marketing", "game"].includes(activeProjectActionTab)) activeProjectActionTab = "marketing";

  const tabs = {
    marketing: `
      <button class="pixel-button secondary consumes-week" data-project-action="devlog" onclick="publishDevlog()">Publicar devlog</button>
      <button class="pixel-button secondary consumes-week" data-project-action="interact" onclick="interactCommunity()">Interagir</button>
      <button class="pixel-button pink consumes-week" data-project-action="influencers" onclick="showInfluencerModal()">Influenciadores</button>
    `,
    game: `
      <button class="pixel-button green consumes-week" data-project-action="beta" onclick="launchBeta()" ${project.betaReleased ? "disabled" : ""}>Beta aberto</button>
      <button class="pixel-button green" data-project-action="early-launch" onclick="showEarlyLaunchModal()">Lancar adiantado</button>
      <button class="pixel-button danger" data-project-action="delay" onclick="showDelayModal()">Adiar</button>
      <button class="pixel-button danger" data-project-action="cancel" onclick="showCancelProjectModal()">Cancelar jogo</button>
    `
  };

  return `
    <div class="project-actions">
      <div class="project-action-tabs">
        <button class="${activeProjectActionTab === "marketing" ? "active" : ""}" data-project-tab="marketing" onclick="setProjectActionTab('marketing')">Marketing</button>
        <button class="${activeProjectActionTab === "game" ? "active" : ""}" data-project-tab="game" onclick="setProjectActionTab('game')">Jogo</button>
      </div>
      <div class="project-action-panel">
        ${tabs[activeProjectActionTab] || tabs.marketing}
      </div>
    </div>
  `;
}

/** Monta todas as divisorias da estante. */
function renderShelf() {
  return `
    <section class="shelf-case" aria-label="Estante do estudio">
      <div class="shelf-board shelf-board-games">
        ${renderShelfGames()}
      </div>
      <div class="shelf-board shelf-board-empty" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div class="shelf-board shelf-board-developer">
        ${renderDeveloper()}
      </div>
      <div class="shelf-board shelf-board-empty" aria-hidden="true">
        <span></span><span></span>
      </div>
      <div class="shelf-board shelf-board-coming-soon">
        ${renderShelfComingSoon()}
      </div>
    </section>
  `;
}

/** Reune jogos lancados e o projeto atual para a estante. */
function getShelfGames() {
  return [
    ...gameState.releasedGames,
    ...(gameState.currentProject ? [gameState.currentProject] : [])
  ];
}

/** Monta o carrossel ou os detalhes do jogo selecionado. */
function renderShelfGames() {
  const games = getShelfGames();
  if (selectedShelfGameIndex !== null) {
    const selectedGame = games[selectedShelfGameIndex];
    if (selectedGame) return renderShelfGameDetails(selectedGame);
    selectedShelfGameIndex = null;
  }

  const visibleCount = 5;
  const maxOffset = Math.max(0, games.length - visibleCount);
  shelfGameOffset = clamp(shelfGameOffset, 0, maxOffset);
  const visibleGames = games.slice(shelfGameOffset, shelfGameOffset + visibleCount);
  const needsCarousel = games.length > visibleCount;

  return `
    <div class="shelf-head">
      <h2>Jogos</h2>
      <span>${games.length ? `${games.length} ${games.length === 1 ? "projeto" : "projetos"}` : "vazio"}</span>
    </div>
    <div class="shelf-game-row">
      ${needsCarousel ? `<button class="shelf-arrow" onclick="moveShelfGames(-1)" aria-label="Jogos anteriores">&lt;</button>` : ""}
      <div class="shelf-game-carousel">
        ${visibleGames.length ? visibleGames.map((game, index) => renderShelfGameTile(game, index, shelfGameOffset + index)).join("") : renderEmptyShelfGameTiles(visibleCount)}
      </div>
      ${needsCarousel ? `<button class="shelf-arrow" onclick="moveShelfGames(1)" aria-label="Proximos jogos">&gt;</button>` : ""}
    </div>
  `;
}

/** Monta espacos vazios decorativos da prateleira. */
function renderEmptyShelfGameTiles(count) {
  return Array.from({ length: count }, (_, index) => `
    <div class="shelf-game-tile is-empty" style="--tile-delay:${index}">
      <strong>Espaco livre</strong>
    </div>
  `).join("");
}

/** Monta uma capa clicavel no carrossel. */
function renderShelfGameTile(game, index, gameIndex) {
  const coverPath = getShelfGameCoverPath(game);
  const status = game.status === "released" ? `Nota ${game.averageReview || "-"}` : "Em producao";
  return `
    <button type="button" class="shelf-game-tile" style="--tile-delay:${index}" onclick="openShelfGameDetails(${gameIndex})" aria-label="Abrir detalhes de ${escapeAttribute(game.name)}">
      <img src="${coverPath}" alt="" onerror="this.remove()">
      <div class="shelf-game-overlay"></div>
      <strong>${game.name}</strong>
      <small>${status}</small>
    </button>
  `;
}

/** Abre a ficha detalhada de um jogo. */
function openShelfGameDetails(gameIndex) {
  selectedShelfGameIndex = gameIndex;
  render();
}

/** Fecha a ficha detalhada e retorna ao carrossel. */
function closeShelfGameDetails() {
  selectedShelfGameIndex = null;
  render();
}

/** Monta reviews, vendas e promocao do jogo selecionado. */
function renderShelfGameDetails(game) {
  const gameIndex = getShelfGames().indexOf(game);
  const coverPath = getShelfGameCoverPath(game);
  const reviews = Array.isArray(game.reviews) ? game.reviews : [];
  const lastWeek = game.salesHistory?.[game.salesHistory.length - 1] || { sales: 0, revenue: 0 };
  const isReleased = game.status === "released";
  const reviewSummary = reviews.length
    ? reviews.map((review) => `<span title="${escapeAttribute(review.name)}">${Math.round(review.score)}</span>`).join("")
    : `<em>${isReleased ? "Sem reviews" : "Aguardando lancamento"}</em>`;

  return `
    <div class="shelf-game-details">
      <button type="button" class="shelf-game-details-close" onclick="closeShelfGameDetails()" aria-label="Fechar detalhes">X</button>
      <div class="shelf-game-details-cover">
        <img src="${coverPath}" alt="Capa de ${escapeAttribute(game.name)}" onerror="this.remove()">
        <span>${game.name}</span>
      </div>
      <div class="shelf-game-details-info">
        <div class="shelf-game-details-title">
          <div>
            <small>${isReleased ? "Jogo lancado" : "Projeto em desenvolvimento"}</small>
            <h2>${game.name}</h2>
          </div>
          ${isReleased ? `<strong>${Math.round(game.averageReview || 0)}/10</strong>` : ""}
        </div>
        <div class="shelf-game-review-scores">
          <label>Reviews</label>
          <div>${reviewSummary}</div>
        </div>
        <div class="shelf-game-sales-grid">
          <div>
            <span>Vendas totais</span>
            <strong>${prettyNumber(game.totalSales || 0)} copias</strong>
            <small>${formatMoney(game.totalRevenue || 0)}</small>
            ${game.totalRefunds ? `<em>${prettyNumber(game.totalRefunds)} reembolsos - ${formatMoney(game.totalRefundValue || 0)}</em>` : ""}
          </div>
          <div>
            <span>Ultima semana</span>
            <strong>${prettyNumber(lastWeek.sales || 0)} copias</strong>
            <small>${formatMoney(lastWeek.revenue || 0)}</small>
            ${lastWeek.refunds ? `<em>${prettyNumber(lastWeek.refunds)} reembolsos - ${formatMoney(lastWeek.refundValue || 0)}</em>` : ""}
          </div>
        </div>
        ${isReleased ? renderShelfGameDiscount(game, gameIndex) : ""}
      </div>
    </div>
  `;
}

/** Monta os controles ou o estado da promocao ativa. */
function renderShelfGameDiscount(game, gameIndex) {
  const discountActive = game.discount > 0 && game.discountWeeksRemaining > 0;
  if (discountActive) {
    return `
      <div class="shelf-game-discount is-active">
        <span>Promocao ativa</span>
        <strong>${Math.round(game.discount * 100)}% OFF</strong>
        <small>${game.discountWeeksRemaining} ${game.discountWeeksRemaining === 1 ? "semana restante" : "semanas restantes"}</small>
      </div>
    `;
  }

  return `
    <div class="shelf-game-discount">
      <span>Aplicar desconto</span>
      <div class="shelf-game-discount-controls">
        <label>
          <span>Duracao</span>
          <select id="shelfDiscountDuration">
            ${Array.from({ length: 10 }, (_, index) => {
              const weeks = index + 1;
              return `<option value="${weeks}" ${weeks === 3 ? "selected" : ""}>${weeks} ${weeks === 1 ? "semana" : "semanas"}</option>`;
            }).join("")}
          </select>
        </label>
        <div>
          <button type="button" onclick="applySelectedGameDiscount(${gameIndex}, 0.10)">10%</button>
          <button type="button" onclick="applySelectedGameDiscount(${gameIndex}, 0.25)">25%</button>
          <button type="button" onclick="applySelectedGameDiscount(${gameIndex}, 0.50)">50%</button>
        </div>
      </div>
    </div>
  `;
}

/** Resolve a capa conforme tema, genero e plataforma. */
function getShelfGameCoverPath(game) {
  const parts = [game.theme, game.genre, platforms[game.platform]?.name]
    .filter(Boolean)
    .join("-");
  const slug = parts.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `assets/images/covers/${slug}.png`;
}

/** Move o carrossel uma posicao. */
function moveShelfGames(direction) {
  const visibleCount = 5;
  const maxOffset = Math.max(0, getShelfGames().length - visibleCount);
  shelfGameOffset = clamp(shelfGameOffset + direction, 0, maxOffset);
  render();
}

/** Retorna a lista canonica de atributos do desenvolvedor. */
function getDeveloperAttrs() {
  return ["programming", "graphics", "design", "sound", "polish"];
}

/** Conta pontos distribuidos desde o ultimo checkpoint. */
function getPendingSkillChanges() {
  const saved = gameState.savedDeveloper || gameState.developer;
  return getDeveloperAttrs().reduce((total, key) => total + Math.max(0, gameState.developer[key] - saved[key]), 0);
}

/** Consome um ponto para aumentar um atributo. */
function increaseDeveloperAttribute(area) {
  if (
    gameState.skillPoints <= 0 ||
    typeof gameState.developer[area] !== "number" ||
    gameState.developer[area] >= DEVELOPER_ATTRIBUTE_MAX
  ) return;

  gameState.developer[area] = Math.min(DEVELOPER_ATTRIBUTE_MAX, gameState.developer[area] + 1);
  gameState.skillPoints -= 1;
  render();
}

/** Devolve um ponto ainda nao confirmado. */
function decreaseDeveloperAttribute(area) {
  const saved = gameState.savedDeveloper || gameState.developer;
  if (typeof gameState.developer[area] !== "number" || gameState.developer[area] <= saved[area]) return;

  gameState.developer[area] -= 1;
  gameState.skillPoints += 1;
  render();
}

/** Confirma a distribuicao atual como novo checkpoint. */
function saveDeveloperAttributeChanges() {
  if (typeof handleTutorialSkillSaveAttempt === "function" && handleTutorialSkillSaveAttempt()) return;

  gameState.savedDeveloper = { ...gameState.developer };
  addLog("Alteracoes de habilidade salvas. Este virou o novo ponto de retorno.");
  render();
}

/** Escolhe a cor da barra conforme o nivel do atributo. */
function getDeveloperAttributeTone(value) {
  if (value >= 100) return "master";
  if (value >= 80) return "elite";
  if (value >= 60) return "expert";
  if (value >= 40) return "skilled";
  if (value >= 20) return "growing";
  return "starter";
}

/** Monta o cartao e as barras do desenvolvedor. */
function renderDeveloper() {
  const d = gameState.developer;
  const attrs = getDeveloperAttrs();
  const points = Number(gameState.skillPoints || 0);
  const pending = getPendingSkillChanges();
  return `
    <div class="shelf-dev-card">
      <div class="shelf-dev-id">
        <span class="shelf-dev-portrait"></span>
        <div>
          <h2>${gameState.developerName}</h2>
          <p>${gameState.studioName}</p>
        </div>
      </div>
      <div class="shelf-dev-training">
        <strong class="shelf-dev-points">Vc tem ${points} ponto${points === 1 ? "" : "s"} disponive${points === 1 ? "l" : "is"}</strong>
        <div class="shelf-dev-bars">
          ${attrs.map((key) => `
            <div class="shelf-dev-stat">
              <span>${areaLabel(key)}</span>
              <div class="shelf-dev-bar">
                <div class="${getDeveloperAttributeTone(d[key])}" style="width:${clamp((d[key] / DEVELOPER_ATTRIBUTE_MAX) * 100, d[key] > 0 ? 2 : 0, 100)}%"></div>
              </div>
              <strong>${d[key]}/${DEVELOPER_ATTRIBUTE_MAX}</strong>
              ${points > 0 || d[key] > (gameState.savedDeveloper || d)[key] ? `
                <div class="shelf-skill-controls">
                  <button type="button" title="Diminuir ${areaLabel(key)}" aria-label="Diminuir ${areaLabel(key)}" onclick="decreaseDeveloperAttribute('${key}')" ${d[key] <= (gameState.savedDeveloper || d)[key] ? "disabled" : ""}>-</button>
                  <button type="button" title="Aumentar ${areaLabel(key)}" aria-label="Aumentar ${areaLabel(key)}" onclick="increaseDeveloperAttribute('${key}')" ${points <= 0 || d[key] >= DEVELOPER_ATTRIBUTE_MAX ? "disabled" : ""}>+</button>
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      </div>
      ${points === 0 && pending > 0 ? `
        <div class="shelf-dev-confirm">
          <span>Salvar alteracoes?</span>
          <button class="pixel-button green" onclick="saveDeveloperAttributeChanges()">Salvar alteracoes</button>
        </div>
      ` : ""}
    </div>
  `;
}

/** Monta a area decorativa reservada para recursos futuros. */
function renderShelfComingSoon() {
  return `
    <div class="shelf-coming-soon">
      <div class="shelf-card-silhouettes" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <strong>Em breve</strong>
      <small>Novas cartas e colecoes</small>
    </div>
  `;
}

/** Monta as reviews recentes no painel da janela. */
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

/** Monta o historico recente de acontecimentos. */
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


