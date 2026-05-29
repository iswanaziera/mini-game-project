// ═══════════════════════════════════════════
//  3-LEVEL CYBER BIOLOGY REGISTRY
// ═══════════════════════════════════════════

const MATRIX_DATABASE = {
  1: {
    layerName: "LAYER 01 // CELLULAR_REPAIR",
    nodes: [
      { glyph: "🧬", prompt: "Which macromolecule contains the genetic blueprints of life?", choices: ["Proteins", "DNA", "Carbohydrates"], correctKey: 1 },
      { glyph: "🔋", prompt: "Known as the powerhouse of the cell, this organelle generates ATP energy:", choices: ["Mitochondria", "Nucleus", "Ribosome"], correctKey: 0 },
      { glyph: "🛡️", prompt: "What external boundary controls which substances enter or exit an animal cell?", choices: ["Cell Wall", "Cytoplasm", "Cell Membrane"], correctKey: 2 }
    ]
  },
  2: {
    layerName: "LAYER 02 // ORGAN_SYNCHRONIZATION",
    nodes: [
      { glyph: "🫀", prompt: "Which muscular organ is responsible for pumping oxygenated blood throughout the body?", choices: ["Lungs", "Heart", "Kidneys"], correctKey: 1 },
      { glyph: "🧠", prompt: "The primary control center of the nervous system is the:", choices: ["Spinal Cord", "Brain", "Nerve Node"], correctKey: 1 },
      { glyph: "🧪", prompt: "Which digestive organ uses hydrochloric acid to break down nutritional matter?", choices: ["Stomach", "Liver", "Large Intestine"], correctKey: 0 }
    ]
  },
  3: {
    layerName: "LAYER 03 // BIOSPHERE_NET",
    nodes: [
      { glyph: "☀️", prompt: "Organisms that create their own food using light energy are classified as:", choices: ["Producers", "Consumers", "Decomposers"], correctKey: 0 },
      { glyph: "🍄", prompt: "Organisms like fungi that break down dead biological matter are called:", choices: ["Herbivores", "Apex Predators", "Decomposers"], correctKey: 2 },
      { glyph: "🌡️", prompt: "The state of steady internal physical and chemical balance maintained by living systems is:", choices: ["Photosynthesis", "Homeostasis", "Metamorphosis"], correctKey: 1 },
      { glyph: "🦎", prompt: "An animal that regulates its body temperature using external environmental heat is:", choices: ["Ectothermic", "Endothermic", "Cryogenic"], correctKey: 0 }
    ]
  }
};

const MAX_SEQUENCES = 10;
const REWARD_INCREMENT = 10;
const MATRIX_SPARK_GLYPHS = ["⚡", "💻", "🟢", "🌐", "✨", "🧬"];

// ═══════════════════════════════════════════
//  SYNTHETIC WEB AUDIO ENGINE
// ═══════════════════════════════════════════

let audioContextInstance = null;
let audioSystemActive = true;

function fetchAudioEngine() {
  if (!audioContextInstance) {
    audioContextInstance = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContextInstance;
}

function toggleAudioSystem() {
  audioSystemActive = !audioSystemActive;
  const targetBtn = document.getElementById("soundToggleBtn");
  
  if (audioSystemActive) {
    targetBtn.textContent = "[ AUDIO: ENABLED ]";
    targetBtn.classList.remove("disabled-audio");
    triggerMatrixPing(500, 'sine', 0.05, 0.1);
  } else {
    targetBtn.textContent = "[ AUDIO: MUTED ]";
    targetBtn.classList.add("disabled-audio");
  }
}

function triggerMatrixPing(freq, wave, duration, volume, offset = 0) {
  if (!audioSystemActive) return;
  try {
    const ctx = fetchAudioEngine();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + duration);
    
    osc.start(ctx.currentTime + offset);
    osc.stop(ctx.currentTime + offset + duration);
  } catch (err) {}
}

const audioSuccess = () => { triggerMatrixPing(880, 'sine', 0.08, 0.15); triggerMatrixPing(1320, 'sine', 0.15, 0.1, 0.05); };
const audioFailure = () => { triggerMatrixPing(180, 'sawtooth', 0.2, 0.2); };
const audioTierUp  = () => { [523, 659, 784, 1047].forEach((f, i) => triggerMatrixPing(f, 'sine', 0.12, 0.1, i * 0.06)); };
const audioDefault  = () => triggerMatrixPing(700, 'sine', 0.03, 0.08);
const audioVictory  = () => [587, 698, 880, 1174, 1396].forEach((f, i) => triggerMatrixPing(f, 'triangle', 0.15, 0.1, i * 0.05));

// ═══════════════════════════════════════════
//  GAME RULES MANAGEMENT INTERFACE
// ═══════════════════════════════════════════

let activeLayer = 1;
let subIndex = 0;
let totalSequencesProcessed = 0;
let scoreAccumulated = 0;
let systemIntegrityNodes = 3;
let nodeLockoutActive = false;
let targetedLayerSet = [];

function returnToMenu() {
  audioDefault();
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("quizArea").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
}

function initiateMatrix() {
  audioDefault();
  activeLayer = 1;
  subIndex = 0;
  totalSequencesProcessed = 0;
  scoreAccumulated = 0;
  systemIntegrityNodes = 3;
  nodeLockoutActive = false;

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("quizArea").style.display = "block";

  compileActiveLayer();
}

function compileActiveLayer() {
  document.getElementById("levelBadge").textContent = MATRIX_DATABASE[activeLayer].layerName;
  targetedLayerSet = [...MATRIX_DATABASE[activeLayer].nodes];
  subIndex = 0;
  executeNodeLoading();
}

