// Intro cutscene - comentarios en espanol sin acentos

document.addEventListener('DOMContentLoaded', () => {

  const startBtn = document.getElementById('startBtn');
  const windHero = document.getElementById('windHero');
  const turbRand = document.getElementById('turbRand');
  const loaderFill = document.getElementById('loaderFill');
  const chipTxt = document.getElementById('chipTxt');
  const boot = document.getElementById('boot');
  const turbineHero = document.getElementById('turbineHero');

  function pad(n){ return String(n).padStart(2,'0'); }

  function setTelemetry(){
    if(!windHero || !turbRand) return;

    const w = (6 + Math.random()*10).toFixed(1);
    windHero.textContent = `${w} m/s`;
    turbRand.textContent = pad(1 + Math.floor(Math.random()*12));
  }

  setTelemetry();
  setInterval(setTelemetry, 2500);

  // animacion tipo boot
  if(boot){
    setTimeout(() => boot.classList.add('ready'), 200);
  }

  // loading
  let p = 0;
  const loading = setInterval(() => {
    if(!loaderFill || !chipTxt || !startBtn) return;

    p = Math.min(100, p + 9 + Math.random()*10);
    loaderFill.style.width = p + '%';

    if(p >= 35) chipTxt.textContent = 'Validando operador';
    if(p >= 70) chipTxt.textContent = 'Asignando unidad';
    if(p >= 100){
      chipTxt.textContent = 'Listo para iniciar';
      startBtn.disabled = false;
      clearInterval(loading);
    }
  }, 380);

  // iniciar juego
  if(startBtn){
    startBtn.addEventListener('click', () => {
      if(turbineHero){
        turbineHero.classList.remove('spin-slow');
        turbineHero.classList.add('spin-fast');
      }

      setTimeout(() => {
        if(turbineHero){
          turbineHero.classList.remove('spin-fast');
          turbineHero.classList.add('spin-slow');
        }
        // Pasamos al juego real
        showScreen(1);
      }, 520);
    });
  }

});
