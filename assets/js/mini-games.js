/* ============================================================
   Artima Edu — mini-games.js
   4 Mini Games + Achievements + Leaderboard (localStorage)
   ============================================================ */

const GAMES_STORAGE_KEY = 'artima-mini-games';

/* ---------- Default data structure ---------- */
function getDefaultData() {
  return {
    playerName: '',
    gamesPlayed: 0,
    scores: { pattern: [], math: [], scramble: [], cipher: [], arrows: [], colors: [] },
    achievements: {
      first_game:      { unlocked: false, date: null },
      pattern_master:  { unlocked: false, date: null },
      math_wizard:     { unlocked: false, date: null },
      word_guru:       { unlocked: false, date: null },
      cipher_master:   { unlocked: false, date: null },
      perfect_10:      { unlocked: false, date: null },
      speed_demon:     { unlocked: false, date: null },
      all_rounder:     { unlocked: false, date: null },
      high_scorer:     { unlocked: false, date: null },
      persistent:      { unlocked: false, date: null }
    }
  };
}

const ACHIEVEMENT_META = {
  first_game:     { icon: '🚀', name: 'First Launch',    desc: 'Selesaikan game pertamamu' },
  pattern_master: { icon: '🧩', name: 'Pattern Master',  desc: 'Skor 100+ di Pattern Puzzle' },
  math_wizard:    { icon: '🔢', name: 'Math Wizard',     desc: 'Skor 100+ di Math Galaxy' },
  word_guru:      { icon: '🔤', name: 'Word Guru',       desc: 'Skor 80+ di Word Scramble' },
  cipher_master:  { icon: '🔐', name: 'Cipher Master',   desc: 'Skor 100+ di Cipher Quest' },
  perfect_10:     { icon: '⭐', name: 'Perfect 10',      desc: 'Jawab semua benar di satu game' },
  speed_demon:    { icon: '⚡', name: 'Speed Demon',     desc: 'Sisa waktu total 50+ detik di Math Galaxy' },
  all_rounder:    { icon: '🎯', name: 'All Rounder',     desc: 'Mainkan semua 4 game' },
  high_scorer:    { icon: '🏆', name: 'High Scorer',     desc: 'Total skor semua game > 300' },
  persistent:     { icon: '💪', name: 'Never Give Up',   desc: 'Mainkan 10 game total' }
};

/* ---------- Storage helpers ---------- */
function loadData() {
  try {
    const raw = localStorage.getItem(GAMES_STORAGE_KEY);
    if (!raw) return getDefaultData();
    const d = JSON.parse(raw);
    // Merge missing keys
    const def = getDefaultData();
    if (!d.scores) {
      d.scores = def.scores;
    } else {
      for (const k of Object.keys(def.scores)) {
        if (!d.scores[k]) d.scores[k] = [];
      }
    }
    if (!d.achievements) d.achievements = def.achievements;
    for (const k of Object.keys(def.achievements)) {
      if (!d.achievements[k]) d.achievements[k] = def.achievements[k];
    }
    if (typeof d.gamesPlayed !== 'number') d.gamesPlayed = 0;
    return d;
  } catch { return getDefaultData(); }
}

function saveData(data) {
  localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(data));
}

function addScore(gameKey, name, score) {
  const data = loadData();
  data.scores[gameKey].push({
    name: name,
    score: score,
    date: new Date().toISOString().slice(0, 10)
  });
  // Keep top 50 per game
  data.scores[gameKey].sort((a, b) => b.score - a.score);
  data.scores[gameKey] = data.scores[gameKey].slice(0, 50);
  data.gamesPlayed++;
  saveData(data);
  return data;
}

function getBestScore(gameKey) {
  const data = loadData();
  const arr = data.scores[gameKey];
  if (!arr || arr.length === 0) return 0;
  return arr[0].score;
}

/* ---------- Achievement checking ---------- */
function checkAchievements(gameKey, score, correctCount, totalCount, extraInfo) {
  const data = loadData();
  const newlyUnlocked = [];
  const now = new Date().toISOString().slice(0, 10);

  function unlock(id) {
    if (!data.achievements[id].unlocked) {
      data.achievements[id] = { unlocked: true, date: now };
      newlyUnlocked.push(id);
    }
  }

  // First game
  unlock('first_game');

  // Game-specific score achievements
  if (gameKey === 'pattern' && score >= 100) unlock('pattern_master');
  if (gameKey === 'math'    && score >= 100) unlock('math_wizard');
  if (gameKey === 'scramble' && score >= 80) unlock('word_guru');
  if (gameKey === 'cipher'  && score >= 100) unlock('cipher_master');

  // Perfect (all correct)
  if (correctCount === totalCount) unlock('perfect_10');

  // Speed demon (Math Galaxy extra info = total remaining seconds)
  if (gameKey === 'math' && extraInfo && extraInfo.totalTimeRemaining >= 50) {
    unlock('speed_demon');
  }

  // All rounder: played at least 1 of each
  if (data.scores.pattern.length > 0 && data.scores.math.length > 0 && data.scores.scramble.length > 0 && data.scores.cipher.length > 0) {
    unlock('all_rounder');
  }

  // High scorer: best score sum > 400 (now includes cipher)
  const bestP = data.scores.pattern.length ? data.scores.pattern[0].score : 0;
  const bestM = data.scores.math.length    ? data.scores.math[0].score    : 0;
  const bestS = data.scores.scramble.length ? data.scores.scramble[0].score : 0;
  const bestC = data.scores.cipher.length  ? data.scores.cipher[0].score  : 0;
  if (bestP + bestM + bestS + bestC > 400) unlock('high_scorer');

  // Persistent: 10+ games
  if (data.gamesPlayed >= 10) unlock('persistent');

  saveData(data);
  return newlyUnlocked;
}

