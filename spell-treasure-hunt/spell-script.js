// ═══════════════════════════════════════════
//  PRIMARY ENGLISH SPELLING REGISTRY
// ═══════════════════════════════════════════

const ALL_QUESTIONS = [
  {
    emoji: "🐒",
    question: "Choose the correct spelling for this cheeky animal:",
    options: ["Mankey", "Monkey", "Monky", "Munkie"],
    answer: 1
  },
  {
    emoji: "🦷",
    question: "What do you use to clean your teeth every morning?",
    options: ["Toothbrush", "Tuthbrush", "Toothbrosh", "Tootbrush"],
    answer: 0
  },
  {
    emoji: "🍓",
    question: "Identify the correct spelling for this sweet red fruit:",
    options: ["Strawbery", "Strawberie", "Strawberry", "Strowberry"],
    answer: 2
  },
  {
    emoji: "🏫",
    question: "Where do you go to learn and meet your teachers?",
    options: ["Schoole", "Shool", "School", "Scol"],
    answer: 2
  },
  {
    emoji: "🎒",
    question: "What do you carry your books in on your back?",
    options: ["Bagpack", "Backpack", "Bakpak", "Backpak"],
    answer: 1
  },
  {
    emoji: "🦕",
    question: "Which giant creature lived on Earth millions of years ago?",
    options: ["Dinasour", "Dinosaur", "Dinosor", "Dinasor"],
    answer: 1
  },
  {
    emoji: "🗺️",
    question: "Pirates use this item to find buried treasure chests:",
    options: ["Mapp", "Mape", "Map", "Maap"],
    answer: 2
  },
  {
    emoji: "🥛",
    question: "What healthy white drink comes from cows?",
    options: ["Milk", "Melk", "Milck", "Mylk"],
    answer: 0
  },
  {
    emoji: "🩺",
    question: "Who takes care of you when you visit the clinic or hospital?",
    options: ["Docter", "Doctor", "Doctur", "Doktor"],
    answer: 1
  },
  {
    emoji: "☀️",
    question: "Which day comes right after Saturday?",
    options: ["Sonday", "Sanday", "Sunday", "Sundae"],
    answer: 2
  }
];

const TOTAL_QUESTIONS = 10;
const POINTS_PER_CORRECT = 10;
const COIN_BURST = ["🪙", "✨", "💎", "⭐", "👑", "🦜"];

// ═══════════════════════════════════════════
//  PIRATE COCKPIT AUDIO ENGINE
// ═══════════════════════════════════════════

let audioCtx = null;
let isSoundOn = true;

function getAudioContext() {
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

function playSeaTone(frequency, type, duration, volume, timing = 0) {
  if (!isSoundOn) return;
  try {
    const ac = getAudioContext(), osc = ac.createOscillator(), gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = type; osc.frequency.setValueAtTime(frequency, ac.currentTime + timing);
    gain.gain.setValueAtTime(volume, ac.currentTime + timing);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + timing + duration);
    osc.start(ac.currentTime + timing); osc.stop(ac.currentTime + timing + duration);
  } catch (e) {}
}

const soundCorrect = () => { playSeaTone(523, 'sine', 0.08, 0.2); playSeaTone(659, 'sine', 0.08, 0.2, 0.05); playSeaTone(880, 'sine', 0.18, 0.2, 0.1); };
const soundWrong   = () => { playSeaTone(180, 'sawtooth', 0.15, 0.25); };
const soundClick   = () => playSeaTone(600, 'sine', 0.03, 0.15);
const soundWin     = () => [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => playSeaTone(f, 'sine', 0.15, 0.15, i * 0.05));

// ═══════════════════════════════════════════
//  VOYAGE MECHANICS
// ═══════════════════════════════════════════

let deck = [];
let currentIndex = 0;
let score = 0;
let lives = 3;
let answered = false;

function shuffle(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

  updateHUD();
  loadQuestion();
}

