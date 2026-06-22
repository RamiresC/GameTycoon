function showCharacterSelect() {
  const mainMenu = document.getElementById("mainMenu");
  const characterSelect = document.getElementById("characterSelect");
  const menuActions = document.getElementById("menuActions");
  if (mainMenu) mainMenu.classList.add("is-selecting-character");
  if (characterSelect) characterSelect.hidden = false;
  if (menuActions) menuActions.hidden = true;
}
