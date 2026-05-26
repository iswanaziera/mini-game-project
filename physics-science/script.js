// ═══════════════════════════════════════════
//  QUESTION BANK
//  Simple physics questions for primary kids
// ═══════════════════════════════════════════

const ALL_QUESTIONS = [
  {
    emoji: "🍎",
    question: "What pulls things down to the ground?",
    options: ["Wind", "Gravity", "Magic", "Light"],
    answer: 1
  },
  {
    emoji: "☀️",
    question: "What gives us light during the day?",
    options: ["The Moon", "A torch", "The Sun", "Fire"],
    answer: 2
  },
  {
    emoji: "⚽",
    question: "What slows down a rolling ball?",
    options: ["Gravity", "Air", "Friction", "Water"],
    answer: 2
  },
  {
    emoji: "🧲",
    question: "What does a magnet attract?",
    options: ["Wood", "Iron", "Paper", "Plastic"],
    answer: 1
  },
  {
    emoji: "🌡️",
    question: "What tool do we use to measure temperature?",
    options: ["Ruler", "Clock", "Thermometer", "Scale"],
    answer: 2
  },
  {
    emoji: "🔊",
    question: "Sound is made when objects…",
    options: ["Glow", "Shake (vibrate)", "Melt", "Float"],
    answer: 1
  },
  {
    emoji: "💡",
    question: "What makes a light bulb glow?",
    options: ["Water", "Electricity", "Wind", "Ice"],
    answer: 1
  },
  {
    emoji: "🌈",
    question: "How many colours are in a rainbow?",
    options: ["5", "6", "7", "8"],
    answer: 2
  },
  {
    emoji: "🧊",
    question: "Water turns into ice when it gets very…",
    options: ["Hot", "Wet", "Cold", "Heavy"],
    answer: 2
  },
  {
    emoji: "🪞",
    question: "What bounces off a mirror?",
    options: ["Sound", "Water", "Light", "Heat"],
    answer: 2
  },
  {
    emoji: "⚖️",
    question: "Which is heavier — a feather or a rock?",
    options: ["Feather", "They are equal", "Rock", "Neither"],
    answer: 2
  },
  {
    emoji: "🔋",
    question: "Copper wire is a good…",
    options: ["Insulator", "Conductor", "Magnet", "Light"],
    answer: 1
  },
  {
    emoji: "🌑",
    question: "A shadow forms when an object blocks…",
    options: ["Wind", "Sound", "Light", "Water"],
    answer: 2
  },
  {
    emoji: "🧭",
    question: "A compass works because of…",
    options: ["Electricity", "Gravity", "Magnetism", "Friction"],
    answer: 2
  },
  {
    emoji: "🎈",
    question: "Helium balloons float because helium is lighter than…",
    options: ["Water", "Fire", "Air", "Ice"],
    answer: 2
  }
];

// ═══════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════

const TOTAL_QUESTIONS = 10;
const POINTS_PER_CORRECT = 10;
const OPTION_ICONS = ["🔴", "🟡", "🟢", "🔵"];
const CONFETTI_ICONS = ["🐸", "⭐", "🚂", "🎈", "🌟", "🎉", "🦄", "🏆", "💥", "🍭"];

// ═══════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════

let deck = [];
let currentIndex = 0;
let score = 0;
let lives = 3;
let answered = false;

// ═══════════════════════════════════════════
//  UTILITY
// ═══════════════════════════════════════════

function shuffle(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ═══════════════════════════════════════════
//  START GAME
// ═══════════════════════════════════════════

function startGame() {
  deck = shuffle(ALL_QUESTIONS).slice(0, TOTAL_QUESTIONS);
  currentIndex = 0;
  score = 0;
  lives = 3;
  answered = false;

  // Show quiz, hide end screen
  document.getElementById("endScreen").classList.remove("show");
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("quizArea").style.display = "block";

  buildDots();
  updateHUD();
  loadQuestion();
}

// ═══════════════════════════════════════════
//  BUILD PROGRESS DOTS
// ═══════════════════════════════════════════

function buildDots() {
  const container = document.getElementById("dots");
  container.innerHTML = "";

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.id = "dot" + i;
    container.appendChild(dot);
  }
}

// ═══════════════════════════════════════════
//  LOAD QUESTION
// ═══════════════════════════════════════════

