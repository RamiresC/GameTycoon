function showModal(title, body, actions) {
  const oldModal = document.getElementById("modal");
  if (oldModal) oldModal.remove();

  activeModal = { title, body, actions };
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="window-title">${title}</div>
      <h2>${title}</h2>
      ${body}
      <div class="modal-actions">
        ${actions.map((action, index) => `<button class="pixel-button ${action.className || ""}" onclick="handleModalAction(${index})">${action.label}</button>`).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function handleModalAction(index) {
  if (!activeModal || !activeModal.actions[index]) return;
  const action = activeModal.actions[index].action;
  if (typeof action === "function") action();
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.remove();
  activeModal = null;
  render();
}

