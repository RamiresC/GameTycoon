// Arquivo: js/state.js
// Responsabilidade: Estado global persistente e estado temporario da interface.

// 2. Estado global
const DEVELOPER_ATTRIBUTE_MAX = 100;

const gameState = {
  money: 35000,
  week: 1,
  studioName: "Koshi INC",
  developerName: "Dev Indie",
  selectedCharacter: "male",
  reputation: 18,
  careerXp: 0,
  skillPoints: 0,
  skillPointsEarned: 0,
  developer: {
    programming: 6,
    graphics: 5,
    design: 6,
    sound: 4,
    polish: 4
  },
  savedDeveloper: {
    programming: 6,
    graphics: 5,
    design: 6,
    sound: 4,
    polish: 4
  },
  currentProject: null,
  releasedGames: [],
  marketRanking: [],
  rivalCompanies: [],
  indieCompanies: [],
  logMessages: [
    "Seu primeiro jogo tirou notas honestas e abriu uma fresta no mercado. Agora vem a parte dificil: provar que nao foi sorte."
  ],
  lastReviews: []
};

let activeModal = null;
let activeSceneWindow = null;
let activeComputerApp = "desktop";
let activeProjectActionTab = "marketing";
let shelfGameOffset = 0;
let selectedShelfGameIndex = null;
let shouldAnimateComputerOpen = false;
let shouldScrollComputerToTop = false;
let speechBubbleText = gameState.logMessages[0];

