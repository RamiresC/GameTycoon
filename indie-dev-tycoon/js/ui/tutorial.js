// Arquivo: js/ui/tutorial.js
// Responsabilidade: Roteiro, bloqueios, destaques e eventos exclusivos do tutorial.

const tutorialScript = [
  {
    id: "free-time",
    text: "Em seu pouco tempo livre durante a semana, voce resolveu tentar realizar um antigo sonho.",
    target: "text"
  },
  {
    id: "tools",
    text: "Apos muitos tutoriais, testes e gastos com ferramentas que voce talvez nem use, iniciou seu projeto.",
    target: "text"
  },
  {
    id: "communities",
    text: "E, nas muitas comunidades onde aprendeu o necessario para fazer um jogo simples, divulgou a ideia e uma previsao de lancamento.",
    target: "text"
  },
  {
    id: "computer",
    text: "Primeiro, abra o computador. E ali que seu projeto vai comecar a ganhar forma.",
    target: "computer"
  },
  {
    id: "create-app",
    text: "Clique em Criar um jogo. O resto do mundo ainda nao sabe, mas este e o primeiro passo.",
    target: "create-app"
  },
  {
    id: "game-name",
    text: "Comece dando um nome ao jogo. Pode ser simples; o importante e transformar a ideia em algo concreto.",
    target: "game-name"
  },
  {
    id: "theme",
    text: "Escolha um tema. Ele da a fantasia inicial do jogo, aquilo que as pessoas entendem em poucos segundos.",
    target: "theme"
  },
  {
    id: "theme-option",
    text: "Agora escolha qualquer tema. Por enquanto, o importante e entender o fluxo.",
    target: "theme-option"
  },
  {
    id: "genre",
    text: "Escolha o genero. Ele muda o tipo de esforco que o desenvolvimento vai exigir.",
    target: "genre"
  },
  {
    id: "genre-option",
    text: "Escolha qualquer genero para continuar.",
    target: "genre-option"
  },
  {
    id: "platform",
    text: "Agora escolha a plataforma. Cada uma tem publico, custo e retorno diferentes.",
    target: "platform"
  },
  {
    id: "platform-option",
    text: "Escolha onde pretende lancar esse primeiro jogo.",
    target: "platform-option"
  },
  {
    id: "ambition",
    text: "A ambicao define o tamanho do jogo. Para este primeiro teste, coloque a ambicao em 5.",
    target: "ambition"
  },
  {
    id: "weeks",
    text: "Agora defina o prazo em 10 semanas. E tempo suficiente para aprender o fluxo sem transformar isso em uma saga.",
    target: "weeks"
  },
  {
    id: "price",
    text: "Use o preco sugerido. Para um projeto pequeno, seguir a sugestao evita assustar quem ainda nem conhece seu estudio.",
    target: "price"
  },
  {
    id: "summary",
    text: "Repare no resumo: ele junta tema, genero, plataforma, licenca e ganho estimado. Clique para continuar.",
    target: "summary"
  },
  {
    id: "submit",
    text: "Hora de postar a ideia e assumir o prazo. Clique para criar o jogo.",
    target: "submit"
  },
  {
    id: "focus-programming",
    text: "Agora vem a producao. Clique em Focar em Programacao para ter melhores resultados nessa parte do jogo.",
    target: "focus-programming"
  },
  {
    id: "focus-graphics",
    text: "Com a base funcionando, foque em Graficos. Cada foco do tutorial vai preencher uma area essencial.",
    target: "focus-graphics"
  },
  {
    id: "focus-design",
    text: "Agora foque em Game Design. E aqui que o jogo comeca a parecer divertido, nao apenas existente.",
    target: "focus-design"
  },
  {
    id: "focus-sound",
    text: "Foque em Som. Mesmo jogos simples ficam mais vivos quando audio e ritmo entram na mistura.",
    target: "focus-sound"
  },
  {
    id: "focus-polish",
    text: "Por fim, foque em Polimento. Ele segura a experiencia quando tudo parece quase pronto.",
    target: "focus-polish"
  },
  {
    id: "marketing-tab",
    text: "O desenvolvimento nao vive sozinho. Abra a aba Marketing para ver como conversar com o publico.",
    target: "marketing-tab"
  },
  {
    id: "marketing-interact",
    text: "Marketing pode envolver devlogs, influenciadores e outras apostas. Agora, interaja com a comunidade para criar confianca.",
    target: "marketing-interact"
  },
  {
    id: "game-tab",
    text: "Volte para a aba Jogo. Aqui ficam decisoes ligadas ao produto em si: beta, adiamento, cancelamento e lancamento.",
    target: "game-tab"
  },
  {
    id: "beta",
    text: "Lance um beta aberto. Ele expoe problemas, mas tambem ajuda o publico a sentir que o projeto esta vivo.",
    target: "beta"
  },
  {
    id: "bug-event",
    text: "Durante os testes, um problema escondido apareceu. Escolha como lidar com ele.",
    target: "bug-event"
  },
  {
    id: "free-week",
    text: "Use as semanas restantes como quiser. Ainda estamos no tutorial, mas agora o jogo segue normalmente ate a proxima parte.",
    target: "free-week"
  }
];