/* ============================================================
   DOM / UI
   ============================================================ */
let currentGame = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- Player name ---------- */
function initPlayerName() {
  const data = loadData();
  const input = $('#player-name');
  const greeting = $('#player-greeting');

  if (data.playerName) {
    input.value = data.playerName;
    greeting.textContent = `👋 Welcome back, ${data.playerName}!`;
  }

  $('#btn-save-name').addEventListener('click', saveName);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });
}

function saveName() {
  const input = $('#player-name');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  const data = loadData();
  data.playerName = name;
  saveData(data);
  $('#player-greeting').textContent = `👋 Halo, ${name}! Pilih game di bawah!`;
}

function getPlayerName() {
  const data = loadData();
  return data.playerName || 'Player';
}

/* ---------- Navigation ---------- */
function showHub(lastGame) {
  $('.games-hub').style.display = '';
  $$('.game-screen').forEach(s => s.classList.remove('active'));
  $('.game-result').classList.remove('active');
  $('.achievements-section').style.display = '';
  $('.leaderboard-section').style.display = '';
  updateBestScores();
  renderAchievements();
  renderLeaderboard(lastGame || 'arrows');
  currentGame = null;
}

function hideHub() {
  $('.games-hub').style.display = 'none';
  $('.achievements-section').style.display = 'none';
  $('.leaderboard-section').style.display = 'none';
  $('.game-result').classList.remove('active');
}

function startGame(gameKey) {
  const name = $('#player-name').value.trim();
  if (!name) {
    $('#player-name').focus();
    $('#player-greeting').textContent = '⚠️ Masukkan namamu dulu!';
    $('#player-greeting').style.color = '#ef4444';
    setTimeout(() => { $('#player-greeting').style.color = ''; }, 2000);
    return;
  }
  saveName();
  hideHub();
  currentGame = gameKey;

  if (gameKey === 'pattern') startPatternGame();
  else if (gameKey === 'math') startMathGame();
  else if (gameKey === 'scramble') startScrambleGame();
  else if (gameKey === 'cipher') startCipherGame();
  else if (gameKey === 'arrows') startArrowsGame();
  else if (gameKey === 'colors') startColorsGame();
}

function updateBestScores() {
  $('#best-pattern').textContent  = `Best: ${getBestScore('pattern')}`;
  $('#best-math').textContent     = `Best: ${getBestScore('math')}`;
  $('#best-scramble').textContent = `Best: ${getBestScore('scramble')}`;
  $('#best-cipher').textContent   = `Best: ${getBestScore('cipher')}`;
  $('#best-arrows').textContent   = `Best: ${getBestScore('arrows')}`;
  $('#best-colors').textContent   = `Best: ${getBestScore('colors')}`;
}

/* ---------- Game Result Screen ---------- */
function showResult(gameKey, score, correctCount, totalCount, extraInfo) {
  $$('.game-screen').forEach(s => s.classList.remove('active'));

  const prevBest = getBestScore(gameKey);
  const data = addScore(gameKey, getPlayerName(), score);
  const isNewRecord = score > prevBest && prevBest > 0;

  const newAchievements = checkAchievements(gameKey, score, correctCount, totalCount, extraInfo);

  const result = $('.game-result');
  result.querySelector('.final-score').textContent = score;
  result.querySelector('.result-details').innerHTML =
    `✅ Benar: ${correctCount}/${totalCount}<br>` +
    `🏅 Best Score: ${Math.max(score, prevBest)}`;

  const recordEl = result.querySelector('.new-record');
  recordEl.style.display = isNewRecord ? 'block' : 'none';
  recordEl.textContent = '🎉 NEW RECORD!';

  // Show newly unlocked achievements
  const achContainer = result.querySelector('.unlocked-achievements');
  if (newAchievements.length > 0) {
    achContainer.style.display = 'block';
    achContainer.querySelector('.ach-list').innerHTML = newAchievements.map(id => {
      const m = ACHIEVEMENT_META[id];
      return `<span class="ach-badge">${m.icon} ${m.name}</span>`;
    }).join('');
  } else {
    achContainer.style.display = 'none';
  }

  // Wire buttons
  result.querySelector('.btn-play-again').onclick = () => {
    result.classList.remove('active');
    startGame(gameKey);
  };
  result.querySelector('.btn-menu').onclick = () => {
    result.classList.remove('active');
    showHub(gameKey);
  };

  result.classList.add('active');
}

