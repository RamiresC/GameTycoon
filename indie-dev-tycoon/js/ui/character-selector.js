// Arquivo: js/ui/character-selector.js
// Responsabilidade: Selecao visual e persistencia do personagem escolhido.

/** Seleciona personagem. */
function selectCharacter(character) {
  const mainMenu = document.getElementById("mainMenu");
  const startupSetup = document.getElementById("startupSetup");

  gameState.selectedCharacter = character;
  document.body.classList.toggle("character-female", character === "female");
  document.body.classList.toggle("character-male", character !== "female");

  runGameStartTransition(() => {
    if (mainMenu) mainMenu.classList.add("is-hidden");
    if (startupSetup) startupSetup.hidden = false;
  });
}
