// ui/ui.battle.js
export const BattleUI = {
  render(target, battleData = {}){
    target.innerHTML = '';
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<div><strong>Combate</strong></div><div>Modo demo — ver consola para detalles.</div>`;
    target.appendChild(el);
  }
};