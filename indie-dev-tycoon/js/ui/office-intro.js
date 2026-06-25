// Arquivo: js/ui/office-intro.js
// Responsabilidade: Cutscene inicial, animacao do personagem e texto digitado.

const officeIntroLines = [
  "Os dias estavam mais lentos do que o normal...",
  "A monotonia nunca tinha sido um problema. Mas, nesses últimos tempos, algo estava diferente.",
  "Você tem um emprego, contas pagas, aluguel em dia... E mesmo assim, está vazio.",
  "Pelo menos, as noites são mais animadas. Você gosta de jogar no computador, e esse tem sido seu único hobby.",
  "Os grande lançamentos sempre te deixaram animado, até você começar a conhecer jogos independentes.",
  "O sentimento ficou ainda mais forte conforme você acompanhava cada processo de um pequeno projeto se tornando realidade.",
  "Você sequer interagia com as pessoas, mas estava lá.",
  "Mesmo projetos simples pareciam distantes da sua realidade.",
  "Até você tentar."
];

let officeIntroLineIndex = 0;
let officeIntroCharIndex = 0;
let officeIntroTimer = null;
let officeIntroAdvanceTimer = null;
let officeIntroRevealTimers = [];
let officeIntroStarted = false;
let officeIntroIsTyping = false;

/** Retorna as alternativas de sprite para o personagem escolhido. */
function getOfficeCharacterOptions() {
  if (gameState.selectedCharacter === "female") {
    return [
      { path: "assets/images/female.dev.chair.sad.png", className: "office-intro-character-female-chair" },
      { path: "assets/images/female.dev.png", className: "office-intro-character-female" }
    ];
  }

  return [
    { path: "assets/images/male.dev.chair.sad.png", className: "office-intro-character-male-chair" },
    { path: "assets/images/male-character-animation.png", className: "office-intro-character-male" }
  ];
}

/** Exibe escritorio introducao. */
function showOfficeIntro() {
  const officeIntro = document.getElementById("officeIntro");
  const character = document.getElementById("officeIntroCharacter");
  const textBox = document.getElementById("officeIntroTextBox");
  const text = document.getElementById("officeIntroText");
  if (!officeIntro || !character || !textBox || !text) return;

  cancelOfficeIntro();
  officeIntro.hidden = false;
  officeIntro.focus({ preventScroll: true });
  officeIntro.classList.remove("is-ready");
  textBox.classList.remove("is-visible");
  text.textContent = "";
  loadOfficeCharacterSprite(character);

  officeIntroRevealTimers.push(window.setTimeout(() => {
    officeIntro.classList.add("is-ready");
  }, 80));

  officeIntroRevealTimers.push(window.setTimeout(() => {
    textBox.classList.add("is-visible");
    startOfficeIntroTyping();
  }, 2800));
}

/** Carrega escritorio personagem sprite. */
function loadOfficeCharacterSprite(character) {
  const characterOptions = getOfficeCharacterOptions();
  let characterOptionIndex = 0;
  character.className = "office-intro-character";

  /** Tenta carregar as alternativas de sprite ate encontrar uma valida. */
  function tryImage() {
    const image = new Image();
    image.onload = () => {
      const frames = Math.max(1, Math.round(image.naturalHeight / image.naturalWidth));
      character.classList.add(characterOptions[characterOptionIndex].className);
      character.style.setProperty("--office-character-frames", frames);
      character.style.setProperty("--office-character-sheet-height", `${frames * 100}%`);
      character.style.setProperty("--office-character-final-frame", frames > 1 ? "100%" : "0%");
    };
    image.onerror = () => {
      characterOptionIndex += 1;
      if (characterOptionIndex < characterOptions.length) tryImage();
    };
    image.src = characterOptions[characterOptionIndex].path;
  }

  tryImage();
}

/** Inicia escritorio introducao typing. */
function startOfficeIntroTyping() {
  if (officeIntroStarted) return;
  officeIntroStarted = true;
  officeIntroLineIndex = 0;
  officeIntroCharIndex = 0;
  typeOfficeIntroLine();
}

/** Digita escritorio introducao line. */
function typeOfficeIntroLine() {
  const text = document.getElementById("officeIntroText");
  if (!text) return;

  const line = officeIntroLines[officeIntroLineIndex];
  officeIntroIsTyping = true;
  text.textContent = line.slice(0, officeIntroCharIndex);

  if (officeIntroCharIndex < line.length) {
    officeIntroCharIndex += 1;
    officeIntroTimer = window.setTimeout(typeOfficeIntroLine, 24);
    return;
  }

  officeIntroLineIndex += 1;
  officeIntroCharIndex = 0;
  officeIntroIsTyping = false;
  scheduleOfficeIntroAutoAdvance();
}

/** Agenda escritorio introducao auto advance. */
function scheduleOfficeIntroAutoAdvance() {
  clearOfficeIntroAdvanceTimer();
  officeIntroAdvanceTimer = window.setTimeout(advanceOfficeIntro, 10000);
}

/** Limpa escritorio introducao advance temporizador. */
function clearOfficeIntroAdvanceTimer() {
  if (officeIntroAdvanceTimer) {
    window.clearTimeout(officeIntroAdvanceTimer);
    officeIntroAdvanceTimer = null;
  }
}

/** Avanca ou acelera a fala atual da cutscene. */
function advanceOfficeIntro() {
  if (!officeIntroStarted) return;

  const text = document.getElementById("officeIntroText");
  if (!text) return;

  clearOfficeIntroAdvanceTimer();

  if (officeIntroIsTyping) {
    if (officeIntroTimer) {
      window.clearTimeout(officeIntroTimer);
      officeIntroTimer = null;
    }

    text.textContent = officeIntroLines[officeIntroLineIndex];
    officeIntroLineIndex += 1;
    officeIntroCharIndex = 0;
    officeIntroIsTyping = false;
    scheduleOfficeIntroAutoAdvance();
    return;
  }

  if (officeIntroLineIndex >= officeIntroLines.length) {
    finishOfficeIntro();
    return;
  }

  typeOfficeIntroLine();
}

/** Trata escritorio introducao key. */
function handleOfficeIntroKey(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  advanceOfficeIntro();
}

/** Cancela timers e reinicia o estado da cutscene. */
function cancelOfficeIntro() {
  if (officeIntroTimer) {
    window.clearTimeout(officeIntroTimer);
    officeIntroTimer = null;
  }

  clearOfficeIntroAdvanceTimer();
  officeIntroRevealTimers.forEach((timer) => window.clearTimeout(timer));
  officeIntroRevealTimers = [];
  officeIntroStarted = false;
  officeIntroLineIndex = 0;
  officeIntroCharIndex = 0;
  officeIntroIsTyping = false;
}

/** Finaliza escritorio introducao. */
function finishOfficeIntro() {
  const officeIntro = document.getElementById("officeIntro");
  cancelOfficeIntro();

  runGameStartTransition(() => {
    if (officeIntro) officeIntro.hidden = true;
    document.body.classList.add("game-started");
    fadeInMusic(4800);
    startTutorial();
  });
}
