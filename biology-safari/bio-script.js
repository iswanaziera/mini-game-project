// ═══════════════════════════════════════════
//  LEVEL-BASED BIOLOGY DATABASE
// ═══════════════════════════════════════════

const LEVEL_DATA = {
  1: {
    name: "LEVEL 1: RAIN FOREST 🌴",
    questions: [
      { emoji: "🦁", question: "Animals that eat only meat or other animals are called:", options: ["Herbivores", "Carnivores", "Omnivores"], answer: 1 },
      { emoji: "🌳", question: "What do green plants produce using sunlight during photosynthesis?", options: ["Oxygen & Sugar", "Carbon & Salt", "Nitrogen & Water"], answer: 0 },
      { emoji: "🫁", question: "Which core organ allows mammals to breathe oxygen from the air?", options: ["Gills", "Stomach Nodes", "Lungs"], answer: 2 }
    ]
  },
  2: {
    name: "LEVEL 2: DEEP OCEAN 🌊",
    questions: [
      { emoji: "🐳", question: "Even though they live underwater, whales belong to which animal group?", options: ["Reptiles", "Amphibians", "Mammals"], answer: 2 },
      { emoji: "🪸", question: "Coral reefs are built by colonies of tiny living animals, not rocks!", options: ["True Statement", "False Statement", "Only in Rivers"], answer: 0 },
      { emoji: "🦈", question: "What breathing structure do sharks use to extract oxygen from sea water?", options: ["Lungs", "Gills", "Skin Pores"], answer: 1 }
    ]
  },
  3: {
    name: "LEVEL 3: HIDDEN CAVES 🦇",
    questions: [
      { emoji: "🦇", question: "Bats use high-pitched sound waves to navigate in pitch black. This is called:", options: ["Echolocation", "Photosynthesis", "Hibernation"], answer: 0 },
      { emoji: "🍄", question: "Mushrooms, mold, and toadstools belong to which living kingdom?", options: ["Plants", "Fungi", "Animals"], answer: 1 },
      { emoji: "🐻", question: "What is it called when animals sleep through winter to save energy?", options: ["Evaporation", "Camouflage", "Hibernation"], answer: 2 },
      { emoji: "🐛", question: "What is the scientific name for a caterpillar changing into a butterfly?", options: ["Metamorphosis", "Respiration", "Pollination"], answer: 0 }
    ]
  }
};

const TOTAL_QUESTIONS = 10; // 3 + 3 + 4 across all stages
const POINTS_PER_CORRECT = 10;
const JUNGLE_BURST = ["🌱", "🍁", "🦋", "🦁", "✨", "🦎", "🐸"];

// ═══════════════════════════════════════════
//  AUDIO HARMONIZER (BUG-FREE SOUND)
// ═══════════════════════════════════════════

let audioCtx = null;
let isSoundOn = true;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function toggleSound() {
  isSoundOn = !isSoundOn;
  const btn = document.getElementById("soundToggleBtn");
  
  if (isSoundOn) {
    btn.textContent = "🔊 Sound: ON";
    btn.classList.remove("muted");
    soundClick();
  } else {
    btn.textContent = "🔇 Sound: OFF";
    btn.classList.add("muted");
  }
}

function triggerTone(frequency, waveType, duration, gainVolume, delay = 0) {
  if (!isSoundOn) return;
  try {
    const ac = initAudio(), osc = ac.createOscillator(), volumeNode = ac.createGain();
    osc.connect(volumeNode); volumeNode.connect(ac.destination);
    osc.type = waveType; osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);
    volumeNode.gain.setValueAtTime(gainVolume, ac.currentTime + delay);
    volumeNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay); osc.stop(ac.currentTime + delay + duration);
  } catch (e) {}
}

const soundCorrect = () => { triggerTone(523.25, 'sine', 0.1, 0.2); triggerTone(659.25, 'sine', 0.1, 0.15, 0.06); triggerTone(783.99, 'sine', 0.2, 0.15, 0.12); };
const soundWrong   = () => { triggerTone(293.66, 'triangle', 0.15, 0.2); triggerTone(196.00, 'triangle', 0.25, 0.2, 0.08); };
const soundLevelUp = () => { [440, 554, 659, 880].forEach((f, idx) => triggerTone(f, 'sine', 0.15, 0.15, idx * 0.08)); };
const soundClick   = () => triggerTone(400, 'sine', 0.04, 0.12);
const soundWin     = () => [523, 659, 784, 1047, 1318].forEach((f, idx) => triggerTone(f, 'sine', 0.2, 0.15, idx * 0.06));

// ═══════════════════════════════════════════
//  EXPEDITION MANAGEMENT ENGINE
// ═══════════════════════════════════════════

let currentLevel = 1;
let currentQuestionIndex = 0;
let globalQuestionCount = 0;
let score = 0;
let lives = 3;
let answered = false;
let levelQuestions = [];

function showStartScreen() {
  soundClick();
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("quizArea").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
}

