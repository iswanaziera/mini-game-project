let soundOn = true;
let ctx = null;

function getCtx() { 
  if(!ctx) ctx = new(window.AudioContext || window.webkitAudioContext)(); 
  return ctx; 
}

function playTone(freq, type, dur, vol, delay = 0) {
  if(!soundOn) return;
  try {
    const ac = getCtx(), osc = ac.createOscillator(), gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = type; osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
    osc.start(ac.currentTime + delay); osc.stop(ac.currentTime + delay + dur);
  } catch(e){}
}

const soundCorrect = () => { playTone(523, 'sine', 0.12, 0.3); playTone(659, 'sine', 0.12, 0.3, 0.1); playTone(784, 'sine', 0.2, 0.3, 0.2); };
const soundWrong   = () => { playTone(300, 'sawtooth', 0.08, 0.2); playTone(220, 'sawtooth', 0.15, 0.2, 0.1); };
const soundTick    = () => playTone(880, 'square', 0.05, 0.08);
const soundTimeUp  = () => { playTone(400, 'sawtooth', 0.08, 0.25); playTone(300, 'sawtooth', 0.08, 0.25, 0.1); playTone(220, 'sawtooth', 0.15, 0.25, 0.2); };
const soundStreak  = () => [523, 659, 784, 1047].forEach((f, i) => playTone(f, 'sine', 0.15, 0.25, i * 0.08));
const soundWin     = () => [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => playTone(f, 'sine', 0.2, 0.25, i * 0.07));
const soundCosmic  = () => { playTone(1200, 'sine', 0.06, 0.15); playTone(1400, 'sine', 0.06, 0.1, 0.06); };
const soundIgnite  = () => [0, 1, 2, 3, 4].forEach(i => playTone(200 + i * 80, 'sine', 0.05, 0.1, i * 0.03));

function toggleSound() {
  soundOn = !soundOn;
  const btn = document.getElementById('sound-btn');
  btn.textContent = soundOn ? '🔊 Sound ON' : '🔇 Sound OFF';
  btn.classList.toggle('muted', !soundOn);
  if(soundOn) soundCosmic();
}

