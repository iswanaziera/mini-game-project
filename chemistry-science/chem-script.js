// ═══════════════════════════════════════════
//  CYBER LAB DATA ARRAY
// ═══════════════════════════════════════════

const ALL_QUESTIONS = [
  {
    emoji: "🎈",
    question: "What lightweight gas makes birthday balloons float high in the air?",
    options: ["Oxygen Gas", "Helium Core", "Carbon Mass", "Iron Shield"],
    answer: 1
  },
  {
    emoji: "💨",
    question: "What element do humans breathe in from the air to survive?",
    options: ["Nitrogen Vapor", "Hydrogen Fuse", "Oxygen Element", "Gold Alloy"],
    answer: 2
  },
  {
    emoji: "💎",
    question: "Sparkly diamonds are made completely out of which element?",
    options: ["Carbon Lattice", "Silver Strand", "Copper Node", "Helium Core"],
    answer: 0
  },
  {
    emoji: "🥫",
    question: "Which strong metal is used to build heavy structures and food cans?",
    options: ["Oxygen Element", "Iron Matrix", "Neon Gas", "Gold Alloy"],
    answer: 1
  },
  {
    emoji: "🌟",
    question: "Shiny jewelry that never rusts is made from which expensive element?",
    options: ["Carbon Lattice", "Iron Matrix", "Gold Compound", "Helium Core"],
    answer: 2
  },
  {
    emoji: "🥛",
    question: "Which element is found in milk and helps build strong bones and teeth?",
    options: ["Calcium Mineral", "Copper Node", "Hydrogen Fuse", "Sodium Shell"],
    answer: 0
  },
  {
    emoji: "⚡",
    question: "Wires inside walls are made of this brownish metal that conducts electricity well:",
    options: ["Gold Compound", "Oxygen Element", "Copper Conductor", "Nitrogen Vapor"],
    answer: 2
  },
  {
    emoji: "💧",
    question: "Water is made of Oxygen mixed with which other gas element?",
    options: ["Helium Core", "Hydrogen Fuel", "Iron Matrix", "Carbon Lattice"],
    answer: 1
  },
  {
    emoji: "🧂",
    question: "Table salt is made of Chlorine mixed with which explosive metal element?",
    options: ["Sodium Catalyst", "Calcium Mineral", "Gold Compound", "Silver Strand"],
    answer: 0
  },
  {
    emoji: "🚨",
    question: "Which glowing gas is used inside bright, colourful street signs?",
    options: ["Iron Matrix", "Oxygen Element", "Neon Glow Gas", "Carbon Lattice"],
    answer: 2
  }
];

const TOTAL_QUESTIONS = 10;
const POINTS_PER_CORRECT = 10;
const OPTION_LABELS = ["ALPHA", "BETA", "GAMMA", "DELTA"];
const PARTICLE_EMOJIS = ["🧪", "⚡", "🧬", "💎", "🟢", "🔵", "🔥"];

// ═══════════════════════════════════════════
//  CYBER ACOUSTICS AUDIO LOGIC
// ═══════════════════════════════════════════

let audioCtx = null;
let isSoundOn = true; 

function initAudio() { 
  if(!audioCtx) audioCtx = new(window.AudioContext || window.webkitAudioContext)(); 
  return audioCtx; 
}

function toggleSound() {
  isSoundOn = !isSoundOn;
  const btn = document.getElementById("soundToggleBtn");
  
  if (isSoundOn) {
    btn.textContent = "🔊 AUDIO: ON";
    btn.classList.remove("muted");
    soundClick(); 
  } else {
    btn.textContent = "🔇 AUDIO: MUTED";
    btn.classList.add("muted");
  }
}

function synthesizeTone(frequency, waveform, duration, volume, latency = 0) {
  if (!isSoundOn) return; 
  try {
    const ac = initAudio(), oscNode = ac.createOscillator(), gainNode = ac.createGain();
    oscNode.connect(gainNode); gainNode.connect(ac.destination);
    oscNode.type = waveform; oscNode.frequency.setValueAtTime(frequency, ac.currentTime + latency);
    gainNode.gain.setValueAtTime(volume, ac.currentTime + latency);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + latency + duration);
    oscNode.start(ac.currentTime + latency); oscNode.stop(ac.currentTime + latency + duration);
  } catch(err){}
}

const soundCorrect = () => { synthesizeTone(587, 'triangle', 0.15, 0.25); synthesizeTone(880, 'sine', 0.25, 0.2, 0.08); };
const soundWrong   = () => { synthesizeTone(220, 'sawtooth', 0.1, 0.2); synthesizeTone(130, 'sawtooth', 0.3, 0.2, 0.08); };
const soundClick   = () => synthesizeTone(700, 'sine', 0.04, 0.12);
const soundWin     = () => [440, 554, 659, 880, 1109].forEach((freq, idx) => synthesizeTone(freq, 'sine', 0.2, 0.15, idx * 0.08));

// ═══════════════════════════════════════════
//  MATRIX PROTOCOLS
// ═══════════════════════════════════════════

let deck = [];
let currentIndex = 0;
let score = 0;
let lives = 3;
let answered = false;

function shuffle(arr) {
  let combined = [...arr];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined;
}