function loadQuestion() {
  answered = false;
  const item = deck[currentIndex];

  document.getElementById("qEmoji").textContent = item.emoji;
  document.getElementById("qText").textContent = item.question;
  document.getElementById("bubble").className = "scroll-parchment";
  document.getElementById("bubble").textContent = "";
  document.getElementById("nextBtn").style.display = "none";

  // Steer the pirate ship dynamically along the sea track width
  const trackPercent = (currentIndex / TOTAL_QUESTIONS) * 88; // 88% keeps it within bounds
  document.getElementById("pirateShip").style.left = `${trackPercent}%`;

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";

  item.options.forEach((optionText) => {
    const btn = document.createElement("button");
    btn.className = "spell-tile";
    btn.textContent = optionText;
    btn.onclick = () => checkSpelling(btn, optionText, item.options[item.answer]);
    optionsContainer.appendChild(btn);
  });
}

function checkSpelling(clickedBtn, selectedText, correctText) {
  if (answered) return;
  answered = true;

  const buttons = document.querySelectorAll(".spell-tile");
  buttons.forEach(btn => btn.disabled = true);

  const logBox = document.getElementById("bubble");

  if (selectedText === correctText) {
    soundCorrect();
    clickedBtn.classList.add("spell-correct");
    score += POINTS_PER_CORRECT;
    logBox.className = "scroll-parchment parchment-correct";
    logBox.textContent = "🗺️ Yo-ho-ho! Perfect spelling, matey! 🌟";
    spawnGoldSparks();
  } else {
    soundWrong();
    clickedBtn.classList.add("spell-wrong");
    // highlight correct answer
    buttons.forEach(btn => {
      if (btn.textContent === correctText) btn.classList.add("spell-correct");
    });
    lives--;
    logBox.className = "scroll-parchment parchment-wrong";
    logBox.textContent = `⚓ Shiver me timbers! The right spelling is: ${correctText}`;

    if (lives === 0) {
      setTimeout(endGame, 1400);
      return;
    }
  }

  updateHUD();
  document.getElementById("nextBtn").style.display = "block";
}

function nextQ() {
  soundClick();
  currentIndex++;

  if (currentIndex >= TOTAL_QUESTIONS) {
    endGame();
  } else {
    loadQuestion();
  }
}

function updateHUD() {
  document.getElementById("scoreVal").textContent = score;
  const coins = [];
  for (let i = 0; i < 3; i++) {
    coins.push(i < lives ? "❤️" : "🖤");
  }
  document.getElementById("heartsVal").textContent = coins.join("");
}

function endGame() {
  soundWin();
  document.getElementById("quizArea").style.display = "none";

  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "block";

  const maxPoints = TOTAL_QUESTIONS * POINTS_PER_CORRECT;
  const fraction = score / maxPoints;

  let avatar, heading, stars, msg;

  if (fraction >= 0.8) {
    avatar  = "👑";
    heading = "Captain Pirate!";
    stars   = "⭐⭐⭐";
    msg     = "Blimey! You are a master of spelling words! The chest of gold belongs to you!";
  } else if (fraction >= 0.5) {
    avatar  = "🗺️";
    heading = "First Mate!";
    stars   = "⭐⭐";
    msg     = "Great sailing! You successfully navigated through the rocks to reach the shore.";
  } else {
    avatar  = "⚓";
    heading = "Deck Hand!";
    stars   = "⭐";
    msg     = "We hit rough seas. Let's study our pirate maps and try sailing again!";
  }

  document.getElementById("endEmoji").textContent = avatar;
  document.getElementById("endTitle").textContent = heading;
  document.getElementById("endScore").textContent = `${score} / ${maxPoints} Treasures`;
  document.getElementById("endStars").textContent = stars;
  document.getElementById("endMsg").textContent   = msg;
}

function spawnGoldSparks() {
  for (let i = 0; i < 6; i++) {
    const spark = document.createElement("div");
    spark.className = "gold-sparkle";
    spark.textContent = COIN_BURST[Math.floor(Math.random() * COIN_BURST.length)];
    spark.style.left = `${20 + Math.random() * 60}%`;
    spark.style.top  = `${40 + Math.random() * 30}%`;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1000);
  }
}

showStartScreen();