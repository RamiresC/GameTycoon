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
