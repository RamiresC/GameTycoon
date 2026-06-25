// Arquivo: js/data/game-data.js
// Responsabilidade: Dados fixos de plataformas, temas, generos, criticos e empresas rivais.

// 1. Dados fixos
const platforms = {
  steam: {
    id: "steam",
    name: "I Steam",
    type: "PC",
    marketShare: 40,
    licenceCost: 0,
    marketBase: 40000,
    revenueShare: 0.7,
    description: "Plataforma aberta para indies. Grande publico, muita concorrencia."
  },
  preystation: {
    id: "preystation",
    name: "Preystation 5",
    type: "Console",
    marketShare: 30,
    licenceCost: 15000,
    marketBase: 30000,
    revenueShare: 0.65,
    description: "Console premium. Publico valoriza graficos e polimento."
  },
  zbox: {
    id: "zbox",
    name: "Zbox Series",
    type: "Console",
    marketShare: 30,
    licenceCost: 12000,
    marketBase: 30000,
    revenueShare: 0.65,
    description: "Console forte entre jogadores de acao e experiencias intensas."
  }
};

const themes = ["Zumbis", "Hacking", "Fantasia", "Assassino", "Gatos", "Espaco", "Corrida", "Investigacao", "Ninjas", "Terror"];

const themeSalesWeights = {
  Zumbis: { programming: 1, graphics: 1.1, design: 1.05, sound: 1.15, polish: 1 },
  Hacking: { programming: 1.3, graphics: 0.9, design: 1.15, sound: 0.9, polish: 1 },
  Fantasia: { programming: 1, graphics: 1.2, design: 1.2, sound: 1.05, polish: 1 },
  Assassino: { programming: 1.05, graphics: 1.05, design: 1.15, sound: 1, polish: 1 },
  Gatos: { programming: 0.9, graphics: 1.1, design: 1.15, sound: 1, polish: 1 },
  Espaco: { programming: 1.15, graphics: 1.25, design: 1, sound: 1.1, polish: 1 },
  Corrida: { programming: 1.2, graphics: 1.25, design: 0.9, sound: 1.15, polish: 1 },
  Investigacao: { programming: 0.95, graphics: 0.9, design: 1.35, sound: 1.05, polish: 1 },
  Ninjas: { programming: 1.15, graphics: 1.15, design: 1.05, sound: 1, polish: 1 },
  Terror: { programming: 0.9, graphics: 1.15, design: 1.15, sound: 1.35, polish: 1 }
};

const genres = {
  "Acao": { programming: 1.25, graphics: 1.1, design: 1, sound: 0.8, polish: 0.9 },
  "RPG": { programming: 1, graphics: 1, design: 1.35, sound: 1, polish: 0.95 },
  "Simulacao": { programming: 1.3, graphics: 0.8, design: 1.25, sound: 0.7, polish: 0.9 },
  "Estrategia": { programming: 1.1, graphics: 0.8, design: 1.4, sound: 0.7, polish: 0.85 },
  "Aventura": { programming: 0.9, graphics: 1.1, design: 1.2, sound: 1.1, polish: 0.9 },
  "Puzzle": { programming: 0.8, graphics: 0.7, design: 1.5, sound: 0.7, polish: 0.85 }
};

const reviewers = [
  {
    name: "Indie Aficionado",
    reach: 10,
    weights: { programming: 0.15, graphics: 0.1, design: 0.4, sound: 0.15, polish: 0.2 },
    unlock: () => true
  },
  {
    name: "Gold Digger",
    reach: 20,
    weights: { programming: 0.2, graphics: 0.2, design: 0.3, sound: 0.1, polish: 0.2 },
    unlock: (project) => gameState.reputation >= 50 || project.hype >= 40
  },
  {
    name: "IGM",
    reach: randomInt(30, 50),
    weights: { programming: 0.22, graphics: 0.22, design: 0.25, sound: 0.11, polish: 0.2 },
    unlock: (project) => gameState.reputation >= 70 || project.hype >= 70
  },
  {
    name: "TheGodGamer",
    reach: 70,
    weights: { programming: 0.25, graphics: 0.2, design: 0.25, sound: 0.1, polish: 0.2 },
    unlock: (project) => gameState.reputation >= 85 && project.hype >= 80 || estimateQuality(project) >= 8.5
  },
  {
    name: "The Joystick",
    reach: 80,
    weights: { programming: 0.22, graphics: 0.22, design: 0.26, sound: 0.1, polish: 0.2 },
    unlock: (project) => gameState.reputation >= 95 && project.hype >= 90 && estimateQuality(project) >= 8.7
  }
];

