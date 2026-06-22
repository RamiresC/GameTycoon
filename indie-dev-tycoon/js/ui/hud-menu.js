function closeHudPanels(exceptPanel = null) {
  ["musicPanel", "gameMenuPanel"].forEach((panelId) => {
    const panel = document.getElementById(panelId);
    if (panel && panel !== exceptPanel) panel.hidden = true;
  });
}

function toggleHudPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const shouldOpen = panel.hidden;
  closeHudPanels(panel);
  panel.hidden = !shouldOpen;
}

function toggleMusicPanel() {
  renderMusicPanel();
  toggleHudPanel("musicPanel");
}

function toggleGameMenuPanel() {
  toggleHudPanel("gameMenuPanel");
}

function returnToMainMenu() {
  closeHudPanels();
  if (activeModal) closeModal();
  activeSceneWindow = null;

  const mainMenu = document.getElementById("mainMenu");
  const characterSelect = document.getElementById("characterSelect");
  const menuActions = document.getElementById("menuActions");
  const startupSetup = document.getElementById("startupSetup");

  document.body.classList.remove("game-started");
  if (mainMenu) mainMenu.classList.remove("is-hidden", "is-selecting-character");
  if (characterSelect) characterSelect.hidden = true;
  if (menuActions) menuActions.hidden = false;
  if (startupSetup) startupSetup.hidden = true;
  render();
}

document.addEventListener("click", (event) => {
  const hudControls = document.querySelector(".hud-controls");
  if (hudControls && !hudControls.contains(event.target)) closeHudPanels();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeHudPanels();
});