/* ============================================================
   GAME 1: Pattern Puzzle
   ============================================================ */
const PATTERN_GENERATORS = [
  // Arithmetic +N
  () => {
    const start = rand(1, 20);
    const step = rand(2, 7);
    const seq = Array.from({ length: 6 }, (_, i) => start + step * i);
    return { seq, type: 'number' };
  },
  // Arithmetic -N
  () => {
    const start = rand(50, 100);
    const step = rand(2, 8);
    const seq = Array.from({ length: 6 }, (_, i) => start - step * i);
    return { seq, type: 'number' };
  },
  // Multiply ×N
  () => {
    const base = rand(2, 6);
    const seq = Array.from({ length: 6 }, (_, i) => base * (i + 1));
    return { seq, type: 'number' };
  },
  // Powers
  () => {
    const base = rand(2, 4);
    const seq = Array.from({ length: 6 }, (_, i) => Math.pow(base, i + 1));
    return { seq, type: 'number' };
  },
  // Fibonacci-like
  () => {
    const a = rand(1, 5), b = rand(1, 5);
    const seq = [a, b];
    for (let i = 2; i < 6; i++) seq.push(seq[i-1] + seq[i-2]);
    return { seq, type: 'number' };
  },
  // Alternating +A, +B
  () => {
    const start = rand(1, 10);
    const a = rand(2, 5), b = rand(1, 4);
    const seq = [start];
    for (let i = 1; i < 6; i++) seq.push(seq[i-1] + (i % 2 === 1 ? a : b));
    return { seq, type: 'number' };
  },
  // Square numbers
  () => {
    const off = rand(1, 5);
    const seq = Array.from({ length: 6 }, (_, i) => (i + off) * (i + off));
    return { seq, type: 'number' };
  },
  // Triangular numbers
  () => {
    const seq = Array.from({ length: 6 }, (_, i) => ((i+1)*(i+2))/2 );
    return { seq, type: 'number' };
  }
];

let patternState = {};

function startPatternGame() {
  patternState = { round: 0, score: 0, correct: 0, total: 10 };
  const screen = $('#game-pattern');
  screen.classList.add('active');
  nextPatternRound();
}

function nextPatternRound() {
  if (patternState.round >= patternState.total) {
    $('#game-pattern').classList.remove('active');
    showResult('pattern', patternState.score, patternState.correct, patternState.total);
    return;
  }

  patternState.round++;
  patternState.startTime = Date.now();

  $('#pattern-round').textContent = `${patternState.round}/${patternState.total}`;
  $('#pattern-score').textContent = patternState.score;

  const gen = PATTERN_GENERATORS[rand(0, PATTERN_GENERATORS.length - 1)];
  const { seq } = gen();

  // Pick a random position to hide (not first or last for better puzzle)
  const hideIdx = rand(1, seq.length - 2);
  const answer = seq[hideIdx];

  // Build display
  const seqEl = $('#pattern-sequence');
  seqEl.innerHTML = seq.map((val, i) => {
    if (i === hideIdx) return '<span class="missing">?</span>';
    return `<span class="item">${val}</span>`;
  }).join('');

  // Generate choices (answer + 3 wrong)
  const choices = generateChoices(answer, seq);
  const choicesEl = $('#pattern-choices');
  choicesEl.innerHTML = choices.map(c =>
    `<button data-val="${c}">${c}</button>`
  ).join('');

  choicesEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => handlePatternAnswer(btn, answer));
  });
}

function handlePatternAnswer(btn, answer) {
  const val = parseInt(btn.dataset.val);
  const allBtns = $$('#pattern-choices button');
  allBtns.forEach(b => b.style.pointerEvents = 'none');

  if (val === answer) {
    btn.classList.add('correct');
    const elapsed = (Date.now() - patternState.startTime) / 1000;
    const bonus = elapsed < 5 ? 5 : 0;
    patternState.score += 10 + bonus;
    patternState.correct++;
    // Show answer in sequence
    const missing = $('#pattern-sequence .missing');
    if (missing) { missing.textContent = answer; missing.classList.remove('missing'); missing.classList.add('item'); }
  } else {
    btn.classList.add('wrong');
    // Highlight correct
    allBtns.forEach(b => { if (parseInt(b.dataset.val) === answer) b.classList.add('correct'); });
  }

  setTimeout(nextPatternRound, 1000);
}