let tutorialActive = false;
let tutorialStepIndex = 0;
let tutorialBugEventShownForStep = -1;
let tutorialStatsCondensed = false;
let tutorialMoneyVisible = false;
let tutorialWeekVisible = false;
let tutorialReputationVisible = false;
let tutorialXpVisible = false;
let tutorialWeekHighlighted = false;
let tutorialReputationHighlighted = false;
const tutorialCompletedCreateFields = new Set();
let tutorialCenteredMessage = "";
let tutorialCenteredQueue = [];
let tutorialCenteredDone = null;
let tutorialMessageDisplay = "";
let tutorialMessageTyping = false;
let tutorialMessageSpeed = 1;
let tutorialMessageCentered = true;
let tutorialTypeTimer = null;
let tutorialAutoAdvanceTimer = null;
let tutorialCustomTarget = "";
let tutorialSalesProject = null;
let tutorialSalesPhase = 0;

/** Reinicia o estado roteirizado e inicia o tutorial. */
function startTutorial() {
  tutorialActive = true;
  tutorialStepIndex = 0;
  tutorialStatsCondensed = true;
  tutorialMoneyVisible = false;
  tutorialWeekVisible = false;
  tutorialReputationVisible = false;
  tutorialXpVisible = false;
  tutorialWeekHighlighted = false;
  tutorialReputationHighlighted = false;
  tutorialCompletedCreateFields.clear();
  gameState.money = 0;
  gameState.reputation = 0;
  gameState.careerXp = 0;
  gameState.skillPoints = 0;
  gameState.skillPointsEarned = 0;
  gameState.developer = { programming: 0, graphics: 0, design: 0, sound: 0, polish: 0 };
  gameState.savedDeveloper = { ...gameState.developer };
  document.body.classList.add("tutorial-active");
  activeSceneWindow = null;
  render();
}

/** Retorna a etapa atual do roteiro. */
function getTutorialStep() {
  return tutorialScript[tutorialStepIndex];
}

/** Define tutorial texto. */
function setTutorialText() {
  const step = getTutorialStep();
  if (!step) return;
  speechBubbleText = getTutorialStepText(step);
  renderSpeechBubble();
}

/** Resolve o texto que deve aparecer na etapa atual. */
function getTutorialStepText(step) {
  if (tutorialCenteredMessage) return tutorialMessageDisplay || " ";
  if (tutorialCustomTarget === "bed") return "Durma na cama para passar 1 semana.";
  if (tutorialCustomTarget === "bed-final") return "Vamos passar mais 1 semana. Durma na cama para continuar.";
  if (tutorialSalesProject) return speechBubbleText || "";
  if (step.target !== "free-week") return step.text;

  const project = gameState.currentProject;
  if (!project) return "O jogo foi lancado. A proxima parte do tutorial ainda sera definida.";

  const weeksLeft = Math.max(0, project.releaseWeek - gameState.week);
  if (weeksLeft === 1) {
    return "Resta 1 semana livre. Escolha qualquer acao; ainda estamos no tutorial, mas agora o jogo segue normalmente.";
  }

  return `Restam ${weeksLeft} semanas livres. Escolha qualquer acao; ainda estamos no tutorial, mas agora o jogo segue normalmente.`;
}

/** Avanca o roteiro para a proxima etapa. */
function advanceTutorial() {
  tutorialStepIndex += 1;
  const step = getTutorialStep();

  if (!step) {
    finishTutorial();
    return;
  }

  setTutorialText();
  syncTutorialUi();
}

/** Finaliza tutorial. */
function finishTutorial() {
  tutorialActive = false;
  document.body.classList.remove("tutorial-active");
  document.body.classList.remove("tutorial-dialog-centered");
  clearTutorialHighlights();
  renderSpeechBubble();
}

