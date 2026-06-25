// Arquivo: js/systems/marketing.js
// Responsabilidade: Acoes de marketing, beta, influenciadores e adiamentos.

// 6. Marketing
/** Publica devlog. */
function publishDevlog() {
  if (typeof handleTutorialMarketingActionAttempt === "function" && handleTutorialMarketingActionAttempt("devlog")) return;

  const p = gameState.currentProject;
  p.hype = clamp(p.hype + randomInt(2, 8), 0, 100);
  p.marketingScore += randomInt(2, 6);

  if (p.progress.polish < 35 && p.releaseWeek - gameState.week <= 3 && Math.random() < 0.35) {
    p.hype = clamp(p.hype + 2, 0, 100);
    addLog("Os fas perceberam que o jogo parece cru. O devlog gerou olhos, nao tranquilidade.");
  } else {
    addLog("Devlog publicado. Algumas pessoas chamaram isso de transparencia, outras de pedido de socorro estilizado.");
  }
  advanceWeek();
}

/** Processa community. */
function interactCommunity() {
  if (typeof handleTutorialMarketingActionAttempt === "function" && handleTutorialMarketingActionAttempt("interact")) return;

  const p = gameState.currentProject;
  if (Math.random() < 0.12) {
    p.hype = clamp(p.hype + 5, 0, 100);
    addLog("Uma resposta virou mini-polemica. Hype subiu do jeito errado.");
  } else {
    p.hype = clamp(p.hype + randomInt(0, 4), 0, 100);
    addLog("Voce conversou com a comunidade. Os jogadores estao empolgados, mas esperando as reviews.");
  }
  p.communityScore += randomInt(3, 7);
  advanceWeek();
}

/** Contrata influencer. */
function hireInfluencer(size) {
  const p = gameState.currentProject;
  const options = {
    small: { label: "pequeno", cost: 3000, hype: [5, 12], score: 8 },
    medium: { label: "medio", cost: 10000, hype: [12, 25], score: 16 },
    large: { label: "grande", cost: 25000, hype: [25, 45], score: 28 }
  };
  const option = options[size];
  if (gameState.money < option.cost) {
    addLog("A campanha morreu na tela de pagamento. Dinheiro tambem e feature.");
    render();
    return;
  }

  changeMoney(-option.cost);
  p.hype = clamp(p.hype + randomInt(option.hype[0], option.hype[1]), 0, 100);
  if (p.progress.polish < 40) p.hype = clamp(p.hype - randomInt(4, 12), 0, 100);
  if (p.progress.polish > 75) p.hype = clamp(p.hype + randomInt(3, 8), 0, 100);
  p.influencerScore += option.score;
  addLog(`Influenciador ${option.label} contratado. Gostou do conceito, mas julgou o menu com conviccao.`);
  closeModal();
  advanceWeek();
}

/** Exibe influencer modal. */
function showInfluencerModal() {
  showModal(
    "Contratar influenciadores",
    `<p>Escolha o tamanho do megafone. Quanto maior o alcance, maior a chance de alguem notar que o polimento ainda esta usando chinelo.</p>
    <p><span class="pill">Pequeno: ${formatMoney(3000)}</span><span class="pill">Medio: ${formatMoney(10000)}</span><span class="pill">Grande: ${formatMoney(25000)}</span></p>`,
    [
      { label: "Pequeno", className: "green", action: () => hireInfluencer("small") },
      { label: "Medio", className: "secondary", action: () => hireInfluencer("medium") },
      { label: "Grande", className: "pink", action: () => hireInfluencer("large") },
      { label: "Cancelar", action: closeModal }
    ]
  );
}

/** Lanca beta. */
function launchBeta() {
  if (typeof handleTutorialGameActionAttempt === "function" && handleTutorialGameActionAttempt("beta")) return;

  const p = gameState.currentProject;
  if (p.betaReleased) {
    addLog("O beta ja foi lancado. A internet ainda esta mastigando o primeiro.");
    render();
    return;
  }

  p.betaReleased = true;
  const polish = p.progress.polish;
  let text = "";

  if (polish < 30) {
    p.hype = clamp(p.hype - randomInt(10, 25), 0, 100);
    p.betaResult = -20;
    text = "O beta abriu os portoes. O publico entrou carregando tochas e planilhas.";
  } else if (polish < 60) {
    const mixed = Math.random() > 0.45;
    p.hype = clamp(p.hype + (mixed ? 10 : -5), 0, 100);
    p.betaResult = mixed ? -4 : -8;
    text = "O beta chamou atencao, mas revelou problemas em alta definicao emocional.";
  } else if (polish < 80) {
    p.hype = clamp(p.hype + randomInt(10, 25), 0, 100);
    p.betaResult = 12;
    text = "O beta encantou parte do publico. A palavra 'promissor' apareceu com frequencia perigosa.";
  } else {
    p.hype = clamp(p.hype + randomInt(20, 40), 0, 100);
    p.betaResult = 22;
    text = "O beta encantou o publico. Teorias, clipes e expectativas foram fabricados em massa.";
  }

  addLog(text);
  advanceWeek();
}

/** Adia jogo. */
function delayGame(weeks) {
  const p = gameState.currentProject;
  p.delays += 1;
  p.releaseWeek += weeks;
  p.deadlineWeek = p.releaseWeek;

  if (p.delays === 1) {
    p.hype = clamp(p.hype - 5, 0, 100);
  } else if (p.delays === 2) {
    p.hype = clamp(p.hype - 10, 0, 100);
  } else {
    p.hype = clamp(p.hype - 20, 0, 100);
  }

  addLog(`Lancamento adiado em ${weeks} semanas. O prazo respirou, a confianca tossiu.`);
  closeModal();
  render();
}

/** Exibe delay modal. */
function showDelayModal() {
  showModal(
    "Adiar lancamento",
    "<p>Mais tempo ajuda o jogo. Tambem ajuda a internet a escrever ensaios sobre traicao.</p>",
    [
      { label: "+4 semanas", className: "green", action: () => delayGame(4) },
      { label: "+8 semanas", className: "secondary", action: () => delayGame(8) },
      { label: "+12 semanas", className: "pink", action: () => delayGame(12) },
      { label: "Cancelar", action: closeModal }
    ]
  );
}

