// ══════════════════════════════════════════
//  LEVEL DATA
// ══════════════════════════════════════════
const LEVELS = [
  {
    title: "Level 1 · Explorer 🌍",
    pairs: [
      { planet: "Earth",   emoji: "🔵", fact: "The only planet with liquid water and living things." },
      { planet: "Mars",    emoji: "🔴", fact: "Called the Red Planet — it looks rusty and red." },
      { planet: "Saturn",  emoji: "🪐", fact: "Famous for its beautiful rings made of ice and rock." },
      { planet: "Jupiter", emoji: "🟠", fact: "The biggest planet in our solar system." },
    ]
  },
  {
    title: "Level 2 · Astronaut 🚀",
    pairs: [
      { planet: "Mercury", emoji: "⚫", fact: "The closest planet to the Sun." },
      { planet: "Venus",   emoji: "🟡", fact: "The hottest planet, even hotter than Mercury." },
      { planet: "Earth",   emoji: "🔵", fact: "Has one moon that lights up our night sky." },
      { planet: "Mars",    emoji: "🔴", fact: "Has the tallest volcano in the solar system, Olympus Mons." },
      { planet: "Jupiter", emoji: "🟠", fact: "Has at least 95 known moons — more than any other planet." },
      { planet: "Saturn",  emoji: "🪐", fact: "So light it could float on water if there was an ocean big enough!" },
    ]
  },
  {
    title: "Level 3 · Space Genius 🌌",
    pairs: [
      { planet: "Mercury", emoji: "⚫", fact: "A year here is only 88 Earth days long." },
      { planet: "Venus",   emoji: "🟡", fact: "This planet spins backwards compared to most planets." },
      { planet: "Earth",   emoji: "🔵", fact: "The only planet not named after a god or goddess." },
      { planet: "Mars",    emoji: "🔴", fact: "Its thin atmosphere is mostly made of carbon dioxide." },
      { planet: "Jupiter", emoji: "🟠", fact: "Its Great Red Spot is a storm that has lasted over 350 years." },
      { planet: "Saturn",  emoji: "🪐", fact: "Its rings are made of billions of pieces of ice and rock." },
      { planet: "Uranus",  emoji: "🩵", fact: "This planet rotates on its side with a tilt of 98 degrees." },
      { planet: "Neptune", emoji: "🫐", fact: "The windiest planet with storms reaching 2,100 km/h." },
    ]
  }
];

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let currentLevel = 0;
let score = 0, tries = 0, dragging = null;
let levelStars = [0, 0, 0];
let levelDone  = [false, false, false];
let totalTries = 0;

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function updateHomeUI() {
  for (let i = 0; i < 3; i++) {
    const card = document.getElementById('card-' + i);
    const lock = document.getElementById('lock-' + i);
    const done = document.getElementById('done-' + i);

    if (card && lock) {
      const unlocked = i === 0 || levelDone[i - 1];
      card.classList.toggle('locked', !unlocked);
      lock.style.display = unlocked ? 'none' : 'block';
    }
    if (done) done.classList.toggle('show', levelDone[i]);
  }
  const total = levelStars.reduce((a, b) => a + b, 0);
  document.getElementById('total-stars-count').textContent = total;
}

// ══════════════════════════════════════════
//  START LEVEL
// ══════════════════════════════════════════
function startLevel(idx) {
  currentLevel = idx;
  score = 0; tries = 0; dragging = null;

  const lv = LEVELS[idx];
  document.getElementById('level-title-bar').textContent = lv.title;
  document.getElementById('score').textContent = 0;
  document.getElementById('total').textContent = lv.pairs.length;
  document.getElementById('tries').textContent = 0;
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('prog-pct').textContent = '0%';
  document.getElementById('result-banner').classList.remove('show');

  buildGame(lv.pairs);
  showScreen('screen-game');
}

// ══════════════════════════════════════════
//  BUILD GAME BOARD
// ══════════════════════════════════════════
function buildGame(pairs) {
  const planets = shuffle(pairs);
  const facts   = shuffle(pairs);

  const pl = document.getElementById('planet-list');
  const dl = document.getElementById('drop-list');
  pl.innerHTML = '';
  dl.innerHTML = '';

  planets.forEach(d => {
    const el = document.createElement('div');
    el.className = 'planet-card';
    el.draggable = true;
    el.dataset.planet = d.planet;
    el.innerHTML = `<span class="planet-emoji">${d.emoji}</span><span class="planet-name">${d.planet}</span>`;

    el.addEventListener('dragstart', () => { dragging = d.planet; el.classList.add('dragging'); });
    el.addEventListener('dragend',   () => { el.classList.remove('dragging'); });
    pl.appendChild(el);
  });

  facts.forEach(d => {
    const zone = document.createElement('div');
    zone.className = 'drop-zone';
    zone.dataset.answer = d.planet;
    zone.innerHTML = `<span class="fact-text">${d.fact}</span>`;

    zone.addEventListener('dragover',  e => { e.preventDefault(); if (!zone.dataset.done) zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('over'); handleDrop(zone); });
    dl.appendChild(zone);
  });
}

