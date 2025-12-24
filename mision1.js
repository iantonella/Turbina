// Mision 1: Activar turbina (timing)

const needle = document.getElementById('needle');
const feedback = document.getElementById('feedback');
const btn = document.getElementById('actionBtn');

window.resetM1Time = function(){
  last = performance.now();
};

let pos = 0;
let dir = 1;
let last = performance.now();

const SPEED = 0.9;
const GREEN_START = 0.60;
const GREEN_END = 0.76;

function inGreen(){
  return pos >= GREEN_START && pos <= GREEN_END;
}

function loopM1(now){
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if(Game.mission === 1 && Game.running){
    pos += dir * SPEED * dt;

    if(pos >= 1){ pos = 1; dir = -1; }
    if(pos <= 0){ pos = 0; dir = 1; }

    if(needle){
      needle.style.left = `calc(${(pos*100).toFixed(1)}% - 5px)`;
    }
  }

  requestAnimationFrame(loopM1);
}
requestAnimationFrame(loopM1);

function tapM1(){
  if(Game.mission !== 1 || !Game.running) return;

  Game.tries++;
  UI.triesEl.textContent = Game.tries;

  if(inGreen()){
    Game.hits++;
    UI.hitsEl.textContent = Game.hits;
    feedback.textContent = '✅ Sincronizacion perfecta.';
    feedback.className = 'msg ok';
    setAvatar('success');
  }else{
    feedback.textContent = '❌ Fuera de zona.';
    feedback.className = 'msg bad';
    setAvatar('fail');
  }

  setTimeout(()=>setAvatar(''), 240);

  if(Game.hits >= Game.goals.m1){
    Game.running = false;
    btn.disabled = true;
    btn.textContent = 'Mision completada ✅';
    feedback.textContent = '🌬️ Turbina activa. Pasando a Mision 2...';
    feedback.className = 'msg ok';

    setTimeout(()=>{
      Game.hits = 0;
      UI.hitsEl.textContent = '0';

      btn.disabled = false;
      btn.textContent = 'Sincronizar';

      pos = 0;
      dir = 1;
      if(needle) needle.style.left = 'calc(0% - 5px)';

      showScreen(2);
    }, 900);
  }
}

if(btn){
  btn.addEventListener('click', tapM1);
}
