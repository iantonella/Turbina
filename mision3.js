// Mision 3: Arrancar turbina (seguir objetivo movil)

const feedback3 = document.getElementById('feedback3');

const startTrack = document.getElementById('startTrack');
const startTarget = document.getElementById('startTarget');
const startCursor = document.getElementById('startCursor');

const stabilityLeftEl = document.getElementById('stabilityLeft');
const rpmTxt = document.getElementById('rpmTxt');

const m3Left = document.getElementById('m3Left');
const m3Right = document.getElementById('m3Right');

let last3 = performance.now();
let pressing3 = 0;

// posiciones normalizadas 0..1
let targetX = 0.5;
let cursorX = 0.5;

// movimiento objetivo
let targetV = 0.22;  // velocidad base
let targetDir = 1;

// progreso
let stabilityLeft = 4.0; // segundos siguiendo bien
let rpm = 0;

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

function setPos(el, x01){
  el.style.left = `${x01 * 100}%`;
}

// aqui hice esto: loop con objetivo que rebota y a ratos acelera
function loopM3(now){
  if(Game.mission !== 3 || !Game.running) return;

  const dt = Math.min(0.05, (now - last3) / 1000);
  last3 = now;

  // target: rebota
  // rafagas: a veces acelera un poco
  const gust = (Math.random() < 0.03) ? (0.20 + Math.random()*0.25) : 0;
  const speed = targetV + gust;

  targetX += targetDir * speed * dt;
  if(targetX <= 0.04){ targetX = 0.04; targetDir = 1; }
  if(targetX >= 0.96){ targetX = 0.96; targetDir = -1; }

  // cursor: control jugador (suave)
  cursorX += pressing3 * 0.55 * dt;
  cursorX = clamp(cursorX, 0.02, 0.98);

  // evaluar distancia
  const dist = Math.abs(targetX - cursorX);

  // “zona de seguimiento” (mientras mas chico, mas dificil)
  const lockZone = 0.07;

  if(dist <= lockZone){
    stabilityLeft -= dt;
    rpm = clamp(rpm + dt * 28, 0, 100);
    startTrack.parentElement?.classList?.add?.('start-ok');
    startTrack.parentElement?.classList?.remove?.('start-bad');
    setAvatar('success');
    feedback3.textContent = '✅ Sincronizado. Mantente encima...';
    feedback3.className = 'msg ok';
  }else{
    rpm = clamp(rpm - dt * 18, 0, 100);
    startTrack.parentElement?.classList?.add?.('start-bad');
    startTrack.parentElement?.classList?.remove?.('start-ok');
    setAvatar('');
    feedback3.textContent = 'Ajusta: sigue el punto azul con el verde.';
    feedback3.className = 'msg';
  }

  // pintar UI
  setPos(startTarget, targetX);
  setPos(startCursor, cursorX);

  stabilityLeftEl.textContent = Math.max(0, stabilityLeft).toFixed(1);
  rpmTxt.textContent = Math.round(rpm);

  // win
  if(stabilityLeft <= 0){
    Game.running = false;
    feedback3.textContent = '✅ Turbina arrancada. Turno cerrado.';
    feedback3.className = 'msg ok';
    setTimeout(finishGame, 650);
    return;
  }

  requestAnimationFrame(loopM3);
}

function startM3(){
  pressing3 = 0;
  targetX = 0.5;
  cursorX = 0.5;
  targetV = 0.22;
  targetDir = Math.random() < 0.5 ? -1 : 1;

  stabilityLeft = 4.0; // puedes usar Game.goals.m3 si quieres
  rpm = 0;

  feedback3.textContent = '1) Sigue el punto 2) Mantente encima hasta completar.';
  feedback3.className = 'msg';

  last3 = performance.now();
  requestAnimationFrame(loopM3);
}

// controles touch
m3Left.addEventListener('pointerdown', ()=> pressing3 = -1);
m3Left.addEventListener('pointerup', ()=> pressing3 = 0);
m3Left.addEventListener('pointerleave', ()=> pressing3 = 0);
m3Left.addEventListener('pointercancel', ()=> pressing3 = 0);

m3Right.addEventListener('pointerdown', ()=> pressing3 = 1);
m3Right.addEventListener('pointerup', ()=> pressing3 = 0);
m3Right.addEventListener('pointerleave', ()=> pressing3 = 0);
m3Right.addEventListener('pointercancel', ()=> pressing3 = 0);

// teclado PC
window.addEventListener('keydown', (e)=>{
  if(Game.mission !== 3 || !Game.running) return;
  if(e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') pressing3 = -1;
  if(e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') pressing3 = 1;
});
window.addEventListener('keyup', (e)=>{
  if(Game.mission !== 3 || !Game.running) return;
  if(['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key)) pressing3 = 0;
});

// aqui hice esto: escucho cambio de pantalla
document.addEventListener('screenchange', (e)=>{
  if(e.detail === 3) startM3();
});