// Background Star Decoration
function spawnStars() {
  for(let i = 0; i < 18; i++) {
    const s = document.createElement('div'); s.className = 'star-spark';
    const size = 3 + Math.random() * 6;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;bottom:-${size}px;animation-duration:${6 + Math.random() * 12}s;animation-delay:-${Math.random() * 14}s;`;
    document.body.appendChild(s);
  }
}
spawnStars();

// Planet Match Database (Item -> Correct Target Match)
const MATCH_BANK = {
  1: [
    { item: "Closest to the Sun", target: "Mercury", badge: "Inner Rocky 🪐" },
    { item: "Hottest Planet Surface", target: "Venus", badge: "Thick Atmosphere 🌡️" },
    { item: "The Red Planet", target: "Mars", badge: "Iron Oxide 🔴" },
    { item: "Our Home World", target: "Earth", badge: "Liquid Water 🌍" },
    { item: "Largest Planet Overall", target: "Jupiter", badge: "Gas Giant 🪐" }
  ],
  2: [
    { item: "Spins completely on its side", target: "Uranus", badge: "Axial Tilt 🪐" },
    { item: "Famous magnificent icy rings", target: "Saturn", badge: "Ring System ❄️" },
    { item: "Strongest winds in Solar System", target: "Neptune", badge: "Storm World 💨" },
    { item: "Host to the Great Red Spot", target: "Jupiter", badge: "Atmosphere 🌀" },
    { item: "Dwarf Planet in Kuiper Belt", target: "Pluto", badge: "Deep Space ❄️" }
  ],
  3: [
    { item: "Powers the Sun's core", target: "Nuclear Fusion", badge: "Stellar Energy ☀️" },
    { item: "Visible layer of the Sun", target: "Photosphere", badge: "Solar Surface ☀️" },
    { item: "Outer crown seen during eclipse", target: "Corona", badge: "Solar Crown 👑" },
    { item: "Magnetic loop arcs on Sun", target: "Prominence", badge: "Magnetism 🧲" },
    { item: "Cooler, dark patches on Sun", target: "Sunspots", badge: "Solar Feature 🕶️" }
  ]
};

const TOTAL_ROUNDS = 5, ROUND_TIME = 15;
const OK = ['🎯 Perfect Drop!', '🚀 Orbit Stable!', '⭐ Match Connected!', '☀️ Telemetry Locked!'];
const BAD = ['🌀 Target Mismatch!', '☄️ Course Deviation!', '🚀 Telemetry Rejected!'];

let level = 2, score = 0, correct = 0, wrong = 0, lives = 3;
let roundNum = 0, currentMatchData = {}, answered = false, streak = 0;
let timerInterval = null, timeLeft = ROUND_TIME, lastTick = -1;
let activeRounds = [];

const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const sh = (a) => [...a].sort(() => Math.random() - 0.5);

function pickLevel(lv) {
  level = lv;
  document.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('picked'));
  document.querySelector(`[data-lv="${lv}"]`).classList.add('picked');
  soundCosmic();
}

function showScreen(id) { 
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
  document.getElementById(id).classList.add('active'); 
}

function showMenu() { 
  showScreen('start'); 
  soundIgnite(); 
}

function startGame() {
  score = 0; correct = 0; wrong = 0; lives = 3; roundNum = 0; streak = 0;
  // Load match sets
  activeRounds = sh(MATCH_BANK[level]);
  showScreen('game'); updateHUD(); initDragAndDropEvents(); soundIgnite();
  setTimeout(nextRound, 300);
}

function updateHUD() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-q').textContent = roundNum + 1;
  document.getElementById('hud-lives').textContent = '❤️'.repeat(Math.max(0, lives)) || '💀';
}

function nextRound() {
  if(roundNum >= TOTAL_ROUNDS || lives <= 0) { endGame(); return; }
  answered = false; clearInterval(timerInterval); timeLeft = ROUND_TIME; lastTick = -1;
  
  currentMatchData = activeRounds[roundNum];
  
  // Set up draggable card text
  document.getElementById('q-badge').textContent = currentMatchData.badge;
  document.getElementById('q-text').textContent = currentMatchData.item;
  document.getElementById('hud-q').textContent = roundNum + 1;
  
  // Reset card style
  const card = document.getElementById('draggable-card');
  card.style.opacity = "1";
  card.style.pointerEvents = "auto";
  
  // Build target dropzones (including correct match + random alternatives)
  const grid = document.getElementById('dropzone-grid'); grid.innerHTML = '';
  
  let allPossibleTargets = Array.from(new Set(MATCH_BANK[level].map(m => m.target)));
  let alternatives = allPossibleTargets.filter(t => t !== currentMatchData.target);
  let finalTargets = sh([currentMatchData.target, ...sh(alternatives).slice(0, 3)]);
  
  finalTargets.forEach(targetText => {
    const zone = document.createElement('div');
    zone.className = 'dropzone';
    zone.setAttribute('data-target', targetText);
    zone.innerHTML = `<div class="dz-inner">📥 Drop Here for:<br><strong>${targetText}</strong></div>`;
    
    // Drag Over Event
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      if(!answered) zone.classList.add('hovered');
    });
    
    // Drag Leave Event
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('hovered');
    });
    
    // Drop Event
    zone.addEventListener('drop', () => {
      zone.classList.remove('hovered');
      if(!answered) processMatch(targetText, zone);
    });
    
    grid.appendChild(zone);
  });
  
  // Start countdown timer bar
  const fill = document.getElementById('timer-fill');
  fill.style.width = '100%'; fill.style.background = 'linear-gradient(90deg,var(--orange),#f97316)';
  
  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    const pct = (timeLeft / ROUND_TIME) * 100;
    fill.style.width = Math.max(0, pct) + '%';
    if(pct < 25) fill.style.background = 'linear-gradient(90deg,#e74c3c,#ff6b6b)';
    
    const tick = Math.floor(timeLeft);
    if(tick <= 3 && tick !== lastTick && tick > 0) { soundTick(); lastTick = tick; }
    if(timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
  }, 100);
}

function initDragAndDropEvents() {
  const card = document.getElementById('draggable-card');
  card.addEventListener('dragstart', () => {
    card.classList.add('dragging');
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });
}

function processMatch(selectedTarget, zoneElement) {
  answered = true; clearInterval(timerInterval);
  const card = document.getElementById('draggable-card');
  card.style.opacity = "0.4";
  card.style.pointerEvents = "none";
  
  if(selectedTarget === currentMatchData.target) {
    correct++; streak++;
    const pts = 20 + Math.floor(timeLeft) * 3; score += pts;
    zoneElement.classList.add('correct-drop');
    showFeedback(OK[ri(0, OK.length - 1)] + ' +' + pts, '#00d4aa');
    soundCorrect(); spawnBurst(zoneElement);
    if(streak >= 3) { soundStreak(); showStreakBadge(); }
    setTimeout(() => { roundNum++; updateHUD(); nextRound(); }, 1200);
  } else {
    wrong++; streak = 0; lives--;
    zoneElement.classList.add('wrong-drop');
    showFeedback(BAD[ri(0, BAD.length - 1)], '#ff6b6b');
    soundWrong(); hideStreak(); updateHUD();
    
    if(lives <= 0) {
      setTimeout(() => endGame(), 100);
    } else {
      setTimeout(() => {
        zoneElement.classList.remove('wrong-drop');
        answered = false;
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
        // Resume remaining time countdown
        const fill = document.getElementById('timer-fill');
        timerInterval = setInterval(() => {
          timeLeft -= 0.1;
          const pct = (timeLeft / ROUND_TIME) * 100;
          fill.style.width = Math.max(0, pct) + '%';
          if(timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
        }, 100);
      }, 800);
    }
  }
}

function timeUp() {
  if(answered) return;
  answered = true; wrong++; streak = 0; lives--;
  hideStreak(); soundTimeUp();
  showFeedback("⏰ System Timeout!", '#f39c12');
  
  document.querySelectorAll('.dropzone').forEach(z => {
    if(z.getAttribute('data-target') === currentMatchData.target) {
      z.classList.add('correct-drop');
    }
  });
  
  updateHUD();
  setTimeout(() => { roundNum++; if(lives <= 0 || roundNum >= TOTAL_ROUNDS) endGame(); else nextRound(); }, 1500);
}

function showFeedback(msg, color) {
  const el = document.getElementById('feedback-pop');
  el.textContent = msg; el.style.color = color; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1100);
}

function showStreakBadge() { 
  document.getElementById('streak-num').textContent = streak; 
  document.getElementById('streak-pop').classList.add('show'); 
  setTimeout(() => document.getElementById('streak-pop').classList.remove('show'), 1800); 
}

function hideStreak() { 
  document.getElementById('streak-pop').classList.remove('show'); 
}

function spawnBurst(el) {
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const colors = ['#f97316', '#ffd700', '#ff6b6b', '#fff'];
  for(let i = 0; i < 12; i++) {
    const p = document.createElement('div'); p.className = 'stardust-particle';
    const angle = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 60, s = 5 + Math.random() * 6;
    p.style.cssText = `width:${s}px;height:${s}px;left:${cx}px;top:${cy}px;background:${colors[ri(0, colors.length - 1)]};--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist}px;animation-duration:0.6s;`;
    document.body.appendChild(p); setTimeout(() => p.remove(), 700);
  }
}

function endGame() {
  clearInterval(timerInterval); soundWin(); showScreen('win');
  const pct = correct / TOTAL_ROUNDS;
  let trophy = '🏆', title = 'Incredible!', stars = '⭐⭐⭐';
  if(lives <= 0 && correct < TOTAL_ROUNDS * 0.4) { trophy = '☄️'; title = 'Shields Offline!'; stars = '⭐'; }
  else if(pct < 0.7) { trophy = '🛰️'; title = 'System Mapped!'; stars = '⭐⭐'; }
  
  document.getElementById('win-trophy').textContent = trophy;
  document.getElementById('win-title').textContent = title;
  document.getElementById('win-sub').textContent = lives <= 0 ? `Gravity well captured you on item #${roundNum + 1}!` : 'Perfect drop vectors achieved!';
  document.getElementById('win-stars').textContent = stars;
  document.getElementById('ws-c').textContent = correct;
  document.getElementById('ws-w').textContent = wrong;
  document.getElementById('ws-s').textContent = score;
}