/** Informa se a HUD deve usar o modo reduzido do tutorial. */
function isTutorialHeaderCondensed() {
  return tutorialStatsCondensed;
}

/** Informa se dinheiro ja foi apresentado no tutorial. */
function isTutorialMoneyVisible() {
  return tutorialMoneyVisible;
}

/** Informa se semana ja foi apresentada no tutorial. */
function isTutorialWeekVisible() {
  return tutorialWeekVisible;
}

/** Informa se reputacao ja foi apresentada no tutorial. */
function isTutorialReputationVisible() {
  return tutorialReputationVisible;
}

/** Informa se experiencia ja foi apresentada no tutorial. */
function isTutorialXpVisible() {
  return tutorialXpVisible;
}

/** Informa se semana deve receber destaque temporario. */
function isTutorialWeekHighlighted() {
  return tutorialWeekHighlighted;
}

/** Informa se reputacao deve receber destaque temporario. */
function isTutorialReputationHighlighted() {
  return tutorialReputationHighlighted;
}

/** Exibe tutorial dinheiro. */
function showTutorialMoney() {
  tutorialMoneyVisible = true;
  renderHeader();
}

/** Exibe tutorial semana. */
function showTutorialWeek() {
  tutorialWeekVisible = true;
  tutorialWeekHighlighted = true;
  renderHeader();
}

/** Exibe tutorial reputacao. */
function showTutorialReputation(value) {
  gameState.reputation = value;
  tutorialReputationVisible = true;
  tutorialReputationHighlighted = true;
  renderHeader();
}

/** Limpa tutorial highlights. */
function clearTutorialHighlights() {
  document.querySelectorAll(".tutorial-target").forEach((element) => {
    element.classList.remove("tutorial-target");
  });
  document.body.className = document.body.className
    .split(" ")
    .filter((className) => !className.startsWith("tutorial-target-"))
    .join(" ");
}

/** Sincroniza texto, bloqueios e destaques da etapa atual. */
function syncTutorialUi() {
  if (!tutorialActive) return;

  clearTutorialHighlights();
  const step = getTutorialStep();
  const targetName = tutorialCustomTarget || step?.target;
  if (targetName) document.body.classList.add(`tutorial-target-${targetName}`);
  updateTutorialExpectedValues();
  setTutorialText();

  if (!tutorialCenteredMessage || !tutorialMessageCentered) {
    getTutorialTargets().forEach((element) => {
      element.classList.add("tutorial-target");
    });
  }

  if (step?.target === "bug-event") {
    showTutorialBugEvent();
  }
}

/** Exibe tutorial centered mensagens. */
function showTutorialCenteredMessages(messages, onDone) {
  showTutorialMessages(messages, onDone, true);
}

/** Exibe tutorial mensagens. */
function showTutorialMessages(messages, onDone, centered = true) {
  clearTutorialMessageTimers();
  tutorialCenteredQueue = messages.slice();
  tutorialCenteredDone = onDone;
  tutorialMessageCentered = centered;
  document.body.classList.toggle("tutorial-dialog-centered", centered);
  showNextTutorialCenteredMessage();
}

/** Exibe proximo tutorial centered mensagem. */
function showNextTutorialCenteredMessage() {
  clearTutorialMessageTimers();
  tutorialCenteredMessage = tutorialCenteredQueue.shift() || "";
  tutorialMessageDisplay = "";
  tutorialMessageSpeed = 1;
  if (tutorialCenteredMessage) {
    typeTutorialCenteredMessage();
    return;
  }

  document.body.classList.remove("tutorial-dialog-centered");
  tutorialMessageCentered = true;
  const done = tutorialCenteredDone;
  tutorialCenteredDone = null;
  if (typeof done === "function") done();
}

/** Verifica se existe mensagem central em andamento. */
function hasTutorialCenteredMessage() {
  return Boolean(tutorialCenteredMessage);
}

/** Digita tutorial centered mensagem. */
function typeTutorialCenteredMessage() {
  tutorialMessageTyping = true;
  let index = 0;
  const fullText = tutorialCenteredMessage;
  const baseDelay = clamp(Math.floor(2400 / Math.max(1, fullText.length)), 12, 38);

  /** Executa o proximo quadro da digitacao ou animacao atual. */
  function step() {
    tutorialMessageDisplay = fullText.slice(0, index);
    speechBubbleText = tutorialMessageDisplay || " ";
    renderSpeechBubble();

    if (index >= fullText.length) {
      tutorialMessageTyping = false;
      tutorialAutoAdvanceTimer = window.setTimeout(showNextTutorialCenteredMessage, 10000);
      return;
    }

    index += 1;
    tutorialTypeTimer = window.setTimeout(step, baseDelay / tutorialMessageSpeed);
  }

  step();
}

