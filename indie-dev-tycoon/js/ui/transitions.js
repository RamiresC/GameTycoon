// Arquivo: js/ui/transitions.js
// Responsabilidade: Transicao de fade usada ao iniciar o jogo.

/** Executa o fade e chama a troca de tela no momento escuro. */
function runGameStartTransition(onBlackScreen) {
  const fadeOverlay = document.getElementById("fadeOverlay");
  if (fadeOverlay) fadeOverlay.classList.add("is-fading");

  setTimeout(() => {
    onBlackScreen();
  }, 1700);

  setTimeout(() => {
    if (fadeOverlay) fadeOverlay.classList.remove("is-fading");
  }, 5400);
}
