// engine/launcher.js
import { PlayerSystem } from './playerSystem.js';

export const Launcher = {
  render(target, { onStart } = {}) {
    target.innerHTML = '';
    const cont = document.createElement('div');
    cont.innerHTML = `
      <h2>MyMMO</h2>
      <div style="font-size:0.95rem;opacity:0.85">Bienvenido — crea tu entrenador</div>

      <div style="margin-top:12px" class="card">
        <div class="row"><label class="icon material-symbols-outlined">person</label><strong>Género</strong></div>
        <div class="row" style="margin-top:8px">
          <button id="btn-male" class="small">Hombre</button>
          <button id="btn-female" class="small">Mujer</button>
        </div>
        <div style="margin-top:10px">
          <input id="player-name" placeholder="Escribe tu apodo" style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.04);" />
        </div>
        <div style="margin-top:10px" class="row">
          <button id="start-btn" class="primary">Comenzar</button>
        </div>
      </div>
      <div style="margin-top:10px; font-size:0.9rem; color:var(--muted)">Si ya tienes una partida guardada se cargará automáticamente.</div>
    `;
    target.appendChild(cont);

    let gender = 'male';
    const nameInput = cont.querySelector('#player-name');
    cont.querySelector('#btn-male').onclick = () => { gender='male'; cont.querySelector('#btn-male').classList.add('primary'); cont.querySelector('#btn-female').classList.remove('primary'); };
    cont.querySelector('#btn-female').onclick = () => { gender='female'; cont.querySelector('#btn-female').classList.add('primary'); cont.querySelector('#btn-male').classList.remove('primary'); };

    cont.querySelector('#start-btn').onclick = () => {
      const name = nameInput.value.trim() || (gender==='male' ? 'Entrenador' : 'Entrenadora');
      PlayerSystem.initialize(name, gender);
      PlayerSystem.save();
      window.dispatchEvent(new Event('player-updated'));
      onStart && onStart();
    };
  }
};