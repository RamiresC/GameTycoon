// Arquivo: js/ui/hud-menu.js
// Responsabilidade: Menus flutuantes da HUD e retorno ao menu principal.

/** Fecha hud panels. */
function closeHudPanels(exceptPanel = null) {
  ["musicPanel", "gameMenuPanel"].forEach((panelId) => {
    const panel = document.getElementById(panelId);
    if (panel && panel !== exceptPanel) panel.hidden = true;
  });
}

/** Alterna hud painel. */
function toggleHudPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const shouldOpen = panel.hidden;
  closeHudPanels(panel);
  panel.hidden = !shouldOpen;
}

/** Alterna musica painel. */
function toggleMusicPanel() {
  renderMusicPanel();
  toggleHudPanel("musicPanel");
}

/** Alterna jogo menu painel. */
function toggleGameMenuPanel() {
  toggleHudPanel("gameMenuPanel");
}

/** Fecha a partida atual e retorna ao menu principal. */
function returnToMainMenu() {
  closeHudPanels();
  if (activeModal) closeModal();
  activeSceneWindow = null;

  const mainMenu = document.getElementById("mainMenu");
  const characterSelect = document.getElementById("characterSelect");
  const menuActions = document.getElementById("menuActions");
  const startupSetup = document.getElementById("startupSetup");
  const officeIntro = document.getElementById("officeIntro");

  if (typeof finishTutorial === "function" && tutorialActive) finishTutorial();
  cancelOfficeIntro();
  document.body.classList.remove("game-started");
  if (mainMenu) mainMenu.classList.remove("is-hidden", "is-selecting-character");
  if (characterSelect) characterSelect.hidden = true;
  if (menuActions) menuActions.hidden = false;
  if (startupSetup) startupSetup.hidden = true;
  if (officeIntro) officeIntro.hidden = true;
  render();
}

// Registra um listener global necessario para manter a interface sincronizada.
document.addEventListener("click", (event) => {
  const hudControls = document.querySelector(".hud-controls");
  if (hudControls && !hudControls.contains(event.target)) closeHudPanels();
});

// Registra um listener global necessario para manter a interface sincronizada.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeHudPanels();
});