function generateChoices(answer, seq) {
  const set = new Set([answer]);
  const range = Math.max(10, Math.abs(answer));
  while (set.size < 4) {
    let wrong;
    const r = Math.random();
    if (r < 0.3) wrong = answer + rand(-5, 5);
    else if (r < 0.6) wrong = answer + rand(1, range);
    else wrong = answer - rand(1, range);
    if (wrong !== answer && !seq.includes(wrong)) set.add(wrong);
  }
  return shuffle([...set]);
}

/* ============================================================
   GAME 2: Math Galaxy
   ============================================================ */
let mathState = {};
let mathTimer = null;

function startMathGame() {
  mathState = { round: 0, score: 0, correct: 0, total: 10, totalTimeRemaining: 0 };
  const screen = $('#game-math');
  screen.classList.add('active');
  nextMathRound();
}

function nextMathRound() {
  if (mathState.round >= mathState.total) {
    clearInterval(mathTimer);
    $('#game-math').classList.remove('active');
    showResult('math', mathState.score, mathState.correct, mathState.total, {
      totalTimeRemaining: mathState.totalTimeRemaining
    });
    return;
  }

  mathState.round++;
  mathState.timeLeft = 15;

  $('#math-round').textContent = `${mathState.round}/${mathState.total}`;
  $('#math-score').textContent = mathState.score;

  // Generate problem based on difficulty
  const difficulty = Math.ceil(mathState.round / 4); // 1-3
  const problem = generateMathProblem(difficulty);
  mathState.currentAnswer = problem.answer;

  $('#math-problem').textContent = problem.text;
  $('#math-timer-fill').style.width = '100%';

  // Choices
  const choices = generateMathChoices(problem.answer);
  const choicesEl = $('#math-choices');
  choicesEl.innerHTML = choices.map(c =>
    `<button data-val="${c}">${c}</button>`
  ).join('');

  choicesEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => handleMathAnswer(btn));
  });

  // Timer
  clearInterval(mathTimer);
  const startTime = Date.now();
  mathTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    mathState.timeLeft = Math.max(0, 15 - elapsed);
    const pct = (mathState.timeLeft / 15) * 100;
    $('#math-timer-fill').style.width = pct + '%';

    if (mathState.timeLeft <= 0) {
      clearInterval(mathTimer);
      // Time's up — mark wrong
      const allBtns = $$('#math-choices button');
      allBtns.forEach(b => {
        b.style.pointerEvents = 'none';
        if (parseInt(b.dataset.val) === mathState.currentAnswer) b.classList.add('correct');
      });
      setTimeout(nextMathRound, 1000);
    }
  }, 50);
}

function handleMathAnswer(btn) {
  clearInterval(mathTimer);
  const val = parseInt(btn.dataset.val);
  const allBtns = $$('#math-choices button');
  allBtns.forEach(b => b.style.pointerEvents = 'none');

  if (val === mathState.currentAnswer) {
    btn.classList.add('correct');
    const timeBonus = Math.round(mathState.timeLeft);
    mathState.score += 10 + timeBonus;
    mathState.correct++;
    mathState.totalTimeRemaining += mathState.timeLeft;
  } else {
    btn.classList.add('wrong');
    allBtns.forEach(b => { if (parseInt(b.dataset.val) === mathState.currentAnswer) b.classList.add('correct'); });
  }

  setTimeout(nextMathRound, 1000);
}

function generateMathProblem(difficulty) {
  const ops = ['+', '−', '×'];
  const op = ops[rand(0, ops.length - 1)];
  let a, b, answer, text;

  switch (op) {
    case '+':
      a = rand(10 * difficulty, 50 * difficulty);
      b = rand(5 * difficulty, 30 * difficulty);
      answer = a + b;
      text = `${a} + ${b} = ?`;
      break;
    case '−':
      b = rand(5 * difficulty, 25 * difficulty);
      a = b + rand(5 * difficulty, 30 * difficulty); // ensure positive
      answer = a - b;
      text = `${a} − ${b} = ?`;
      break;
    case '×':
      a = rand(2, 6 + difficulty * 2);
      b = rand(2, 6 + difficulty * 2);
      answer = a * b;
      text = `${a} × ${b} = ?`;
      break;
  }
  return { text, answer };
}

function generateMathChoices(answer) {
  const set = new Set([answer]);
  while (set.size < 4) {
    const offset = rand(1, Math.max(5, Math.floor(Math.abs(answer) * 0.3)));
    const wrong = Math.random() < 0.5 ? answer + offset : answer - offset;
    if (wrong !== answer && wrong >= 0) set.add(wrong);
  }
  return shuffle([...set]);
}

/* ============================================================
   GAME 3: Word Scramble
   ============================================================ */
