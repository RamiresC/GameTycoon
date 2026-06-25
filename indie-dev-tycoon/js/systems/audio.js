// Arquivo: js/systems/audio.js
// Responsabilidade: Playlist, reproducao, fade e controles de musica.

﻿const musicPlaylist = [
  "assets/audio/Chill Out.mp3",
  "assets/audio/Hope.mp3",
  "assets/audio/One more Coffee.mp3",
  "assets/audio/Pixel Drift.mp3",
  "assets/audio/Programming.mp3"
];

let currentMusicIndex = 0;
let musicFadeTimer = null;

/** Define musica faixa. */
function setMusicTrack(audio, index) {
  currentMusicIndex = (index + musicPlaylist.length) % musicPlaylist.length;
  audio.src = encodeURI(musicPlaylist[currentMusicIndex]);
  audio.load();
}

/** Reproduz atual musica. */
function playCurrentMusic(audio, button) {
  audio.volume = 0.42;
  if (!audio.src) setMusicTrack(audio, currentMusicIndex);

  audio.play().then(() => {
    updateMusicUi();
  }).catch(() => {
    addLog("O navegador bloqueou a musica ate voce clicar de novo no botao.");
    render();
  });
}

/** Aplica fade de entrada em musica. */
function fadeInMusic(duration = 4200, targetVolume = 0.42) {
  const audio = document.getElementById("bgMusic");
  const button = document.getElementById("musicButton");
  if (!audio || !button) return;

  if (musicFadeTimer) clearInterval(musicFadeTimer);
  if (!audio.src) setMusicTrack(audio, currentMusicIndex);

  audio.volume = 0;
  audio.play().then(() => {
    updateMusicUi();
    const startedAt = Date.now();
    musicFadeTimer = setInterval(() => {
      const progress = clamp((Date.now() - startedAt) / duration, 0, 1);
      audio.volume = targetVolume * progress;
      if (progress >= 1) {
        clearInterval(musicFadeTimer);
        musicFadeTimer = null;
      }
    }, 80);
  }).catch(() => {
    addLog("O navegador bloqueou a musica ate voce clicar de novo no botao.");
    render();
  });
}

/** Define up musica playlist. */
function setupMusicPlaylist() {
  const audio = document.getElementById("bgMusic");
  const button = document.getElementById("musicButton");
  if (!audio || !button || !musicPlaylist.length) return;

  setMusicTrack(audio, currentMusicIndex);
  renderMusicPanel();
  audio.addEventListener("ended", () => {
    setMusicTrack(audio, currentMusicIndex + 1);
    playCurrentMusic(audio, button);
  });
}

/** Obtem musica faixa nome. */
function getMusicTrackName(path) {
  return decodeURIComponent(path.split("/").pop()).replace(/\.[^/.]+$/, "");
}

/** Monta musica painel. */
function renderMusicPanel() {
  const panel = document.getElementById("musicPanel");
  const audio = document.getElementById("bgMusic");
  if (!panel || !audio) return;

  const isPaused = audio.paused;
  const toggleClass = isPaused ? "green" : "danger";
  const toggleLabel = isPaused ? "Retomar Musica" : "Parar musica";

  panel.innerHTML = `
    <button id="musicToggleButton" class="pixel-button ${toggleClass}" onclick="toggleMusicPlayback()">${toggleLabel}</button>
    <div class="hud-panel-list">
      ${musicPlaylist.map((track, index) => `
        <button class="hud-panel-option" data-track-index="${index}" onclick="playMusicTrack(${index})">${getMusicTrackName(track)}</button>
      `).join("")}
    </div>
  `;
  updateMusicUi();
}

/** Atualiza musica interface. */
function updateMusicUi() {
  const audio = document.getElementById("bgMusic");
  const button = document.getElementById("musicButton");
  if (!audio || !button) return;

  button.classList.toggle("playing", !audio.paused);
  document.querySelectorAll("[data-track-index]").forEach((trackButton) => {
    trackButton.classList.toggle("active", Number(trackButton.dataset.trackIndex) === currentMusicIndex);
  });
}

/** Reproduz musica faixa. */
function playMusicTrack(index) {
  const audio = document.getElementById("bgMusic");
  const button = document.getElementById("musicButton");
  if (!audio || !button) return;

  setMusicTrack(audio, index);
  playCurrentMusic(audio, button);
}

/** Alterna musica reproducao. */
function toggleMusicPlayback() {
  const audio = document.getElementById("bgMusic");
  const button = document.getElementById("musicButton");
  if (!audio || !button) return;

  if (audio.paused) {
    playCurrentMusic(audio, button);
    return;
  }

  audio.pause();
  updateMusicUi();
  renderMusicPanel();
}

// Registra um listener global necessario para manter a interface sincronizada.
document.addEventListener("DOMContentLoaded", setupMusicPlaylist);


