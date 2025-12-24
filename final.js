// Final: scratch de nieve para revelar mensaje (mejorado)

const scratchCanvas = document.getElementById('scratchCanvas');
const scratchHint = document.getElementById('scratchHint');
const restartBtn = document.getElementById('restartBtn');
const finalMsg = document.getElementById('finalMsg');

let ctx;
let drawing = false;
let revealed = false;

let lastCheck = 0;
let clearedPct = 0;

function setupSnow(){
  if(!scratchCanvas) return;

  ctx = scratchCanvas.getContext('2d');
  revealed = false;
  drawing = false;
  clearedPct = 0;
  lastCheck = 0;

  // ocultar texto al reiniciar
  if(finalMsg) finalMsg.classList.remove('show');

  // capa nieve clara (no tan oscura)
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0,0,scratchCanvas.width, scratchCanvas.height);
  ctx.fillStyle = 'rgba(245, 248, 255, 0.98)';
  ctx.fillRect(0,0,scratchCanvas.width, scratchCanvas.height);

  // textura suave (menos puntos y mas claros)
  for(let i=0;i<320;i++){
    ctx.fillStyle = `rgba(255,255,255,${0.10 + Math.random()*0.18})`;
    ctx.beginPath();
    ctx.arc(
      Math.random()*scratchCanvas.width,
      Math.random()*scratchCanvas.height,
      0.8 + Math.random()*1.4,
      0,
      Math.PI*2
    );
    ctx.fill();
  }

  // a partir de aqui borramos
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if(scratchHint) scratchHint.textContent = 'Arrastra para raspar la nieve.';
}

function getPos(e){
  const rect = scratchCanvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const x = (clientX - rect.left) * (scratchCanvas.width / rect.width);
  const y = (clientY - rect.top) * (scratchCanvas.height / rect.height);
  return {x, y};
}

let lastX = null;
let lastY = null;

function scratchAt(x,y){
  if(revealed) return;

  // pincel mas grande para celular
  const r = 24;

  // borra con circulo
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fill();

  // borra tambien con linea para no dejar "huecos"
  if(lastX !== null){
    ctx.lineWidth = r * 2;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  lastX = x;
  lastY = y;

  // medir cada 120ms aprox (estable y liviano)
  const now = performance.now();
  if(now - lastCheck > 120){
    lastCheck = now;
    checkCleared();
  }
}

function checkCleared(){
  const img = ctx.getImageData(0,0,scratchCanvas.width, scratchCanvas.height);
  let transparent = 0;

  // muestreo: mas preciso pero aun ligero
  for(let i=3;i<img.data.length;i+=32){
    if(img.data[i] === 0) transparent++;
  }

  const total = img.data.length / 32;
  clearedPct = transparent / total;

  // feedback de progreso
  if(scratchHint){
    if(clearedPct < 0.20) scratchHint.textContent = 'Sigue raspando...';
    else if(clearedPct < 0.35) scratchHint.textContent = 'Vas bien...';
    else scratchHint.textContent = 'Casi listo... un poco mas';
  }

  // revela antes (mas amable)
  if(clearedPct > 0.85){
    revealMessage();
  }
}

function revealMessage(){
  revealed = true;

  // limpia todo para que quede bonito
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0,0,scratchCanvas.width, scratchCanvas.height);

  if(finalMsg) finalMsg.classList.add('show');
  if(scratchHint) scratchHint.textContent = 'Listo! Mensaje revelado.';
}

function onDown(e){
  if(!scratchCanvas || revealed) return;
  drawing = true;
  const {x,y} = getPos(e);
  lastX = x; lastY = y;
  scratchAt(x,y);
}

function onMove(e){
  if(!drawing || revealed) return;
  const {x,y} = getPos(e);
  scratchAt(x,y);
}

function onUp(){
  drawing = false;
  lastX = null;
  lastY = null;
}

if(scratchCanvas){
  scratchCanvas.style.touchAction = 'none';

  scratchCanvas.addEventListener('pointerdown', onDown);
  scratchCanvas.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  // soporte touch extra
  scratchCanvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); onDown(e); }, {passive:false});
  scratchCanvas.addEventListener('touchmove', (e)=>{ e.preventDefault(); onMove(e); }, {passive:false});
  scratchCanvas.addEventListener('touchend', onUp);
}

if(restartBtn){
  restartBtn.addEventListener('click', ()=> location.reload());
}

// aqui hice esto: cada vez que se muestre el final, reinicio la nieve
document.addEventListener('screenchange', (e)=>{
  if(e.detail === 'final') setupSnow();
});