const WORD_BANK = [
  { word: 'PYTHON',     hint: 'Bahasa pemrograman populer 🐍' },
  { word: 'SCRATCH',    hint: 'Platform coding visual untuk anak' },
  { word: 'ROBOT',      hint: 'Mesin yang bisa diprogram' },
  { word: 'LOOP',       hint: 'Pengulangan dalam coding' },
  { word: 'DEBUG',      hint: 'Mencari dan memperbaiki error' },
  { word: 'ARRAY',      hint: 'Kumpulan data berurutan' },
  { word: 'PIXEL',      hint: 'Titik terkecil pada layar' },
  { word: 'BINARY',     hint: 'Sistem bilangan 0 dan 1' },
  { word: 'CODING',     hint: 'Menulis perintah untuk komputer' },
  { word: 'MOUSE',      hint: 'Alat input yang diklik' },
  { word: 'WIFI',       hint: 'Internet tanpa kabel' },
  { word: 'GAME',       hint: 'Permainan di komputer' },
  { word: 'CLOUD',      hint: 'Penyimpanan online ☁️' },
  { word: 'LOGIC',      hint: 'Dasar dari pemrograman' },
  { word: 'DRONE',      hint: 'Pesawat tanpa awak' },
  { word: 'SENSOR',     hint: 'Alat pendeteksi lingkungan' },
  { word: 'JAVA',       hint: 'Bahasa pemrograman ☕' },
  { word: 'INPUT',      hint: 'Data yang masuk ke program' },
  { word: 'OUTPUT',     hint: 'Hasil dari program' },
  { word: 'WEBSITE',    hint: 'Halaman di internet' },
  { word: 'SERVER',     hint: 'Komputer yang melayani permintaan' },
  { word: 'HACKER',     hint: 'Ahli keamanan komputer' },
  { word: 'MATRIX',     hint: 'Susunan data baris dan kolom' },
  { word: 'SPRINT',     hint: 'Periode kerja singkat dalam Agile' },
  { word: 'VECTOR',     hint: 'Besaran yang punya arah' },
  { word: 'FUNCTION',   hint: 'Blok kode yang bisa dipanggil' },
  { word: 'VARIABLE',   hint: 'Tempat menyimpan data dalam coding' },
  { word: 'ALGORITHM',  hint: 'Langkah-langkah menyelesaikan masalah' },
  { word: 'DATABASE',   hint: 'Tempat menyimpan banyak data' },
  { word: 'INTERNET',   hint: 'Jaringan komputer global 🌐' },
  { word: 'KEYBOARD',   hint: 'Alat mengetik pada komputer ⌨️' },
  { word: 'DOWNLOAD',   hint: 'Mengambil file dari internet' },
  { word: 'HARDWARE',   hint: 'Perangkat keras komputer' },
  { word: 'SOFTWARE',   hint: 'Program yang berjalan di komputer' },
  { word: 'FIREWALL',   hint: 'Pelindung jaringan komputer 🔥' }
];

let scrambleState = {};

function startScrambleGame() {
  // Pick 8 random words
  const words = shuffle([...WORD_BANK]).slice(0, 8);
  scrambleState = { words, round: 0, score: 0, correct: 0, total: 8 };
  const screen = $('#game-scramble');
  screen.classList.add('active');
  nextScrambleRound();
}

function nextScrambleRound() {
  if (scrambleState.round >= scrambleState.total) {
    $('#game-scramble').classList.remove('active');
    showResult('scramble', scrambleState.score, scrambleState.correct, scrambleState.total);
    return;
  }

  const wordObj = scrambleState.words[scrambleState.round];
  scrambleState.round++;
  scrambleState.startTime = Date.now();
  scrambleState.currentWord = wordObj.word;

  $('#scramble-round').textContent = `${scrambleState.round}/${scrambleState.total}`;
  $('#scramble-score').textContent = scrambleState.score;

  // Scramble word (ensure it's different from original)
  let scrambled = scrambleWord(wordObj.word);
  while (scrambled === wordObj.word && wordObj.word.length > 2) {
    scrambled = scrambleWord(wordObj.word);
  }

  $('#scramble-display').textContent = scrambled;
  $('#scramble-hint').textContent = `💡 Hint: ${wordObj.hint}`;
  $('#scramble-answer').value = '';
  $('#scramble-feedback').textContent = '';
  $('#scramble-feedback').className = 'scramble-feedback';
  $('#scramble-answer').focus();
}

function handleScrambleSubmit() {
  const input = $('#scramble-answer');
  const guess = input.value.trim().toUpperCase();

  if (!guess) { input.focus(); return; }

  const feedback = $('#scramble-feedback');

  if (guess === scrambleState.currentWord) {
    feedback.textContent = '✅ Benar!';
    feedback.className = 'scramble-feedback correct';
    const elapsed = (Date.now() - scrambleState.startTime) / 1000;
    const bonus = elapsed < 10 ? 5 : 0;
    scrambleState.score += 15 + bonus;
    scrambleState.correct++;
  } else {
    feedback.textContent = `❌ Salah! Jawaban: ${scrambleState.currentWord}`;
    feedback.className = 'scramble-feedback wrong';
  }

  setTimeout(nextScrambleRound, 1500);
}

function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/* ============================================================
   GAME 4: Cipher Quest (Substitution Cipher Decoder)
   ============================================================ */