/** Limpa tutorial mensagem temporizadores. */
function clearTutorialMessageTimers() {
  window.clearTimeout(tutorialTypeTimer);
  window.clearTimeout(tutorialAutoAdvanceTimer);
  tutorialTypeTimer = null;
  tutorialAutoAdvanceTimer = null;
}

/** Trata tutorial mensagem click. */
function handleTutorialMessageClick() {
  if (tutorialMessageTyping) {
    tutorialMessageSpeed = 5;
    return;
  }

  showNextTutorialCenteredMessage();
}

/** Inicia tutorial review introducao. */
function startTutorialReviewIntro(project) {
  showTutorialCenteredMessages(
    [
      "Quando um jogo e lancado, criticos podem avaliar seu jogo. Melhores avaliacoes empolgam ainda mais os jogadores, aumentando suas vendas.",
      "Existem diversos criticos, voce conquista os mais famosos e influentes conforme ganha reputacao. Porem, alguns criticos grandes ligam mais para o hype geral do que para reputacao do criador.",
      "Veja so! Seu jogo chamou a atencao do nichado, porem competente, \"Indie Aficionado\"."
    ],
    () => showReviewReveal(project)
  );
}

/** Trata tutorial vendas reveal. */
function handleTutorialSalesReveal(project) {
  tutorialSalesProject = project;
  tutorialSalesPhase = 0;
  gameState.money = 0;
  showTutorialMoney();
  activeSceneWindow = "shelf";
  activeComputerApp = "desktop";
  addTutorialRevenue(project, 20000);
  render();
  showTutorialCenteredMessages(
    [
      "UAU! Essa nota foi surpreendente!",
      "Veja! As vendas foram muito maiores do que o normal.",
      "Quase 1 ano inteiro de trabalho na empresa... em 1 semana.",
      "Claro, nao e normal. Seu jogo foi um sucesso gigante... Mas mesmo assim...",
      "Talvez aquele sonho nao seja tao impossivel, afinal.",
      "Me pergunto se continuaremos assim..."
    ],
    () => requestTutorialSleep()
  );
}

/** Bloqueia o fluxo ate o jogador dormir. */
function requestTutorialSleep() {
  tutorialCustomTarget = "bed";
  showTutorialWeek();
  document.body.classList.add("tutorial-target-bed");
  setTutorialText();
  syncTutorialUi();
}

/** Valida o clique na cama e avanca a venda roteirizada correspondente. */
function handleTutorialSleepAttempt() {
  if (!tutorialActive || !["bed", "bed-final"].includes(tutorialCustomTarget)) return false;
  const isFinalSleep = tutorialCustomTarget === "bed-final";
  tutorialWeekHighlighted = false;
  tutorialCustomTarget = "";
  document.body.classList.remove("tutorial-target-bed");
  document.body.classList.remove("tutorial-target-bed-final");
  if (isFinalSleep) {
    advanceTutorialFinalWeek();
    return true;
  }

  advanceTutorialScriptedSales();
  return true;
}

/** Avanca a etapa roteirizada de vendas do tutorial. */
function advanceTutorialScriptedSales() {
  if (!tutorialSalesProject) return;

  tutorialSalesPhase += 1;
  gameState.week += 1;
  if (tutorialSalesPhase === 1) {
    addTutorialRevenue(tutorialSalesProject, 5000);
    render();
    showTutorialCenteredMessages(
      [
        "Seu jogo rendeu mais 5000 mil durante essa semana!",
        "Os valores vao diminuir com o tempo, mas seu legado nao.",
        "Sem duvidas, existe um nicho de olho em voce agora, e com grandes expectativas!",
        "Isso vai moldar sua reputacao. Uma grande reputacao chama atencao de mais pessoas, reviews e hype pelos seus proximos jogos.",
        "Faca jogos bons, com preco e prazo justo, para aumentar sua reputacao."
      ],
      () => revealTutorialReputation()
    );
    return;
  }
}

/** Apresenta reputacao e inicia a explicacao seguinte. */
function revealTutorialReputation() {
  showTutorialReputation(5);
  showTutorialCenteredMessages(
    [
      "Criar jogos te concede experiencia. Voce pode usa-los para melhorar suas habilidades."
    ],
    () => startTutorialSkillTraining()
  );
}

