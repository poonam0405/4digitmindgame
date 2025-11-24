(() => {
  const startBtn = document.getElementById('startBtn');
  const newBtn = document.getElementById('newBtn');
  const submitBtn = document.getElementById('submitBtn');
  const guessInput = document.getElementById('guessInput');
  const guessCountEl = document.getElementById('guessCount');
  const winsCountEl = document.getElementById('winsCount');
  const lastPresent = document.getElementById('lastPresent');
  const lastCorrect = document.getElementById('lastCorrect');
  const historyTbody = document.querySelector('#historyTable tbody');
  const revealBtn = document.getElementById('revealBtn');

  let secret = null; // string of 4 digits
  let guesses = 0;
  const WINS_KEY = 'four_digit_game_wins_v1';

  function loadWins(){
    const w = parseInt(localStorage.getItem(WINS_KEY)||'0',10);
    winsCountEl.textContent = w;
  }

  function saveWin(){
    const now = parseInt(localStorage.getItem(WINS_KEY)||'0',10) + 1;
    localStorage.setItem(WINS_KEY, String(now));
    winsCountEl.textContent = now;
  }

  function makeSecret(){
    // shuffle digits 0-9 and take first 4
    const digits = '0123456789'.split('');
    for(let i=digits.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [digits[i],digits[j]] = [digits[j],digits[i]];
    }
    return digits.slice(0,4).join('');
  }

  function startGame(){
    secret = makeSecret();
    guesses = 0;
    guessCountEl.textContent = guesses;
    lastPresent.textContent = '-';
    lastCorrect.textContent = '-';
    historyTbody.innerHTML = '';
    guessInput.value = '';
    guessInput.disabled = false;
    submitBtn.disabled = false;
    revealBtn.textContent = 'Reveal';
    startBtn.textContent = 'Restart Game';
    guessInput.focus();
    console.log('Secret (debug):', secret);
  }

  function validateGuess(g){
    if(!/^[0-9]{4}$/.test(g)) return 'Enter exactly 4 digits (0-9)';
    // check repeats
    const set = new Set(g.split(''));
    if(set.size !== 4) return 'Digits must not repeat';
    return null;
  }

  function scoreGuess(guess){
    // present: count of digits from guess that appear anywhere in secret
    // correct: count of digits in the correct position
    let present = 0; let correct = 0;
    const secretArr = secret.split('');
    const guessArr = guess.split('');
    // correct
    for(let i=0;i<4;i++) if(guessArr[i] === secretArr[i]) correct++;
    // present
    const sset = new Set(secretArr);
    for(const d of guessArr) if(sset.has(d)) present++;
    return {present,correct};
  }

  function addHistoryRow(n,guess,present,correct){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${n}</td><td>${guess}</td><td>${present}</td><td>${correct}</td>`;
    historyTbody.prepend(tr);
  }

  startBtn.addEventListener('click', startGame);
  newBtn.addEventListener('click', ()=>{
    if(confirm('Generate a new secret? This will reset the current round.')) startGame();
  });

  submitBtn.addEventListener('click', ()=>{
    const g = guessInput.value.trim();
    const err = validateGuess(g);
    if(err){ alert(err); guessInput.focus(); return; }
    guesses++;
    guessCountEl.textContent = guesses;
    const {present,correct} = scoreGuess(g);
    lastPresent.textContent = present;
    lastCorrect.textContent = correct;
    addHistoryRow(guesses,g,present,correct);
    if(correct === 4){
      alert(`You found it! The secret was ${secret}. Guesses: ${guesses}`);
      saveWin();
      // disable inputs
      guessInput.disabled = true;
      submitBtn.disabled = true;
      revealBtn.textContent = 'Show Secret';
    } else {
      guessInput.select();
    }
  });

  guessInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') submitBtn.click();
  });

  revealBtn.addEventListener('click', ()=>{
    if(!secret){ alert('Start a game first'); return; }
    if(revealBtn.textContent === 'Reveal'){
      if(confirm('Reveal the secret and end the round?')){
        alert('Secret: '+secret);
        guessInput.disabled = true; submitBtn.disabled = true; revealBtn.textContent='Show Secret';
      }
    } else {
      alert('Secret: '+secret);
    }
  });

  // init
  loadWins();
})();