const CIPHER_SYMBOLS = ['📧', '🌟', '🔮', '⚡', '🎯', '💎', '🔥', '🌙', '⭐', '🎪', '🏆', '🎭', '🎨', '🎬', '🎸', '🎹', '🎲', '🎁', '🎀', '🎈', '🎁', '🌈', '🌺', '🍀', '🌻', '🌼'];

const CIPHER_WORD_BANK = [
  { word: 'CODE',     hint: 'Menulis instruksi untuk komputer' },
  { word: 'HACK',     hint: 'Ahli keamanan IT' },
  { word: 'PIXEL',    hint: 'Titik kecil di layar' },
  { word: 'CRASH',    hint: 'Program berhenti tiba-tiba' },
  { word: 'SCRIPT',   hint: 'Kode yang menjalankan website' },
  { word: 'UPLOAD',   hint: 'Mengirim file ke server' },
  { word: 'BITCOIN',  hint: 'Mata uang digital populer' },
  { word: 'NETWORK',  hint: 'Jaringan komputer' },
  { word: 'BACKUP',   hint: 'Salinan cadangan data' },
  { word: 'SOCKET',   hint: 'Titik koneksi di jaringan' },
  { word: 'PAYLOAD',  hint: 'Data dalam paket jaringan' },
  { word: 'MALWARE',  hint: 'Perangkat lunak berbahaya' },
  { word: 'KEYLOG',   hint: 'Alat sadap ketikan' },
  { word: 'CRYPTEX',  hint: 'Tempat menyimpan pesan rahasia' },
  { word: 'DECODER',  hint: 'Alat untuk menerjemahkan kode' },
  { word: 'ENIGMA',   hint: 'Mesin cipher legendaris' },
  { word: 'CIPHER',   hint: 'Kode rahasia' },
  { word: 'DECRYPT',  hint: 'Membuka pesan terenkripsi' },
  { word: 'ENCRYPT',  hint: 'Menyembunyikan pesan' },
  { word: 'PASSWORD', hint: 'Kunci untuk masuk sistem' },
  { word: 'USERNAME', hint: 'Nama untuk login' },
  { word: 'SESSION',  hint: 'Waktu aktif menggunakan aplikasi' },
  { word: 'CACHE',    hint: 'Penyimpanan sementara browser' },
  { word: 'QUANTUM',  hint: 'Komputer masa depan' },
  { word: 'HOLOGRAM', hint: 'Gambar 3D di udara' },
  { word: 'FIREWALL', hint: 'Pelindung dari hacker' }
];

// Generate a random substitution cipher for a word
function generateCipher(word) {
  const symbols = shuffle([...CIPHER_SYMBOLS]);
  const cipher = {};
  const uniqueLetters = [...new Set(word.split(''))];

  for (let i = 0; i < uniqueLetters.length; i++) {
    cipher[uniqueLetters[i]] = symbols[i];
  }

  const encrypted = word.split('').map(letter => cipher[letter]).join('');
  return { cipher, encrypted };
}

let cipherState = {};

function startCipherGame() {
  // Pick 8 random words
  const words = shuffle([...CIPHER_WORD_BANK]).slice(0, 8);
  cipherState = { words, round: 0, score: 0, correct: 0, total: 8 };
  const screen = $('#game-cipher');
  screen.classList.add('active');
  nextCipherRound();
}

function nextCipherRound() {
  if (cipherState.round >= cipherState.total) {
    $('#game-cipher').classList.remove('active');
    showResult('cipher', cipherState.score, cipherState.correct, cipherState.total);
    return;
  }

  const wordObj = cipherState.words[cipherState.round];
  cipherState.round++;
  cipherState.startTime = Date.now();
  cipherState.currentWord = wordObj.word;

  // Generate cipher for this word
  const { cipher, encrypted } = generateCipher(wordObj.word);
  cipherState.currentCipher = cipher;

  $('#cipher-round').textContent = `${cipherState.round}/${cipherState.total}`;
  $('#cipher-score').textContent = cipherState.score;
  $('#cipher-display').textContent = encrypted;
  $('#cipher-hint').textContent = `💡 Hint: ${wordObj.hint}`;

  // Show cipher key (letter -> symbol mapping)
  const keyEl = $('#cipher-key');
  keyEl.innerHTML = Object.entries(cipher).map(([letter, symbol]) =>
    `<span class="cipher-key-item"><span class="symbol">${symbol}</span> = ${letter}</span>`
  ).join('');

  $('#cipher-answer').value = '';
  $('#cipher-feedback').textContent = '';
  $('#cipher-feedback').className = 'cipher-feedback';
  $('#cipher-answer').focus();
}

