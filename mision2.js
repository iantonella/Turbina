// Mision 2: Balance "pro" (viento + rafagas + zona segura dinamica)

const feedback2 = document.getElementById('feedback2');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const holdLeftEl = document.getElementById('holdLeft');
const nextFromM2 = document.getElementById('nextFromM2');
const balanceFill = document.getElementById('balanceFill');

let drift = 0;              // -1 a 1 (posicion)
let holdLeft = 3.0;         // tiempo a aguantar dentro de zona segura
let pressing = 0;           // -1 / 0 / 1

let last2 = performance.now();

// nuevas variables "complejas"
let safeZone = 0.18;        // ancho zona segura (se achica)
let outTime = 0;            // tiempo acumulado fuera de zona
let wind = 0;               // empuje continuo
let gust = 0;               // rafaga temporal
let gustLeft = 0;           // duracion rafaga
let windT = 0;              // para variar viento suave

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

// aqui hice esto: UI mas rica (zona segura cambia color segun precision)
function updateBalanceUI(){
  const pct = (drift + 1) * 50;
  balanceFill.style.width = `${pct}%`;

  const inSafe = Math.abs(drift) < safeZone;
  const veryCenter = Math.abs(drift) < safeZone * 0.45;

  balanceFill.style.background = veryCenter
    ? 'linear-gradient(90deg, rgba(47,229,143,.25), rgba(47,229,143,.55))'
    : inSafe
      ? 'linear-gradient(90deg, rgba(65,209,255,.20), rgba(65,209,255,.38))'
      : 'linear-gradient(90deg, rgba(255,115,115,.18), rgba(255,115,115,.35))';
}

// aqui hice esto: genero viento suave que cambia con el tiempo
function updateWind(dt){
  windT += dt;

  // viento suave: cambia lento
  wind += (Math.random() - 0.5) * 0.12 * dt;
  wind = clamp(wind, -0.28, 0.28);

  // rafagas: aparecen cada cierto rato
  if(gustLeft <= 0 && Math.random() < 0.035){
    gustLeft = 0.35 + Math.random() * 0.45;   // 0.35s a 0.8s
    gust = (Math.random() < 0.5 ? -1 : 1) * (0.55 + Math.random() * 0.55);
  }

  if(gustLeft > 0){
    gustLeft -= dt;
    if(gustLeft <= 0) gust = 0;
  }
}

// aqui hice esto: loop con dificultad progresiva
function loopM2(now){
  if(Game.mission !== 2 || !Game.running) return;

  const dt = Math.min(0.05, (now - last2) / 1000);
  last2 = now;

  // dificultad progresa: zona segura se achica de a poco
  safeZone = clamp(0.20 - (Game.goals.m2 - holdLeft) * 0.010, 0.09, 0.20);

  updateWind(dt);

  // fisica: ruido + viento + rafaga + control del jugador
  const noise = (Math.random() - 0.5) * 0.10;           // ruido base
  const playerForce = pressing * 0.85;                  // control del jugador
  const envForce = wind + gust;                         // ambiente

  drift += (noise + playerForce + envForce) * dt;
  drift = clamp(drift, -1, 1);

  const inSafe = Math.abs(drift) < safeZone;

  if(inSafe){
    holdLeft -= dt;
    outTime = Math.max(0, outTime - dt * 1.2); // recupera si vuelve al centro
    setAvatar('success');
    feedback2.textContent = 'Mantener estable...';
    feedback2.className = 'msg';
  }else{
    setAvatar('');
    outTime += dt;

    // mensaje segun que tan lejos estas
    feedback2.textContent = Math.abs(drift) > 0.75 ? '⚠️ Muy cargado, corrige ya.' : 'Te estas saliendo...';
    feedback2.className = 'msg bad';
  }

  // fallo si estas demasiado fuera mucho rato, o si te vas al borde extremo
  if(outTime > 0.90 || Math.abs(drift) > 0.96){
    Game.tries++;
    UI.triesEl.textContent = Game.tries;
    setAvatar('fail');

    feedback2.textContent = '❌ Se descontrolo. Respira y corrige suave.';
    feedback2.className = 'msg bad';

    // reset parcial "justo": baja drift y limpia rafaga
    drift *= 0.25;
    gust = 0; gustLeft = 0;
    outTime = 0;
  }

  holdLeftEl.textContent = Math.max(0, holdLeft).toFixed(1);
  updateBalanceUI();

  if(holdLeft <= 0){
    Game.running = false;
    feedback2.textContent = '✅ Palas estables.';
    feedback2.className = 'msg ok';
    nextFromM2.classList.remove('hidden');
  }

  requestAnimationFrame(loopM2);
}

function startM2(){
  drift = 0;
  holdLeft = Game.goals.m2;
  pressing = 0;

  safeZone = 0.18;
  outTime = 0;
  wind = 0;
  gust = 0;
  gustLeft = 0;
  windT = 0;

  nextFromM2.classList.add('hidden');
  feedback2.textContent = 'Equilibra con botones. Ojo con viento y rafagas.';
  feedback2.className = 'msg';
  holdLeftEl.textContent = holdLeft.toFixed(1);
  updateBalanceUI();

  last2 = performance.now();
  requestAnimationFrame(loopM2);
}

// aqui hice esto: pointer seguro (si suelta o se va el dedo, se corta)
leftBtn.addEventListener('pointerdown', ()=> pressing = -1);
leftBtn.addEventListener('pointerup', ()=> pressing = 0);
leftBtn.addEventListener('pointercancel', ()=> pressing = 0);
leftBtn.addEventListener('pointerleave', ()=> pressing = 0);

rightBtn.addEventListener('pointerdown', ()=> pressing = 1);
rightBtn.addEventListener('pointerup', ()=> pressing = 0);
rightBtn.addEventListener('pointercancel', ()=> pressing = 0);
rightBtn.addEventListener('pointerleave', ()=> pressing = 0);

// aqui hice esto: soporte teclado (PC). No molesta en movil.
function onKeyDownM2(e){
  if(Game.mission !== 2 || !Game.running) return;
  if(e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') pressing = -1;
  if(e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') pressing = 1;
}
function onKeyUpM2(e){
  if(Game.mission !== 2 || !Game.running) return;
  if(['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key)) pressing = 0;
}
window.addEventListener('keydown', onKeyDownM2);
window.addEventListener('keyup', onKeyUpM2);

nextFromM2.addEventListener('click', ()=> showScreen(3));

// aqui hice esto: escucho cambio de pantalla (NO piso showScreen)
document.addEventListener('screenchange', (e)=>{
  if(e.detail === 2) startM2();
});
