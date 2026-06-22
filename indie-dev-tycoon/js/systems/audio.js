const musicPlaylist = [
  "assets/audio/Chill Out.mp3",
  "assets/audio/Hope.mp3",
  "assets/audio/One more Coffee.mp3",
  "assets/audio/Pixel Drift.mp3",
  "assets/audio/Programming.mp3"
];

let currentMusicIndex = 0;
let musicFadeTimer = null;

function setMusicTrack(audio, index) {
  currentMusicIndex = (index + musicPlaylist.length) % musicPlaylist.length;
  audio.src = encodeURI(musicPlaylist[currentMusicIndex]);
  audio.load();
}

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

function getMusicTrackName(path) {
  return decodeURIComponent(path.split("/").pop()).replace(/\.[^/.]+$/, "");
}

function renderMusicPanel() {
  const panel = document.getElementById("musicPanel");
  if (!panel) return;

  panel.innerHTML = `
    <button class="pixel-button danger" onclick="stopMusic()">Parar musica</button>
    <div class="hud-panel-list">
      ${musicPlaylist.map((track, index) => `
        <button class="hud-panel-option" data-track-index="${index}" onclick="playMusicTrack(${index})">${getMusicTrackName(track)}</button>
      `).join("")}
    </div>
  `;
  updateMusicUi();
}

function updateMusicUi() {
  const audio = document.getElementById("bgMusic");
  const button = document.getElementById("musicButton");
  if (!audio || !button) return;

  button.classList.toggle("playing", !audio.paused);
  document.querySelectorAll("[data-track-index]").forEach((trackButton) => {
    trackButton.classList.toggle("active", Number(trackButton.dataset.trackIndex) === currentMusicIndex);
  });
}

function playMusicTrack(index) {
  const audio = document.getElementById("bgMusic");
  const button = document.getElementById("musicButton");
  if (!audio || !button) return;

  setMusicTrack(audio, index);
  playCurrentMusic(audio, button);
}

function stopMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;

  audio.pause();
  updateMusicUi();
}

document.addEventListener("DOMContentLoaded", setupMusicPlaylist);