/** Inicia a explicacao e o destaque dos atributos. */
function startTutorialSkillTraining() {
  tutorialReputationHighlighted = false;
  activeSceneWindow = "shelf";
  tutorialCustomTarget = "attributes";
  render();
  showTutorialMessages(
    [
      "Cada atributo influencia no desenvolvimento de um novo jogo. Para garantir que alcance o valor alvo, de acordo com ambicao e prazo, desenvolva os atributos mais importantes para seus objetivos.",
      "Distribua os pontos de acordo com sua vontade. Temas, generos e plataformas tambem aumentam o valor alvo de cada atributo no desenvolvimento do jogo."
    ],
    () => grantTutorialSkillPoints(),
    false
  );
  syncTutorialUi();
}

/** Zera os atributos e concede os pontos roteirizados. */
function grantTutorialSkillPoints() {
  const resetDeveloper = {
    programming: 0,
    graphics: 0,
    design: 0,
    sound: 0,
    polish: 0
  };
  gameState.developer = { ...resetDeveloper };
  gameState.savedDeveloper = { ...resetDeveloper };
  gameState.skillPoints = 20;
  tutorialCustomTarget = "attributes-allocation";
  speechBubbleText = "Distribua os 20 pontos entre os atributos. Salvar so sera liberado quando nenhum ponto estiver sobrando.";
  render();
}

/** Valida e confirma a distribuicao de pontos do tutorial. */
function handleTutorialSkillSaveAttempt() {
  if (!tutorialActive || tutorialCustomTarget !== "attributes-allocation") return false;
  if (gameState.skillPoints !== 0) {
    rejectTutorialClick();
    return true;
  }

  gameState.savedDeveloper = { ...gameState.developer };
  addLog("Os primeiros pontos de habilidade foram distribuidos.");
  startTutorialXpIntro();
  return true;
}

/** Inicia tutorial XP introducao. */
function startTutorialXpIntro() {
  tutorialXpVisible = true;
  gameState.careerXp = tutorialSalesProject && typeof calculateCareerXpGain === "function"
    ? calculateCareerXpGain(tutorialSalesProject)
    : 0;
  tutorialCustomTarget = "xp";
  render();
  showTutorialMessages(
    [
      "Cada jogo criado gera XP. Cada vez que voce juntar XP o suficiente, voce recebe pontos para distribuir entre os atributos. Tambem existem outras formas de ganhar XP."
    ],
    () => requestTutorialFinalSleep(),
    false
  );
  syncTutorialUi();
}

/** Solicita a ultima semana roteirizada do tutorial. */
function requestTutorialFinalSleep() {
  tutorialCustomTarget = "bed-final";
  document.body.classList.add("tutorial-target-bed-final");
  setTutorialText();
  syncTutorialUi();
}

/** Processa vendas e contas da ultima semana guiada. */
function advanceTutorialFinalWeek() {
  tutorialCustomTarget = "bills";
  gameState.week += 1;
  updateReleasedGamesSales();
  changeMoney(-2000);
  updateRivalCompanies();
  addLog(`Contas mensais pagas: ${formatMoney(2000)}.`);
  render();
  showTutorialMessages(
    [
      "A cada 4 semanas, US$ 2.000 sao descontados do seu dinheiro para pagar as contas. Esse valor pode aumentar dependendo dos seus equipamentos ou localizacao."
    ],
    () => showTutorialFarewell(),
    false
  );
}

/** Exibe tutorial farewell. */
function showTutorialFarewell() {
  tutorialCustomTarget = "";
  clearTutorialHighlights();
  showTutorialCenteredMessages(
    [
      "Voce esta pronto para mudar de vida! Faca contatos, crie jogos incriveis e participe dos melhores eventos do mundo!"
    ],
    () => finishTutorialForTesting()
  );
}

/** Adiciona tutorial revenue. */
function addTutorialRevenue(project, revenue) {
  const effectivePrice = project.price * platforms[project.platform].revenueShare;
  const sales = Math.max(1, Math.round(revenue / effectivePrice));
  project.salesHistory.push({ week: gameState.week, sales, revenue });
  project.totalGrossSales = Number(project.totalGrossSales || 0) + sales;
  project.totalSales += sales;
  project.totalRevenue += revenue;
  changeMoney(revenue);
}