function executeNodeLoading() {
  nodeLockoutActive = false;
  const nodeData = targetedLayerSet[subIndex];

  document.getElementById("qEmoji").textContent = nodeData.glyph;
  document.getElementById("qText").textContent = nodeData.prompt;
  document.getElementById("bubble").className = "terminal-feedback";
  document.getElementById("bubble").textContent = "";
  document.getElementById("nextBtn").style.display = "none";

  const linearTrackRatio = (totalSequencesProcessed / MAX_SEQUENCES) * 100;
  document.getElementById("trackBar").style.width = `${linearTrackRatio}%`;

  synchronizeDashboardDisplays();

  const choiceDeck = document.getElementById("options");
  choiceDeck.innerHTML = "";

  nodeData.choices.forEach((text, index) => {
    const tile = document.createElement("button");
    tile.className = "matrix-tile";
    tile.textContent = `[ ${index + 1} ] ${text}`;
    tile.onclick = () => validateSelection(tile, index, nodeData.correctKey);
    choiceDeck.appendChild(tile);
  });
}

function validateSelection(selectedTile, chosenIdx, authenticIdx) {
  if (nodeLockoutActive) return;
  nodeLockoutActive = true;

  const standardTiles = document.querySelectorAll(".matrix-tile");
  standardTiles.forEach(t => t.disabled = true);

  const consoleLog = document.getElementById("bubble");

  if (chosenIdx === authenticIdx) {
    audioSuccess();
    selectedTile.classList.add("node-verified");
    scoreAccumulated += REWARD_INCREMENT;
    consoleLog.className = "terminal-feedback feed-success";
    consoleLog.textContent = ">> STATUS: CORE VERIFIED. SECTOR EQUILIBRIUM OPTIMAL.";
    generateNeonSparks();
  } else {
    audioFailure();
    selectedTile.classList.add("node-corrupted");
    standardTiles[authenticIdx].classList.add("node-verified");
    systemIntegrityNodes--;
    consoleLog.className = "terminal-feedback feed-error";
    consoleLog.textContent = `>> WARNING: MALFUNCTION. CORRECT DECRYPT KEY: ${targetedLayerSet[subIndex].choices[authenticIdx]}`;

    if (systemIntegrityNodes === 0) {
      setTimeout(terminateSimulationReport, 1400);
      return;
    }
  }

  synchronizeDashboardDisplays();
  document.getElementById("nextBtn").style.display = "block";
}

function advanceSequence() {
  audioDefault();
  subIndex++;
  totalSequencesProcessed++;

  if (subIndex >= targetedLayerSet.length) {
    activeLayer++;
    if (activeLayer > 3) {
      terminateSimulationReport();
    } else {
      audioTierUp();
      compileActiveLayer();
    }
  } else {
    executeNodeLoading();
  }
}

function synchronizeDashboardDisplays() {
  document.getElementById("scoreVal").textContent = String(scoreAccumulated).padStart(3, '0');
  const glyphArray = [];
  for (let i = 0; i < 3; i++) {
    glyphArray.push(i < systemIntegrityNodes ? "▲" : "△");
  }
  document.getElementById("heartsVal").textContent = glyphArray.join(" ");
}

function terminateSimulationReport() {
  audioVictory();
  document.getElementById("quizArea").style.display = "none";
  document.getElementById("trackBar").style.width = "100%";

  const endScreenView = document.getElementById("endScreen");
  endScreenView.style.display = "block";

  const absoluteLimit = MAX_SEQUENCES * REWARD_INCREMENT;
  const ratingCoefficient = scoreAccumulated / absoluteLimit;

  let visualGlyph, titleString, rankingStars, textReport;

  if (ratingCoefficient >= 0.8) {
    visualGlyph = "⚡";
    titleString = "ARCHITECT SUPREME";
    rankingStars = "★★★";
    textReport = ">> SYSTEM CORES RESTORED. Bio-Matrix structural breakdown averted. Neural feedback lines loop at 100% capacity.";
  } else if (ratingCoefficient >= 0.5) {
    visualGlyph = "📡";
    titleString = "SYSTEM OPERATOR";
    rankingStars = "★★☆";
    textReport = ">> SECTOR INCOMPLETE. Most biological nodes stabilized. Minor cellular discrepancies detected in layer networks.";
  } else {
    visualGlyph = "🛑";
    titleString = "CONTAINMENT BREACH";
    rankingStars = "★☆☆";
    textReport = ">> OVERRIDE SCHEMATIC COLLAPSED. Bio-Matrix format failure critical. Re-evaluation protocol highly advised.";
  }

  document.getElementById("endEmoji").textContent = visualGlyph;
  document.getElementById("endTitle").textContent = titleString;
  document.getElementById("endScore").textContent = `INTEGRITY RATING: ${scoreAccumulated} / ${absoluteLimit}`;
  document.getElementById("endStars").textContent = rankingStars;
  document.getElementById("endMsg").textContent = textReport;
}

function generateNeonSparks() {
  for (let i = 0; i < 6; i++) {
    const plasma = document.createElement("div");
    plasma.className = "cyber-sparkle";
    plasma.textContent = MATRIX_SPARK_GLYPHS[Math.floor(Math.random() * MATRIX_SPARK_GLYPHS.length)];
    plasma.style.left = `${15 + Math.random() * 70}%`;
    plasma.style.top = `${40 + Math.random() * 30}%`;
    document.body.appendChild(plasma);
    setTimeout(() => plasma.remove(), 1000);
  }
}

returnToMenu();