function loadQuestion() {
  answered = false;

  const q = deck[currentIndex];

  // Restart emoji animation
  const emojiEl = document.getElementById("qEmoji");
  emojiEl.style.animation = "none";
  void emojiEl.offsetWidth; // force reflow
  emojiEl.style.animation = "boing 1.8s ease-in-out infinite alternate";
  emojiEl.textContent = q.emoji;

  // Set question text
  document.getElementById("qText").textContent = q.question;

  // Reset feedback and next button
  document.getElementById("bubble").className = "bubble";
  document.getElementById("bubble").textContent = "";
  document.getElementById("nextBtn").className = "next-btn";

  // Update dots
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const dot = document.getElementById("dot" + i);
    if (i < currentIndex) {
      dot.className = "dot done";
    } else if (i === currentIndex) {
      dot.className = "dot active";
    } else {
      dot.className = "dot";
    }
  }

  // Build option buttons
  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";

  q.options.forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.innerHTML = `<span class="opt-icon">${OPTION_ICONS[i]}</span>${optionText}`;
    btn.onclick = () => pickAnswer(i, q.answer);
    optionsContainer.appendChild(btn);
  });
}

// ═══════════════════════════════════════════
//  PICK ANSWER
// ═══════════════════════════════════════════

function pickAnswer(chosen, correct) {
  if (answered) return;
  answered = true;

  const buttons = document.querySelectorAll(".opt");
  buttons.forEach(btn => btn.disabled = true);

  const bubble = document.getElementById("bubble");

  if (chosen === correct) {
    // Correct!
    buttons[chosen].classList.add("correct");
    score += POINTS_PER_CORRECT;
    bubble.className = "bubble good show";
    bubble.textContent = "✅ Great job! That is correct! 🎉";
    spawnConfetti();

  } else {
    // Wrong
    buttons[chosen].classList.add("wrong");
    buttons[correct].classList.add("correct");
    lives--;
    bubble.className = "bubble bad show";
    bubble.textContent = `❌ Oops! The right answer is: ${deck[currentIndex].options[correct]}`;

    if (lives === 0) {
      setTimeout(endGame, 1300);
      return;
    }
  }

  updateHUD();
  document.getElementById("nextBtn").className = "next-btn show";
}

// ═══════════════════════════════════════════
//  NEXT QUESTION
// ═══════════════════════════════════════════

function nextQ() {
  // Mark current dot as done
  document.getElementById("dot" + currentIndex).className = "dot done";
  currentIndex++;

  if (currentIndex >= TOTAL_QUESTIONS) {
    endGame();
  } else {
    loadQuestion();
  }
}

// ═══════════════════════════════════════════
//  UPDATE HUD
// ═══════════════════════════════════════════

function updateHUD() {
  document.getElementById("scoreVal").textContent = score;

  const heartsList = ["❤️", "❤️", "❤️"];
  for (let i = 0; i < 3 - lives; i++) {
    heartsList[2 - i] = "🖤";
  }
  document.getElementById("heartsVal").textContent = heartsList.join("");
}

// ═══════════════════════════════════════════
//  END GAME
// ═══════════════════════════════════════════

function endGame() {
  document.getElementById("quizArea").style.display = "none";

  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "block";
  endScreen.classList.add("show");

  const maxScore = TOTAL_QUESTIONS * POINTS_PER_CORRECT;
  const percent = score / maxScore;

  let emoji, title, stars, message;

  if (percent >= 0.8) {
    emoji   = "🏆";
    title   = "Amazing!";
    stars   = "⭐⭐⭐";
    message = "You are a Physics superstar! 🚀";
  } else if (percent >= 0.5) {
    emoji   = "🌟";
    title   = "Good Job!";
    stars   = "⭐⭐";
    message = "Keep practising and you will be a star!";
  } else {
    emoji   = "💪";
    title   = "Keep Trying!";
    stars   = "⭐";
    message = "Every question helps you learn. Try again!";
  }

  document.getElementById("endEmoji").textContent = emoji;
  document.getElementById("endTitle").textContent = title;
  document.getElementById("endScore").textContent = `You got ${score} out of ${maxScore} points!`;
  document.getElementById("endStars").textContent = stars;
  document.getElementById("endMsg").textContent   = message;
}

// ═══════════════════════════════════════════
//  CONFETTI EFFECT
// ═══════════════════════════════════════════

function spawnConfetti() {
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement("div");
    particle.className = "conf";
    particle.textContent = CONFETTI_ICONS[Math.floor(Math.random() * CONFETTI_ICONS.length)];
    particle.style.left = `${10 + Math.random() * 80}%`;
    particle.style.top  = `${20 + Math.random() * 50}%`;
    particle.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1500);
  }
}

// ═══════════════════════════════════════════
//  KICK OFF
// ═══════════════════════════════════════════

startGame();