// ══════════════════════════════════════════
//  HANDLE DROP
// ══════════════════════════════════════════
function handleDrop(zone) {
  if (zone.dataset.done || !dragging) return;

  const lv = LEVELS[currentLevel];
  tries++;
  totalTries++;
  document.getElementById('tries').textContent = tries;

  if (dragging === zone.dataset.answer) {
    score++;
    document.getElementById('score').textContent = score;

    const pct = Math.round((score / lv.pairs.length) * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('prog-pct').textContent = pct + '%';

    zone.classList.add('correct');
    zone.dataset.done = '1';

    const d = lv.pairs.find(x => x.planet === dragging);
    const tag = document.createElement('span');
    tag.className = 'dropped-tag';
    tag.innerHTML = `${d.emoji} ${dragging} ✓`;
    zone.appendChild(tag);

    const card = document.querySelector(`.planet-card[data-planet="${dragging}"]`);
    if (card) { card.classList.add('matched'); card.draggable = false; }

    if (score === lv.pairs.length) setTimeout(showResult, 500);
  } else {
    zone.classList.add('wrong');
    setTimeout(() => zone.classList.remove('wrong'), 500);
  }
  dragging = null;
}

// ══════════════════════════════════════════
//  SHOW RESULT
// ══════════════════════════════════════════
function showResult() {
  const lv      = LEVELS[currentLevel];
  const perfect = tries === lv.pairs.length;
  const good    = tries <= lv.pairs.length + 2;

  let stars = perfect ? 3 : good ? 2 : 1;
  levelStars[currentLevel] = Math.max(levelStars[currentLevel], stars);
  levelDone[currentLevel]  = true;

  // Render stars
  const starsEl = document.getElementById('stars-earned');
  starsEl.innerHTML = '';
  for (let i = 1; i <= 3; i++) {
    const s = document.createElement('span');
    s.className = 'star-big' + (i <= stars ? '' : ' dim');
    s.textContent = '⭐';
    starsEl.appendChild(s);
  }

  const msgs = [
    ["Nice try, space cadet!",       "Keep practising and you'll reach the stars!"],
    ["Great job, Space Explorer!",   "You're blasting through the solar system!"],
    ["Perfect! You nailed it! 🌟",  "Not a single wrong answer — amazing!"]
  ];

  document.getElementById('result-title').textContent = msgs[stars - 1][0];
  document.getElementById('result-sub').textContent =
    msgs[stars - 1][1] + ` (${tries} tr${tries === 1 ? 'y' : 'ies'})`;

  // Buttons
  const btns = document.getElementById('result-btns');
  btns.innerHTML = '';

  const retryBtn = document.createElement('button');
  retryBtn.className = 'btn btn-secondary';
  retryBtn.textContent = '🔄 Try Again';
  retryBtn.onclick = () => {
    document.getElementById('result-banner').classList.remove('show');
    startLevel(currentLevel);
  };
  btns.appendChild(retryBtn);

  if (currentLevel < 2) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.textContent = 'Next Level →';
    nextBtn.onclick = () => startLevel(currentLevel + 1);
    btns.appendChild(nextBtn);
  } else {
    const winBtn = document.createElement('button');
    winBtn.className = 'btn btn-primary';
    winBtn.textContent = '🏆 See Results!';
    winBtn.onclick = showWinner;
    btns.appendChild(winBtn);
  }

  document.getElementById('result-banner').classList.add('show');
  updateHomeUI();
}

// ══════════════════════════════════════════
//  WINNER SCREEN
// ══════════════════════════════════════════
function showWinner() {
  const total = levelStars.reduce((a, b) => a + b, 0);
  document.getElementById('win-stars').textContent = total + ' / 9';
  document.getElementById('win-tries').textContent = totalTries;
  showScreen('screen-winner');
}

function goHome() {
  updateHomeUI();
  showScreen('screen-home');
}

function fullReset() {
  levelStars = [0, 0, 0];
  levelDone  = [false, false, false];
  totalTries = 0;
  updateHomeUI();
  showScreen('screen-home');
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
updateHomeUI();