function handleCipherSubmit() {
  const input = $('#cipher-answer');
  const guess = input.value.trim().toUpperCase();

  if (!guess) { input.focus(); return; }

  const feedback = $('#cipher-feedback');

  if (guess === cipherState.currentWord) {
    feedback.textContent = '✅ Benar! Kamu jago dekripsi!';
    feedback.className = 'cipher-feedback correct';
    const elapsed = (Date.now() - cipherState.startTime) / 1000;
    const bonus = elapsed < 10 ? 5 : (elapsed < 20 ? 2 : 0);
    cipherState.score += 20 + bonus;
    cipherState.correct++;
  } else {
    feedback.textContent = `❌ Salah! Jawaban: ${cipherState.currentWord}`;
    feedback.className = 'cipher-feedback wrong';
  }

  setTimeout(nextCipherRound, 1800);
}

/* ============================================================
   GAME 5: Arrow Catch (arrow direction matching, ages 2-6)
   ============================================================ */
const ARROW_DIRS = ['⬆️', '⬇️', '⬅️', '➡️'];
const ARROW_KEYS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

let arrowsState = {};

function startArrowsGame() {
  arrowsState = { round: 0, score: 0, correct: 0, total: 10, startTime: 0, ready: true };
  const screen = $('#game-arrows');
  screen.classList.add('active');
  nextArrowsRound();
}

function nextArrowsRound() {
  if (arrowsState.round >= arrowsState.total) {
    $('#game-arrows').classList.remove('active');
    showResult('arrows', arrowsState.score, arrowsState.correct, arrowsState.total);
    return;
  }

  arrowsState.round++;
  arrowsState.ready = true;
  arrowsState.startTime = Date.now();

  $('#arrows-round').textContent = `${arrowsState.round}/${arrowsState.total}`;
  $('#arrows-score').textContent = arrowsState.score;

  // Pick a random direction
  const idx = rand(0, ARROW_DIRS.length - 1);
  arrowsState.currentAnswer = idx;

  $('#arrows-display').textContent = ARROW_DIRS[idx];
  $('#arrows-display').className = 'arrows-display';
  // Add entrance animation
  setTimeout(() => $('#arrows-display').classList.add('show'), 10);

  // Highlight the correct button hint (optional — just show arrows as buttons)
  const btns = $$('#arrows-choices button');
  btns.forEach((btn, i) => {
    btn.className = '';
    btn.style.pointerEvents = 'auto';
  });
}

function handleArrowsAnswer(idx) {
  if (!arrowsState.ready) return;
  arrowsState.ready = false;

  const btns = $$('#arrows-choices button');
  btns.forEach(b => b.style.pointerEvents = 'none');

  if (idx === arrowsState.currentAnswer) {
    btns[idx].classList.add('correct');
    const elapsed = (Date.now() - arrowsState.startTime) / 1000;
    const bonus = elapsed < 2 ? 5 : 0;
    arrowsState.score += 10 + bonus;
    arrowsState.correct++;
    // Happy feedback
    const feedbacks = ['🎉', '⭐', '✨', '👏', '🌟', '💫'];
    $('#arrows-feedback').textContent = feedbacks[rand(0, feedbacks.length - 1)];
    $('#arrows-feedback').className = 'arrows-feedback show';
  } else {
    btns[idx].classList.add('wrong');
    btns[arrowsState.currentAnswer].classList.add('correct');
    $('#arrows-feedback').textContent = '😊';
    $('#arrows-feedback').className = 'arrows-feedback show';
    // Shake the display
    $('#arrows-display').classList.add('shake');
  }

  setTimeout(() => {
    $('#arrows-feedback').className = 'arrows-feedback';
    $('#arrows-display').className = 'arrows-display';
    nextArrowsRound();
  }, 1200);
}

/* ============================================================
   GAME 6: Color Splash (color recognition, ages 2-6)
   ============================================================ */
const COLORS_PALETTE = [
  { name: 'Merah',   hex: '#ef4444', emoji: '🔴' },
  { name: 'Biru',    hex: '#3b82f6', emoji: '🔵' },
  { name: 'Kuning',  hex: '#eab308', emoji: '🟡' },
  { name: 'Hijau',   hex: '#22c55e', emoji: '🟢' },
  { name: 'Ungu',    hex: '#a855f7', emoji: '🟣' },
  { name: 'Oranye',  hex: '#f97316', emoji: '🟠' },
  { name: 'Pink',    hex: '#ec4899', emoji: '💗' },
  { name: 'Putih',   hex: '#f8fafc', emoji: '⚪' }
];

let colorsState = {};

function startColorsGame() {
  colorsState = { round: 0, score: 0, correct: 0, total: 8, startTime: 0, ready: true };
  const screen = $('#game-colors');
  screen.classList.add('active');
  nextColorsRound();
}

