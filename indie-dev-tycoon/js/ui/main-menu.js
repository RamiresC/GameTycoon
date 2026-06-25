// Arquivo: js/ui/main-menu.js
// Responsabilidade: Entrada do jogo e atalho temporario para testes.

// Atalho temporario de desenvolvimento. Troque para false para restaurar o fluxo completo.
const SKIP_INTRO_AND_TUTORIAL_FOR_TESTS = false;

/** Exibe personagem select. */
function showCharacterSelect() {
  if (SKIP_INTRO_AND_TUTORIAL_FOR_TESTS) {
    startGameForTesting();
    return;
  }

  const mainMenu = document.getElementById("mainMenu");
  const characterSelect = document.getElementById("characterSelect");
  const menuActions = document.getElementById("menuActions");
  if (mainMenu) mainMenu.classList.add("is-selecting-character");
  if (characterSelect) characterSelect.hidden = false;
  if (menuActions) menuActions.hidden = true;
}

/** Inicia jogo for testing. */
function startGameForTesting() {
  const mainMenu = document.getElementById("mainMenu");
  const characterSelect = document.getElementById("characterSelect");
  const startupSetup = document.getElementById("startupSetup");
  const officeIntro = document.getElementById("officeIntro");

  runGameStartTransition(() => {
    if (mainMenu) mainMenu.classList.add("is-hidden");
    if (characterSelect) characterSelect.hidden = true;
    if (startupSetup) startupSetup.hidden = true;
    if (officeIntro) officeIntro.hidden = true;

    document.body.classList.add("game-started");
    document.body.classList.toggle("character-female", gameState.selectedCharacter === "female");
    document.body.classList.toggle("character-male", gameState.selectedCharacter !== "female");
    activeSceneWindow = null;
    render();
    fadeInMusic(1200);
  });
}
