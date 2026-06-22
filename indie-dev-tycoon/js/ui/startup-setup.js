function submitStartupSetup(event) {
  event.preventDefault();

  const form = event.target;
  const mainMenu = document.getElementById("mainMenu");
  const startupSetup = document.getElementById("startupSetup");

  gameState.developerName = form.developerName.value.trim() || "Dev Indie";
  gameState.studioName = form.studioName.value.trim() || "Koshi INC";

  runGameStartTransition(() => {
    if (startupSetup) startupSetup.hidden = true;
    if (mainMenu) mainMenu.classList.add("is-hidden");
    document.body.classList.add("game-started");
    fadeInMusic(4800);
    render();
  });
}
