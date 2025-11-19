// ui/ui.home.js
import { PlayerSystem } from '../engine/playerSystem.js';

export const UIHome = {
  render(target, { player, log } = {}){
    target.innerHTML = '';
    const prof = PlayerSystem.getInstance().getProfile ? PlayerSystem.getInstance().getProfile() : PlayerSystem.getInstance().profile;
    const root = document.createElement('div');
    root.innerHTML = `
      <h2>Bienvenido, ${prof.name}</h2>
      <div style="margin-top:10px" class="card">
        <div>Género: ${prof.gender}</div>
        <div>Nivel ${prof.level} • XP ${prof.xp}</div>
        <div style="margin-top:10px"><button id="to-map">Ir al mapa</button></div>
      </div>
    `;
    target.appendChild(root);
    root.querySelector('#to-map').onclick = async () => {
      const { MapUI } = await import('./ui.map.js');
      MapUI.render(target, { player: PlayerSystem.getInstance(), log });
    };
  }
};