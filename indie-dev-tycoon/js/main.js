document.addEventListener("DOMContentLoaded", () => {
  ensureRivalCompanyState();
  ensureIndieCompanyState();
  render();
  const form = document.querySelector("form");
  if (form) updateProjectFormHints(form);
});