/** Encerra o roteiro e devolve controle total ao jogador. */
function finishTutorialForTesting() {
  tutorialActive = false;
  tutorialStatsCondensed = false;
  tutorialCenteredMessage = "";
  tutorialCenteredQueue = [];
  tutorialCenteredDone = null;
  tutorialMessageDisplay = "";
  tutorialMessageTyping = false;
  tutorialMessageCentered = true;
  tutorialCustomTarget = "";
  clearTutorialMessageTimers();
  document.body.classList.remove("tutorial-active");
  document.body.classList.remove("tutorial-dialog-centered");
  document.body.classList.remove("tutorial-target-bed");
  document.body.classList.remove("tutorial-target-bed-final");
  clearTutorialHighlights();
  activeSceneWindow = null;
  speechBubbleText = "Seu estudio agora esta em suas maos. Escolha seu proximo passo.";
  addLog("Tutorial concluido. O estudio agora segue seu proprio ritmo.");
  render();
}

/** Atualiza tutorial esperados valores. */
function updateTutorialExpectedValues() {
  const form = document.querySelector(".project-builder");
  if (!form) return;

  const suggestedPrice = calculateSuggestedPrice(Number(form.ambition?.value || 5));
  document.documentElement.style.setProperty("--tutorial-suggested-price", `"${suggestedPrice.toFixed(2)}"`);
}

/** Obtem tutorial alvos. */
function getTutorialTargets() {
  const step = getTutorialStep();
  if (!step && !tutorialCustomTarget) return [];
  const target = tutorialCustomTarget || step.target;

  if (["game-name", "ambition", "weeks", "price"].includes(target)) {
    const inputName = target === "game-name" ? "gameName" : target;
    const input = document.querySelector(`input[name='${inputName}']`);
    return input?.closest("label") ? [input.closest("label")] : [];
  }

  const selectors = {
    computer: [".hotspot-computer"],
    "create-app": ["[onclick*=\"setComputerApp('create')\"]"],
    theme: ["[onclick*=\"showChoicePicker('theme'\""],
    "theme-option": [".choice-card"],
    genre: ["[onclick*=\"showChoicePicker('genre'\""],
    "genre-option": [".choice-card"],
    platform: [".platform-choice"],
    "platform-option": [".platform-card"],
    summary: [".project-general-summary", ".project-builder button[type='submit']"],
    submit: [".project-builder button[type='submit']"],
    "focus-programming": ["[data-focus-area='programming']"],
    "focus-graphics": ["[data-focus-area='graphics']"],
    "focus-design": ["[data-focus-area='design']"],
    "focus-sound": ["[data-focus-area='sound']"],
    "focus-polish": ["[data-focus-area='polish']"],
    "marketing-tab": ["[data-project-tab='marketing']"],
    "marketing-interact": ["[data-project-action='interact']"],
    "game-tab": ["[data-project-tab='game']"],
    beta: ["[data-project-action='beta']"],
    "bug-event": [".modal .pixel-button"],
    "free-week": [".project-focus-button", "[data-project-action='devlog']", "[data-project-action='interact']", "[data-project-action='beta']:not(:disabled)"],
    attributes: [".shelf-dev-training"],
    "attributes-allocation": [".shelf-dev-training", ".shelf-dev-confirm"],
    xp: [".career-xp-stat"],
    bills: [".money-stat"],
    bed: [".hotspot-bed"],
    "bed-final": [".hotspot-bed"]
  }[target] || [];

  return selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
}

/** Trata tutorial cena janela attempt. */
function handleTutorialSceneWindowAttempt(windowName) {
  if (!tutorialActive) return false;

  const step = getTutorialStep();
  if (step.target !== "computer") {
    rejectTutorialClick();
    return true;
  }

  if (windowName !== "desk") {
    rejectTutorialClick();
    return true;
  }

  activeComputerApp = "desktop";
  shouldAnimateComputerOpen = true;
  activeSceneWindow = "desk";
  advanceTutorial();
  render();
  return true;
}

/** Trata tutorial computador aplicativo attempt. */
function handleTutorialComputerAppAttempt(appName) {
  if (!tutorialActive) return false;

  const step = getTutorialStep();
  if (step.target !== "create-app" || appName !== "create") {
    rejectTutorialClick();
    return true;
  }

  activeComputerApp = "create";
  advanceTutorial();
  render();
  return true;
}

/** Trata tutorial escolha seletor attempt. */
function handleTutorialChoicePickerAttempt(type) {
  if (!tutorialActive) return false;

  const step = getTutorialStep();
  const expectedTarget = type === "platform" ? "platform" : type;
  if (tutorialCompletedCreateFields.has(expectedTarget)) return false;
  if (step.target !== expectedTarget) {
    rejectTutorialClick();
    return true;
  }

  advanceTutorial();
  return false;
}

