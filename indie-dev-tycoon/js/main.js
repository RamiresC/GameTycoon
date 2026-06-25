// Arquivo: js/main.js
// Responsabilidade: Inicializacao da aplicacao e primeira renderizacao do jogo.

// Registra um listener global necessario para manter a interface sincronizada.
document.addEventListener("DOMContentLoaded", () => {
  ensureRivalCompanyState();
  ensureIndieCompanyState();
  render();
  const form = document.querySelector(".project-builder");
  if (form) updateProjectFormHints(form);
});