function showStartScreen() {
  soundClick();
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("quizArea").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
}

function startGame() {
  soundClick();
  deck = shuffle(ALL_QUESTIONS).slice(0, TOTAL_QUESTIONS);
  currentIndex = 0;
  score = 0;
  lives = 3;
  answered = false;

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("quizArea").style.display = "block";

  buildGridNodes();
  updateHUD();
  loadQuestion();
}

function buildGridNodes() {
  const container = document.getElementById("dots");
  container.innerHTML = "";
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const node = document.createElement("div");
    node.className = "matrix-node" + (i === 0 ? " current" : "");
    node.id = "node" + i;
    container.appendChild(node);
  }
}

function loadQuestion() {
  answered = false;
  const activeQ = deck[currentIndex];

  const emojiBox = document.getElementById("qEmoji");
  emojiBox.textContent = activeQ.emoji;

  document.getElementById("qText").textContent = activeQ.question;
  document.getElementById("bubble").className = "terminal-alert";
  document.getElementById("bubble").textContent = "";
  document.getElementById("nextBtn").style.display = "none";

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const node = document.getElementById("node" + i);
    if (i < currentIndex) {
      node.className = "matrix-node verified";
    } else if (i === currentIndex) {
      node.className = "matrix-node current";
    } else {
      node.className = "matrix-node";
    }
  }

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";

  activeQ.options.forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.className = "matrix-tile";
    btn.innerHTML = `<span class="tile-tag">${OPTION_LABELS[i]}</span><span class="tile-label-text">${optionText}</span>`;
    btn.onclick = () => verifyMatrix(i, activeQ.answer);
    optionsContainer.appendChild(btn);
  });
}

function verifyMatrix(chosenIdx, correctIdx) {
  if (answered) return;
  answered = true;

  const tiles = document.querySelectorAll(".matrix-tile");
  tiles.forEach(t => t.disabled = true);

  const consoleAlert = document.getElementById("bubble");

  if (chosenIdx === correctIdx) {
    soundCorrect();
    tiles[chosenIdx].classList.add("synthesized");
    score += POINTS_PER_CORRECT;
    consoleAlert.className = "terminal-alert secure-log";
    consoleAlert.textContent = "✔ SYNTHESIS SUCCESSFUL: ELEMENT COMPATIBILITY MATCHED.";
    quantumBurst();
  } else {
    soundWrong();
    tiles[chosenIdx].classList.add("ruptured");
    tiles[correctIdx].classList.add("synthesized");
    lives--;
    consoleAlert.className = "terminal-alert failure-log";
    consoleAlert.textContent = `⚡ SYSTEM WARNING: STRUCTURAL FAILURE. TRUE PROFILE: ${deck[currentIndex].options[correctIdx]}`;

    if (lives === 0) {
      setTimeout(terminateExperiment, 1400);
      return;
    }
  }

  updateHUD();
  document.getElementById("nextBtn").style.display = "block";
}

function nextQ() {
  soundClick();
  document.getElementById("node" + currentIndex).className = "matrix-node verified";
  currentIndex++;

  if (currentIndex >= TOTAL_QUESTIONS) {
    terminateExperiment();
  } else {
    loadQuestion();
  }
}

function updateHUD() {
  document.getElementById("scoreVal").textContent = score;
  const shields = [];
  for (let i = 0; i < 3; i++) {
    shields.push(i < lives ? "❤️" : "🖤");
  }
  document.getElementById("heartsVal").textContent = shields.join(" ");
}

function terminateExperiment() {
  soundWin();
  document.getElementById("quizArea").style.display = "none";

  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "block";

  const maxPoints = TOTAL_QUESTIONS * POINTS_PER_CORRECT;
  const efficiency = score / maxPoints;

  let title, stars, logMsg;

  if (efficiency >= 0.8) {
    title   = "MASTER ALCHEMIST";
    stars   = "⭐⭐⭐";
    logMsg  = "QUANTUM EFFICIENCY EXCELLENT. CORE CORES STABILIZED SUB-ATOMICALLY.";
  } else if (efficiency >= 0.5) {
    title   = "LAB ENGINEER";
    stars   = "⭐⭐";
    logMsg  = "MATRIX SECURED WITH MINOR THERMAL FLUX. FURTHER TESTING RECOMMENDED.";
  } else {
    title   = "CONTAINMENT BREACH";
    stars   = "⭐";
    logMsg  = "CRITICAL DATA DEGRADATION. CLEAN REBOOT REQURED FOR EXPERIMENT RETRY.";
  }

  document.getElementById("endTitle").textContent = title;
  document.getElementById("endScore").textContent = `YIELD VALUE: ${score} / ${maxPoints} AP`;
  document.getElementById("endStars").textContent = stars;
  document.getElementById("endMsg").textContent   = logMsg;
}

function quantumBurst() {
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("div");
    particle.className = "quantum-spark";
    particle.textContent = PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)];
    particle.style.left = `${20 + Math.random() * 60}%`;
    particle.style.top  = `${40 + Math.random() * 30}%`;
    particle.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
    particle.style.setProperty('--y', `${(Math.random() - 0.5) * 200}px`);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

showStartScreen();