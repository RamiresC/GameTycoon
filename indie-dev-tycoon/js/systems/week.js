// 5. Semana
function advanceWeek(options = {}) {
  gameState.week += 1;
  updateReleasedGamesSales();
  payMonthlyBills();
  updateRivalCompanies();

  const project = gameState.currentProject;
  if (project && options.randomEvent !== false) {
    triggerRandomEvent();
  }

  if (gameState.currentProject && gameState.week >= gameState.currentProject.releaseWeek) {
    releaseGame();
  }

  render();
}

function sleepOneWeek() {
  addLog("Voce descansou uma semana. O calendario avancou sem pedir licenca.");
  advanceWeek({ randomEvent: false });
}

function payMonthlyBills() {
  if (gameState.week <= 1 || (gameState.week - 1) % 4 !== 0) return;

  changeMoney(-2000);
  addLog(`Contas mensais pagas: ${formatMoney(2000)}. O aluguel nao respeita hype.`);
}

function applyDevelopmentFocus(area) {
  const project = gameState.currentProject;
  if (!project) return;

  ["programming", "graphics", "design", "sound", "polish"].forEach((key) => {
    let multiplier = key === area ? 1.5 : 0.3;
    if (area === "polish" && key !== "polish") multiplier = 0.2;
    if (area !== "polish" && key === "polish") multiplier = 0.15;

    const gain = gameState.developer[key] * multiplier * randomFloat(0.85, 1.15);
    project.progress[key] += gain;
    if (key === "polish") project.progress.polish = clamp(project.progress.polish, 0, 100);
  });

  project.focusHistory[area] += 1;
  addLog(`Semana focada em ${areaLabel(area)}. O projeto parece promissor, so falta sobreviver a si mesmo.`);
  advanceWeek();
}

function triggerRandomEvent() {
  if (!gameState.currentProject || Math.random() > 0.25 || activeModal) return;
  const event = randomInt(1, 4);
  if (event === 1) showBugEvent();
  if (event === 2) showIndieEvent();
  if (event === 3) resolveViralComment();
  if (event === 4) showCreativeBlock();
}

function showBugEvent() {
  showModal(
    "Mar de bugs",
    "<p>Um mar de bugs apareceu durante testes internos. Ele veio com espuma, relatorios e uma planilha passivo-agressiva.</p>",
    [
      {
        label: "Corrigir por 1 semana",
        className: "green",
        action: () => {
          const p = gameState.currentProject;
          p.progress.polish = clamp(p.progress.polish + randomInt(8, 15), 0, 100);
          closeModal();
          addLog("Voce perdeu tempo, mas matou bugs suficientes para dormir quatro horas.");
          advanceWeek({ randomEvent: false });
        }
      },
      {
        label: "Contratar ajuda",
        className: "secondary",
        action: () => {
          const cost = randomInt(3500, 8000);
          changeMoney(-cost);
          gameState.currentProject.progress.polish = clamp(gameState.currentProject.progress.polish + randomInt(6, 12), 0, 100);
          closeModal();
          addLog(`Ajuda emergencial custou ${formatMoney(cost)}. O build parou de gritar.`);
          render();
        }
      },
      {
        label: "Ignorar",
        className: "danger",
        action: () => {
          const p = gameState.currentProject;
          p.projectTrust = clamp(p.projectTrust - 5, 0, 100);
          p.progress.polish = clamp(p.progress.polish - 3, 0, 100);
          closeModal();
          addLog("Voce ignorou os bugs. Eles anotaram seu nome.");
          render();
        }
      }
    ]
  );
}

function showIndieEvent() {
  showModal(
    "Evento publico",
    "<p>Um pequeno evento indie convidou voce para mostrar o projeto entre um cafe frio e uma demo de pesca existencial.</p>",
    [
      {
        label: "Participar",
        className: "green",
        action: () => {
          const p = gameState.currentProject;
          if (Math.random() > 0.35) {
            p.hype = clamp(p.hype + 10, 0, 100);
            p.projectTrust = clamp(p.projectTrust + 5, 0, 100);
            addLog("O evento rendeu aplausos, clipes curtos e tres teorias exageradas.");
          } else {
            addLog("O evento foi simpatico. Ninguem entendeu o sistema de crafting, mas sorriram.");
          }
          closeModal();
          advanceWeek({ randomEvent: false });
        }
      },
      { label: "Recusar", action: () => { closeModal(); addLog("Voce recusou o evento para encarar a tela em silencio produtivo."); render(); } }
    ]
  );
}

function resolveViralComment() {
  const p = gameState.currentProject;
  const roll = randomInt(1, 3);
  if (roll === 1) {
    p.hype = clamp(p.hype + 8, 0, 100);
    addLog("Um comentario viral chamou seu jogo de 'o proximo pequeno grande absurdo'. Hype subiu.");
  } else if (roll === 2) {
    p.hype = clamp(p.hype - 5, 0, 100);
    addLog("Um comentario viral comparou sua UI a uma gaveta caindo. Doeu um pouco.");
  } else {
    addLog("Um comentario viral aconteceu, envelheceu e virou discussao sobre fontes.");
  }
}

function showCreativeBlock() {
  showModal(
    "Bloqueio criativo",
    "<p>Voce travou em uma parte importante do projeto. A parede parece ter opinioes fortes.</p>",
    [
      {
        label: "Insistir",
        className: "pink",
        action: () => {
          if (Math.random() > 0.45) {
            gameState.currentProject.progress.design += 10;
            addLog("Voce insistiu e encontrou uma solucao elegante. Ou pelo menos convincente.");
            closeModal();
            render();
          } else {
            addLog("Voce insistiu e perdeu uma semana perseguindo um conceito que fugiu pela janela.");
            closeModal();
            advanceWeek({ randomEvent: false });
          }
        }
      },
      {
        label: "Reorganizar",
        className: "green",
        action: () => {
          const p = gameState.currentProject;
          p.progress.polish = clamp(p.progress.polish + 5, 0, 100);
          p.hype = clamp(p.hype - 2, 0, 100);
          closeModal();
          addLog("Voce pausou, limpou escopo e perdeu dois pontos de barulho na internet.");
          render();
        }
      }
    ]
  );
}

