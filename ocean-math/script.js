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
const soundBubble  = () => { playTone(1200, 'sine', 0.06, 0.15); playTone(1400, 'sine', 0.06, 0.1, 0.06); };
const soundSplash  = () => [0, 1, 2, 3, 4].forEach(i => playTone(200 + i * 80, 'sine', 0.05, 0.1, i * 0.03));

function toggleSound() {
  soundOn = !soundOn;
  const btn = document.getElementById('sound-btn');
  btn.textContent = soundOn ? '🔊 Sound ON' : '🔇 Sound OFF';
  btn.classList.toggle('muted', !soundOn);
  if(soundOn) soundBubble();
}

function spawnBubbles() {
  for(let i = 0; i < 18; i++) {
    const b = document.createElement('div'); b.className = 'bubble';
    const s = 6 + Math.random() * 18;
    b.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;bottom:-${s}px;animation-duration:${6 + Math.random() * 12}s;animation-delay:-${Math.random() * 14}s;`;
    document.body.appendChild(b);
  }
}

function spawnWeeds() {
  for(let i = 0; i < 9; i++) {
    const w = document.createElement('div'); w.className = 'weed';
    const h = 40 + Math.random() * 80;
    w.style.cssText = `left:${i * 11 + Math.random() * 6}%;height:${h}px;animation-delay:${Math.random() * 2}s;animation-duration:${2.5 + Math.random() * 2}s;`;
    document.body.appendChild(w);
  }
}

function spawnFishDeco() {
  const fx = ['🐟', '🐠', '🐡', '🦐', '🦑'];
  for(let i = 0; i < 5; i++) {
    const f = document.createElement('div'); f.className = 'fish-deco';
    const top = 10 + Math.random() * 70, dist = window.innerWidth + 200;
    f.style.cssText = `top:${top}%;left:-80px;--d:${dist}px;animation-duration:${14 + Math.random() * 16}s;animation-delay:-${Math.random() * 20}s;`;
    f.textContent = fx[Math.floor(Math.random() * fx.length)];
    document.body.appendChild(f);
  }
}

// Initial atmospheric world spawning
spawnBubbles(); 
spawnWeeds(); 
spawnFishDeco();

const TOTAL = 10, Q_TIME = 12;
const LEVELS = {
  1: { max: 20, mulMax: 5,  ops: ['+', '-'] },
  2: { max: 50, mulMax: 10, ops: ['+', '-', '×'] },
  3: { max: 100, mulMax: 12, ops: ['+', '-', '×', '÷'] },
};
const OP_NAMES = { '+': 'Addition ➕', '-': 'Subtraction ➖', '×': 'Multiplication ✖️', '÷': 'Division ➗' };
const FISH_LIST = ['🐟', '🐠', '🐡', '🦈', '🦐', '🦑', '🐙', '🦞'];
const OK = ['🎯 Perfect!', '🌊 Amazing!', '⭐ Brilliant!', '🐠 Nailed it!', '💎 Correct!', '🚀 Superb!', '🎉 Yes!', '🔥 Great!'];
const BAD = ['🌀 Oops!', '💧 Not quite!', '🐙 Try again!', '🌊 Almost!'];

let level = 2, score = 0, correct = 0, wrong = 0, lives = 3;
let qNum = 0, currentAns = 0, answered = false, streak = 0;
let timerInterval = null, timeLeft = Q_TIME, lastTick = -1;

const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const sh = (a) => [...a].sort(() => Math.random() - 0.5);

function pickLevel(lv) {
  level = lv;
  document.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('picked'));
  document.querySelector(`[data-lv="${lv}"]`).classList.add('picked');
  soundBubble();
}

function genQ() {
  const cfg = LEVELS[level], op = cfg.ops[ri(0, cfg.ops.length - 1)];
  let a, b, ans;
  if(op === '+') { a = ri(1, cfg.max); b = ri(1, cfg.max - a); ans = a + b; }
  else if(op === '-') { ans = ri(1, cfg.max - 1); b = ri(1, ans); a = ans + b; }
  else if(op === '×') { a = ri(2, cfg.mulMax); b = ri(2, cfg.mulMax); ans = a * b; }
  else { b = ri(2, cfg.mulMax); ans = ri(2, cfg.mulMax); a = b * ans; }
  return { a, b, ans, sym: op, opName: OP_NAMES[op] };
}

function makeChoices(ans) {
  const s = new Set([ans]);
  while(s.size < 4) { 
    const off = ri(1, Math.max(4, Math.floor(ans * 0.35))); 
    const c = ans + (Math.random() < 0.5 ? off : -off); 
    if(c > 0 && c !== ans) s.add(c); 
  }
  return sh([...s]);
}

function showScreen(id) { 
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
  document.getElementById(id).classList.add('active'); 
}

function showMenu() { 
  showScreen('start'); 
  soundSplash(); 
}

function startGame() {
  score = 0; correct = 0; wrong = 0; lives = 3; qNum = 0; streak = 0;
  showScreen('game'); updateHUD(); soundSplash();
  setTimeout(nextQ, 300);
}

function updateHUD() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-q').textContent = qNum + 1;
  document.getElementById('hud-lives').textContent = '❤️'.repeat(Math.max(0, lives)) || '💀';
}

function nextQ() {
  if(qNum >= TOTAL || lives <= 0) { endGame(); return; }
  answered = false; clearInterval(timerInterval); timeLeft = Q_TIME; lastTick = -1;
  
  const q = genQ(); currentAns = q.ans;
  document.getElementById('q-badge').textContent = q.opName;
  document.getElementById('q-text').innerHTML = `${q.a} <span class="op-sym">${q.sym === '+' ? '＋' : q.sym === '-' ? '－' : q.sym}</span> ${q.b} = <span class="q-mark">?</span>`;
  document.getElementById('hud-q').textContent = qNum + 1;
  
  const grid = document.getElementById('fish-grid'); grid.innerHTML = '';
  const fishSh = sh(FISH_LIST).slice(0, 4);
  
  makeChoices(q.ans).forEach((num, i) => {
    const btn = document.createElement('button'); btn.className = 'fish-btn';
    btn.innerHTML = `<div class="fish-inner"><span class="fish-emoji">${fishSh[i]}</span><span class="fish-num">${num}</span></div>`;
    btn.onclick = () => checkAnswer(num, btn); grid.appendChild(btn);
  });
  
  const fill = document.getElementById('timer-fill');
  fill.style.width = '100%'; fill.style.background = 'linear-gradient(90deg,var(--teal),#0ea5e9)';
  
  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    const pct = (timeLeft / Q_TIME) * 100;
    fill.style.width = Math.max(0, pct) + '%';
    if(pct < 25) fill.style.background = 'linear-gradient(90deg,#e74c3c,#ff6b6b)';
    else if(pct < 55) fill.style.background = 'linear-gradient(90deg,#f39c12,#ffd700)';
    
    const tick = Math.floor(timeLeft);
    if(tick <= 3 && tick !== lastTick && tick > 0) { soundTick(); lastTick = tick; }
    if(timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
  }, 100);
}

function checkAnswer(num, btn) {
  if(answered) return;
  answered = true; clearInterval(timerInterval);
  
  if(num === currentAns) {
    correct++; streak++;
    const pts = 10 + Math.floor(timeLeft) * 2; score += pts;
    btn.classList.add('correct-fish');
    showFeedback(OK[ri(0, OK.length - 1)] + ' +' + pts, '#00d4aa');
    soundCorrect(); spawnBurst(btn);
    if(streak >= 3) { soundStreak(); showStreakBadge(); }
    disableGrid();
    setTimeout(() => { qNum++; updateHUD(); nextQ(); }, 950);
  } else {
    wrong++; streak = 0; lives--;
    btn.classList.add('wrong-fish');
    showFeedback(BAD[ri(0, BAD.length - 1)], '#ff6b6b');
    soundWrong(); hideStreak(); updateHUD();
    
    if(lives <= 0) { 
      disableGrid(); 
      setTimeout(() => endGame(), 900); 
    } else {
      setTimeout(() => {
        btn.classList.remove('wrong-fish'); answered = false;
        const fill = document.getElementById('timer-fill');
        timerInterval = setInterval(() => {
          timeLeft -= 0.1;
          const pct = (timeLeft / Q_TIME) * 100;
          fill.style.width = Math.max(0, pct) + '%';
          if(pct < 25) fill.style.background = 'linear-gradient(90deg,#e74c3c,#ff6b6b)';
          else if(pct < 55) fill.style.background = 'linear-gradient(90deg,#f39c12,#ffd700)';
          
          const tick = Math.floor(timeLeft);
          if(tick <= 3 && tick !== lastTick && tick > 0) { soundTick(); lastTick = tick; }
          if(timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
        }, 100);
      }, 600);
    }
  }
}

function timeUp() {
  if(answered) return;
  answered = true; wrong++; streak = 0; lives--;
  hideStreak(); soundTimeUp();
  showFeedback("⏰ Time's up!", '#f39c12');
  
  document.querySelectorAll('.fish-btn').forEach(b => {
    if(parseInt(b.querySelector('.fish-num').textContent) === currentAns)
      b.style.border = '2px solid var(--teal)';
  });
  
  updateHUD(); disableGrid();
  setTimeout(() => { qNum++; if(lives <= 0 || qNum >= TOTAL) endGame(); else nextQ(); }, 1300);
}

function disableGrid() { 
  document.querySelectorAll('.fish-btn').forEach(b => { b.disabled = true; b.style.cursor = 'default'; }); 
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

function spawnBurst(btn) {
  const r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for(let i = 0; i < 3; i++) {
    const b = document.createElement('div'); b.className = 'burst-bubble';
    const s = 20 + i * 20;
    b.style.cssText = `width:${s}px;height:${s}px;left:${cx - s / 2}px;top:${cy - s / 2}px;animation-delay:${i * 0.1}s;`;
    document.body.appendChild(b); setTimeout(() => b.remove(), 900);
  }
  const colors = ['#00d4aa', '#ffd700', '#ff6b6b', '#4a9eff', '#fff'];
  for(let i = 0; i < 14; i++) {
    const p = document.createElement('div'); p.className = 'particle';
    const angle = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 80, s = 6 + Math.random() * 8;
    p.style.cssText = `width:${s}px;height:${s}px;left:${cx}px;top:${cy}px;background:${colors[ri(0, colors.length - 1)]};--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist}px;animation-duration:${0.6 + Math.random() * 0.4}s;`;
    document.body.appendChild(p); setTimeout(() => p.remove(), 1100);
  }
}

function endGame() {
  clearInterval(timerInterval); soundWin(); showScreen('win');
  const pct = correct / TOTAL;
  let trophy = '🏆', title = 'Incredible!', stars = '⭐⭐⭐';
  if(lives <= 0 && correct < TOTAL * 0.4) { trophy = '🐡'; title = 'Keep Diving!'; stars = '⭐'; }
  else if(pct < 0.7) { trophy = '🌊'; title = 'Good Swim!'; stars = '⭐⭐'; }
  
  document.getElementById('win-trophy').textContent = trophy;
  document.getElementById('win-title').textContent = title;
  document.getElementById('win-sub').textContent = lives <= 0 ? `You ran out of hearts on Q${qNum + 1}!` : 'You completed all 10 questions!';
  document.getElementById('win-stars').textContent = stars;
  document.getElementById('ws-c').textContent = correct;
  document.getElementById('ws-w').textContent = wrong;
  document.getElementById('ws-s').textContent = score;
  
  for(let i = 0; i < 6; i++) {
    setTimeout(() => {
      const fake = { getBoundingClientRect: () => ({ left: ri(80, window.innerWidth - 80), top: ri(100, 400), width: 0, height: 0 }) };
      spawnBurst(fake);
    }, i * 180);
  }
}