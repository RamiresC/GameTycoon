// Arquivo: js/ui/startup-setup.js
// Responsabilidade: Captura dos nomes do jogador e do estudio.

/** Salva os nomes iniciais e inicia a cutscene. */
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
    showOfficeIntro();
  });
}