/** Trata tutorial create option selected. */
function handleTutorialCreateOptionSelected(type) {
  if (!tutorialActive) return;

  const step = getTutorialStep();
  if (step.target === `${type}-option`) {
    tutorialCompletedCreateFields.add(type);
    advanceTutorial();
  }
}

/** Trata tutorial projeto submitted. */
function handleTutorialProjectSubmitted() {
  if (!tutorialActive) return;

  const step = getTutorialStep();
  if (step.target === "summary") {
    activeComputerApp = "create";
    activeProjectActionTab = "marketing";
    advanceTutorial();
    advanceTutorial();
    return;
  }

  if (step.target === "submit") {
    activeComputerApp = "create";
    activeProjectActionTab = "marketing";
    advanceTutorial();
  }
}

/** Trata tutorial development foco attempt. */
function handleTutorialDevelopmentFocusAttempt(area) {
  if (!tutorialActive) return false;

  const step = getTutorialStep();
  if (step.target === "free-week") return false;

  const expectedTarget = `focus-${area}`;
  if (step.target !== expectedTarget) {
    rejectTutorialClick();
    return true;
  }

  applyTutorialFocus(area);
  addLog(`${areaLabel(area)} recebeu atencao total nesta semana. A barra chegou ao minimo que o projeto precisa.`);
  advanceTutorial();
  advanceWeek({ randomEvent: false });
  return true;
}

/** Aplica tutorial foco. */
function applyTutorialFocus(area) {
  const project = gameState.currentProject;
  if (!project) return;

  const target = area === "polish" ? project.targets.polish : project.targets[area];
  project.progress[area] = clamp(Math.max(project.progress[area], target), 0, area === "polish" ? 100 : Infinity);
  project.focusHistory[area] += 1;
}

/** Trata tutorial projeto aba attempt. */
function handleTutorialProjectTabAttempt(tabName) {
  if (!tutorialActive) return false;

  const step = getTutorialStep();
  if (step.target === "marketing-tab" && tabName === "marketing") {
    activeProjectActionTab = "marketing";
    advanceTutorial();
    render();
    return true;
  }

  if (step.target === "game-tab" && tabName === "game") {
    activeProjectActionTab = "game";
    advanceTutorial();
    render();
    return true;
  }

  if (["marketing-tab", "game-tab"].includes(step.target)) {
    rejectTutorialClick();
    return true;
  }

  return false;
}

/** Trata tutorial marketing acao attempt. */
function handleTutorialMarketingActionAttempt(actionName) {
  if (!tutorialActive) return false;

  const step = getTutorialStep();
  if (step.target === "free-week") return false;

  if (step.target !== "marketing-interact" || actionName !== "interact") {
    rejectTutorialClick();
    return true;
  }

  const p = gameState.currentProject;
  p.hype = clamp(p.hype + 4, 0, 100);
  p.communityScore += 7;
  addLog("Voce respondeu jogadores, explicou a ideia e transformou curiosidade em um pouco mais de confianca.");
  advanceTutorial();
  advanceWeek({ randomEvent: false });
  return true;
}

/** Trata tutorial jogo acao attempt. */
function handleTutorialGameActionAttempt(actionName) {
  if (!tutorialActive) return false;

  const step = getTutorialStep();
  if (step.target === "free-week") return false;

  if (step.target !== "beta" || actionName !== "beta") {
    rejectTutorialClick();
    return true;
  }

  const p = gameState.currentProject;
  if (p.betaReleased) return true;

  p.betaReleased = true;
  p.hype = clamp(p.hype + 15, 0, 100);
  p.betaResult = 12;
  addLog("O beta aberto trouxe curiosidade, feedback e uma lista honesta de coisas para aparar.");
  advanceTutorial();
  advanceWeek({ randomEvent: false });
  return true;
}

/** Exibe tutorial bugs evento. */
function showTutorialBugEvent() {
  if (tutorialBugEventShownForStep === tutorialStepIndex || activeModal) return;
  tutorialBugEventShownForStep = tutorialStepIndex;

  showModal(
    "Bugs escondidos",
    `<p>Bugs escondidos podem afetar o polimento final do jogo.</p>
    <p><strong>Ignorar</strong> diminui um valor aleatorio do polimento. <strong>Resolver</strong> consome 1 semana, mas pode ajudar mais ou menos do que um foco normal.</p>`,
    [
      {
        label: "Resolver",
        className: "green",
        action: () => resolveTutorialBugEvent("resolve")
      },
      {
        label: "Ignorar",
        className: "danger",
        action: () => resolveTutorialBugEvent("ignore")
      }
    ]
  );
}