const rivalCompanies = [
  {
    id: "popstar",
    name: "Popstar",
    initialScore: 128000,
    releaseWindows: [[80, 120], [80, 120], [100, 150]],
    salesRange: [8500000, 22000000],
    reviewRange: [8.2, 9.8],
    scoreMultiplier: 1.25,
    gamePrefixes: ["Grand Theft Sofa", "Red Bread", "Midnight Roads"],
    description: "Lanca raramente, mas cada jogo vira evento mundial."
  },
  {
    id: "nimento",
    name: "Nimento",
    initialScore: 104000,
    releaseWindows: [[34, 50]],
    nextReleaseWeek: 18,
    salesRange: [3200000, 9800000],
    reviewRange: [7.8, 9.5],
    scoreMultiplier: 1.05,
    gamePrefixes: ["Super Lario", "Zolda", "Pocket Critters"],
    description: "Forte em jogos familiares, mascotes e ideias polidas."
  },
  {
    id: "unisoft",
    name: "Unisoft",
    initialScore: 85000,
    releaseWindows: [[14, 22]],
    nextReleaseWeek: 10,
    salesRange: [900000, 4200000],
    reviewRange: [5.4, 7.6],
    scoreMultiplier: 0.82,
    gamePrefixes: ["Far Crying", "Assassin's Creedence", "Watch Logs"],
    description: "Publica com muita frequencia. Vende bem, mas as notas oscilam."
  },
  {
    id: "electra-arts",
    name: "Electra Arts",
    initialScore: 73000,
    releaseWindows: [[20, 28]],
    nextReleaseWeek: 14,
    salesRange: [1200000, 5200000],
    reviewRange: [5.8, 8.0],
    scoreMultiplier: 0.88,
    gamePrefixes: ["FIFA-ish", "Battlefront Desk", "Need for Speedrun"],
    description: "Vive de franquias recorrentes, esportes e grandes campanhas."
  },
  {
    id: "pony-interactive",
    name: "Pony Interactive",
    initialScore: 68000,
    releaseWindows: [[28, 40]],
    nextReleaseWeek: 24,
    salesRange: [1500000, 7000000],
    reviewRange: [6.8, 9.0],
    scoreMultiplier: 0.96,
    gamePrefixes: ["The Last of Bus", "God of Chores", "Horizon Zero Snacks"],
    description: "Aposta em exclusivos cinematograficos e alto polimento."
  },
  {
    id: "microbox",
    name: "Microbox Studios",
    initialScore: 59000,
    releaseWindows: [[23, 37]],
    nextReleaseWeek: 20,
    salesRange: [800000, 4500000],
    reviewRange: [6.2, 8.4],
    scoreMultiplier: 0.9,
    gamePrefixes: ["Halo There", "Forza Maybe", "Gears of Chores"],
    description: "Oscila entre grandes franquias e apostas de assinatura."
  },
  {
    id: "capcomedy",
    name: "Capcomedy",
    initialScore: 51000,
    releaseWindows: [[22, 34]],
    nextReleaseWeek: 16,
    salesRange: [700000, 3800000],
    reviewRange: [6.8, 8.8],
    scoreMultiplier: 0.88,
    gamePrefixes: ["Resident Weevil", "Street Writer", "Monster Chaser"],
    description: "Bom ritmo, franquias fortes e publico fiel."
  }
];