function nextColorsRound() {
  if (colorsState.round >= colorsState.total) {
    $('#game-colors').classList.remove('active');
    showResult('colors', colorsState.score, colorsState.correct, colorsState.total);
    return;
  }

  colorsState.round++;
  colorsState.ready = true;
  colorsState.startTime = Date.now();
  $('#colors-round').textContent = `${colorsState.round}/${colorsState.total}`;
  $('#colors-score').textContent = colorsState.score;

  // Pick a random target color
  const targetIdx = rand(0, COLORS_PALETTE.length - 1);
  colorsState.currentAnswer = targetIdx;

  // Show the splash
  const splash = $('#colors-splash');
  splash.style.backgroundColor = COLORS_PALETTE[targetIdx].hex;
  splash.textContent = COLORS_PALETTE[targetIdx].emoji;
  splash.className = 'colors-splash pop-in';

  // Generate 3-4 choices including the correct one
  const choiceCount = 3;
  const indices = [targetIdx];
  while (indices.length < choiceCount) {
    const r = rand(0, COLORS_PALETTE.length - 1);
    if (!indices.includes(r)) indices.push(r);
  }
  const shuffled = shuffle(indices);

  const container = $('#colors-choices');
  container.innerHTML = '';
  shuffled.forEach(i => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.dataset.idx = i;
    btn.style.backgroundColor = COLORS_PALETTE[i].hex;
    btn.textContent = COLORS_PALETTE[i].emoji;
    btn.addEventListener('click', () => handleColorsAnswer(i));
    container.appendChild(btn);
  });
}

function handleColorsAnswer(idx) {
  if (!colorsState.ready) return;
  colorsState.ready = false;

  const btns = $$('#colors-choices .color-btn');
  btns.forEach(b => b.style.pointerEvents = 'none');

  if (idx === colorsState.currentAnswer) {
    btns.forEach(b => {
      if (parseInt(b.dataset.idx) === idx) b.classList.add('correct');
    });
    const elapsed = (Date.now() - colorsState.startTime) / 1000;
    colorsState.score += 10 + Math.max(0, 5 - Math.floor(elapsed));
    colorsState.correct++;
    $('#colors-feedback').textContent = '🎉 Yay!';
    $('#colors-feedback').className = 'colors-feedback show';
    $('#colors-splash').classList.add('celebrate');
  } else {
    btns.forEach(b => {
      if (parseInt(b.dataset.idx) === idx) b.classList.add('wrong');
      if (parseInt(b.dataset.idx) === colorsState.currentAnswer) b.classList.add('correct');
    });
    $('#colors-feedback').textContent = '😊 Coba lagi!';
    $('#colors-feedback').className = 'colors-feedback show';
  }

  setTimeout(() => {
    $('#colors-feedback').className = 'colors-feedback';
    $('#colors-splash').className = 'colors-splash';
    nextColorsRound();
  }, 1500);
}

/* ============================================================
   Achievements UI
   ============================================================ */
function renderAchievements() {
  const data = loadData();
  const grid = $('#achievements-grid');
  grid.innerHTML = Object.entries(ACHIEVEMENT_META).map(([id, meta]) => {
    const unlocked = data.achievements[id]?.unlocked;
    return `
      <div class="achievement-card ${unlocked ? 'unlocked' : ''}">
        <span class="ach-icon">${meta.icon}</span>
        <div class="ach-info">
          <h4>${meta.name}</h4>
          <p>${meta.desc}${unlocked ? ' ✅' : ''}</p>
        </div>
      </div>`;
  }).join('');
}

/* ============================================================
   Leaderboard UI
   ============================================================ */
let currentLeaderboard = 'pattern';

function renderLeaderboard(gameKey) {
  currentLeaderboard = gameKey;
  const data = loadData();
  const scores = (data.scores[gameKey] || []).slice(0, 10);

  // Update active tab
  $$('.leaderboard-tabs button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.game === gameKey);
  });

  const tbody = $('#leaderboard-body');
  if (scores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="leaderboard-empty">Belum ada skor. Ayo main! 🎮</td></tr>`;
    return;
  }

  tbody.innerHTML = scores.map((s, i) => `
    <tr class="${i < 3 ? 'rank-' + (i + 1) : ''}">
      <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${s.score}</td>
      <td>${s.date}</td>
    </tr>
  `).join('');
}

/* ============================================================
   Helpers
   ============================================================ */
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPlayerName();
  updateBestScores();
  renderAchievements();
  renderLeaderboard('arrows');

  // Game card clicks
  $$('.game-card').forEach(card => {
    card.addEventListener('click', () => startGame(card.dataset.game));
  });

  // Back buttons
  $$('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(mathTimer);
      $$('.game-screen').forEach(s => s.classList.remove('active'));
      showHub();
    });
  });

  // Scramble submit
  $('#btn-scramble-submit').addEventListener('click', handleScrambleSubmit);
  $('#scramble-answer').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleScrambleSubmit();
  });

  // Cipher submit
  $('#btn-cipher-submit').addEventListener('click', handleCipherSubmit);
  $('#cipher-answer').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCipherSubmit();
  });

  // Leaderboard tabs
  $$('.leaderboard-tabs button').forEach(btn => {
    btn.addEventListener('click', () => renderLeaderboard(btn.dataset.game));
  });
});