/** Resolve tutorial bugs evento. */
function resolveTutorialBugEvent(choice) {
  const p = gameState.currentProject;
  if (!p) return;

  if (choice === "ignore") {
    const penalty = randomInt(4, 12);
    p.progress.polish = clamp(p.progress.polish - penalty, 0, 100);
    addLog(`Voce ignorou os bugs escondidos. O polimento caiu ${penalty} pontos.`);
    closeModal();
    advanceTutorial();
    render();
    return;
  }

  const gain = randomInt(3, 18);
  p.progress.polish = clamp(p.progress.polish + gain, 0, 100);
  addLog(`Voce resolveu os bugs escondidos. Perdeu uma semana, mas ganhou ${gain} pontos de polimento.`);
  closeModal();
  advanceTutorial();
  advanceWeek({ randomEvent: false });
}

/** Aplica o tilt visual para uma interacao invalida. */
function rejectTutorialClick() {
  const sceneFrame = document.querySelector(".scene-frame");
  if (!sceneFrame) return;

  sceneFrame.classList.remove("tutorial-tilt");
  void sceneFrame.offsetWidth;
  sceneFrame.classList.add("tutorial-tilt");
}

// Registra um listener global necessario para manter a interface sincronizada.
document.addEventListener("click", (event) => {
  if (!tutorialActive) return;

  if (hasTutorialCenteredMessage()) {
    event.preventDefault();
    event.stopPropagation();
    handleTutorialMessageClick();
    return;
  }

  if (["bed", "bed-final"].includes(tutorialCustomTarget)) {
    const targets = getTutorialTargets();
    if (targets.some((target) => target === event.target || target.contains(event.target))) return;

    event.preventDefault();
    event.stopPropagation();
    rejectTutorialClick();
    return;
  }

  const step = getTutorialStep();
  if (step.target === "free-week") return;

  if (step.target === "text") {
    event.preventDefault();
    event.stopPropagation();
    advanceTutorial();
    return;
  }

  const targets = getTutorialTargets();
  if (targets.some((target) => target === event.target || target.contains(event.target))) return;
  if (isTutorialCompletedCreateFieldTarget(event.target)) return;

  event.preventDefault();
  event.stopPropagation();
  rejectTutorialClick();
}, true);

// Registra um listener global necessario para manter a interface sincronizada.
document.addEventListener("input", (event) => {
  if (!tutorialActive) return;

  const step = getTutorialStep();
  const input = event.target;
  const form = document.querySelector(".project-builder");

  if (step.target === "game-name" && input.name === "gameName") {
    if (input.value.trim().length >= 1) {
      tutorialCompletedCreateFields.add("game-name");
      advanceTutorial();
    }
  }

  if (step.target === "ambition" && input.name === "ambition") {
    updateTutorialExpectedValues();
    if (Number(input.value) === 5) {
      input.disabled = true;
      input.closest("label")?.classList.add("is-tutorial-locked");
      advanceTutorial();
    }
  }

  if (step.target === "weeks" && input.name === "weeks") {
    if (Number(input.value) === 10) {
      input.readOnly = true;
      input.closest("label")?.classList.add("is-tutorial-locked");
      advanceTutorial();
    }
  }

  if (step.target === "price" && input.name === "price" && form) {
    const suggestedPrice = calculateSuggestedPrice(Number(form.ambition.value || 5));
    if (Math.abs(Number(input.value) - suggestedPrice) < 0.01) advanceTutorial();
  }
}, true);

/** Verifica se o clique voltou a um campo ja concluido. */
function isTutorialCompletedCreateFieldTarget(target) {
  const selectors = {
    "game-name": "input[name='gameName']",
    theme: "[onclick*=\"showChoicePicker('theme'\"]",
    genre: "[onclick*=\"showChoicePicker('genre'\"]",
    platform: ".platform-choice"
  };

  for (const field of tutorialCompletedCreateFields) {
    const selector = selectors[field];
    if (selector && target.closest(selector)) return true;
  }

  const picker = target.closest(".floating-picker");
  return Boolean(picker && !picker.hidden && tutorialCompletedCreateFields.has(picker.dataset.choiceType));
}

// Registra um listener global necessario para manter a interface sincronizada.
document.addEventListener("click", (event) => {
  if (!tutorialActive) return;

  const step = getTutorialStep();
  if (step.target === "summary" && event.target.closest(".project-general-summary")) {
    advanceTutorial();
  }
}, true);
