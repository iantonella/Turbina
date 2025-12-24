// Comentarios en espanol sin acentos

window.Game = {
  mission: 0,
  hits: 0,
  tries: 0,
  running: true,
  goals: { m1: 3, m2: 3.0, m3: 100 }
};

window.UI = {
  screens: {
    intro: document.getElementById('screen-intro'),
    m1: document.getElementById('screen-m1'),
    m2: document.getElementById('screen-m2'),
    m3: document.getElementById('screen-m3'),
    final: document.getElementById('screen-final') // 👈 correcto
  },
  gameUI: document.getElementById('game-ui'),
  missionText: document.getElementById('missionText'),
  missionTag: document.getElementById('missionTag'),
  hitsEl: document.getElementById('hits'),
  triesEl: document.getElementById('tries'),
  hitsGoalEl: document.getElementById('hitsGoal'),
  avatar: document.getElementById('avatar')
};

window.setAvatar = function(state){
  UI.avatar.className = 'avatar' + (state ? ` ${state}` : '');
};

// aqui hice esto: mostrar solo pantallas de misiones
function showMissionScreens(n){
  UI.screens.m1.classList.toggle('hidden', n !== 1);
  UI.screens.m2.classList.toggle('hidden', n !== 2);
  UI.screens.m3.classList.toggle('hidden', n !== 3);
}

window.showScreen = function(n){
  // n puede ser 0,1,2,3 o 'final'
  Game.mission = n;
  Game.running = (n !== 'final');

  /* ===================== */
  /* INTRO */
  /* ===================== */
  UI.screens.intro.classList.toggle('hidden', n !== 0);

  /* ===================== */
  /* GAME UI (solo misiones) */
  /* ===================== */
  UI.gameUI.classList.toggle('hidden', n === 0 || n === 'final');

  /* ===================== */
  /* FINAL (pantalla aparte) */
  /* ===================== */
  UI.screens.final.classList.toggle('hidden', n !== 'final');

  /* ===================== */
  /* MISIONES */
  /* ===================== */
  showMissionScreens(n);

  /* ===================== */
  /* HEADER TAG */
  /* ===================== */
  if(n === 0) UI.missionTag.textContent = 'IN';
  else if(n === 'final') UI.missionTag.textContent = 'OK';
  else UI.missionTag.textContent = `M${n}`;

  /* ===================== */
  /* HUD */
  /* ===================== */
  UI.triesEl.textContent = Game.tries;

  /* ===================== */
  /* TEXTOS */
  /* ===================== */
  if(n === 0){
    UI.missionText.textContent = '';
    UI.hitsGoalEl.textContent = '—';
  }

  if(n === 1){
    UI.hitsGoalEl.textContent = Game.goals.m1;
    UI.missionText.innerHTML =
      'Mision 1 — <b>Activar turbina</b>. Toca cuando el indicador este en la zona verde.';
  }

  if(n === 2){
    UI.hitsGoalEl.textContent = '—';
    UI.missionText.innerHTML =
      'Mision 2 — <b>Balancear palas</b>. Mantener el sistema centrado.';
  }

  if(n === 3){
    UI.hitsGoalEl.textContent = '—';
    UI.missionText.innerHTML =
      'Mision 3 — <b>Arranque y cierre</b>. Completa la tarea final.';
  }

  if(n === 'final'){
    UI.hitsGoalEl.textContent = '—';
    UI.missionText.innerHTML =
      'Final — <b>Mensaje de cierre</b>. Raspa la nieve para revelarlo.';
  }

  // aqui hice esto: evento global de cambio de pantalla
  document.dispatchEvent(new CustomEvent('screenchange', { detail: n }));
};

// aqui hice esto: cierre del juego va al final real
window.finishGame = function(){
  showScreen('final');
};

// iniciar siempre en intro
showScreen(0);