function startGame() {
  soundClick();
  currentLevel = 1;
  currentQuestionIndex = 0;
  globalQuestionCount = 0;
  score = 0;
  lives = 3;
  answered = false;

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("quizArea").style.display = "block";

  setupLevel();
}

function setupLevel() {
  document.getElementById("levelBadge").textContent = LEVEL_DATA[currentLevel].name;
  levelQuestions = [...LEVEL_DATA[currentLevel].questions];
  currentQuestionIndex = 0;
  loadQuestion();
}

function loadQuestion() {
  answered = false;
  const activeQ = levelQuestions[currentQuestionIndex];

  document.getElementById("qEmoji").textContent = activeQ.emoji;
  document.getElementById("qText").textContent = activeQ.question;
  document.getElementById("bubble").className = "ranger-log";
  document.getElementById("bubble").textContent = "";
  document.getElementById("nextBtn").style.display = "none";

  // Progress Bar mapping across total 10 questions
  const percentage = (globalQuestionCount / TOTAL_QUESTIONS) * 100;
  document.getElementById("trackBar").style.width = `${percentage}%`;

  updateHUD();

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";

  activeQ.options.forEach((optionText, idx) => {
    const btn = document.createElement("button");
    btn.className = "safari-tile";
    btn.textContent = optionText;
    btn.onclick = () => checkSample(idx, activeQ.answer);
    optionsContainer.appendChild(btn);
  });
}

function checkSample(chosenIdx, correctIdx) {
  if (answered) return;
  answered = true;

  const tiles = document.querySelectorAll(".safari-tile");
  tiles.forEach(t => t.disabled = true);

  const logBox = document.getElementById("bubble");

  if (chosenIdx === correctIdx) {
    soundCorrect();
    tiles[chosenIdx].classList.add("safari-correct");
    score += POINTS_PER_CORRECT;
    logBox.className = "ranger-log log-secured";
    logBox.textContent = "🌿 Sample Verified! Habitat stability restored. ✨";
    spawnJungleParticles();
  } else {
    soundWrong();
    tiles[chosenIdx].classList.add("safari-wrong");
    tiles[correctIdx].classList.add("safari-correct");
    lives--;
    logBox.className = "ranger-log log-threatened";
    logBox.textContent = `⚠️ Ecosystem Warning! Proper item match: ${levelQuestions[currentQuestionIndex].options[correctIdx]}`;

    if (lives === 0) {
      setTimeout(terminateExpedition, 1400);
      return;
    }
  }

  updateHUD();
  document.getElementById("nextBtn").style.display = "block";
}

function nextQ() {
  soundClick();
  currentQuestionIndex++;
  globalQuestionCount++;

  if (currentQuestionIndex >= levelQuestions.length) {
    // Current level fully cleared
    currentLevel++;
    if (currentLevel > 3) {
      terminateExpedition();
    } else {
      soundLevelUp();
      setupLevel();
    }
  } else {
    loadQuestion();
  }
}

function updateHUD() {
  document.getElementById("scoreVal").textContent = score;
  const hearts = [];
  for (let i = 0; i < 3; i++) {
    hearts.push(i < lives ? "❤️" : "🖤");
  }
  document.getElementById("heartsVal").textContent = hearts.join("");
}

function terminateExpedition() {
  soundWin();
  document.getElementById("quizArea").style.display = "none";
  document.getElementById("trackBar").style.width = "100%";

  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "block";

  const maxPoints = TOTAL_QUESTIONS * POINTS_PER_CORRECT;
  const metrics = score / maxPoints;

  let avatar, heading, stars, report;

  if (metrics >= 0.8) {
    avatar  = "👑";
    heading = "Elite Senior Ranger!";
    stars   = "⭐⭐⭐";
    report  = "Exceptional work! All ecosystems across all 3 zones are perfectly safe and balanced.";
  } else if (metrics >= 0.5) {
    avatar  = "🦧";
    heading = "Field Researcher!";
    stars   = "⭐⭐";
    report  = "Great effort! Most habitats are secured, but keep evaluating species interactions!";
  } else {
    avatar  = "🌱";
    heading = "Cadet Trainee!";
    stars   = "⭐";
    report  = "The eco-system collapsed under strain. Head back to base camp to revise your guides.";
  }

  document.getElementById("endEmoji").textContent = avatar;
  document.getElementById("endTitle").textContent = heading;
  document.getElementById("endScore").textContent = `${score} / ${maxPoints} Eco Points`;
  document.getElementById("endStars").textContent = stars;
  document.getElementById("endMsg").textContent   = report;
}

function spawnJungleParticles() {
  for (let i = 0; i < 6; i++) {
    const leaf = document.createElement("div");
    leaf.className = "jungle-sparkle";
    leaf.textContent = JUNGLE_BURST[Math.floor(Math.random() * JUNGLE_BURST.length)];
    leaf.style.left = `${15 + Math.random() * 70}%`;
    leaf.style.top  = `${40 + Math.random() * 30}%`;
    document.body.appendChild(leaf);
    setTimeout(() => leaf.remove(), 1000);
  }
}

showStartScreen();