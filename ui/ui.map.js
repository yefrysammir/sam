// ui/ui.map.js
import { MapSystem } from '../engine/mapSystem.js';
import { PlayerSystem } from '../engine/playerSystem.js';
import { CaptureSystem } from '../engine/captureSystem.js';
import { BattleSystem } from '../engine/battleSystem.js';

export const MapUI = {
  render(target, { player, log } = {}){
    target.innerHTML = '';
    const profile = player.getProfile();
    // root
    const root = document.createElement('div');
    root.id = 'game-stage';
    root.innerHTML = `
      <div id="map-panel" class="panel">
        <div id="map-grid"></div>
        <div id="player-sprite" class="player-sprite">${profile.sprite || 'P'}</div>
      </div>

      <div style="display:flex;flex-direction:column; gap:8px; width:320px;">
        <div class="status-box card" id="status-box">No se encontró monstruo</div>
        <div class="card center">
          <div id="controls" class="controls">
            <div class="arrow" data-dir="-1 -1">↖</div>
            <div class="arrow" data-dir="0 -1">↑</div>
            <div class="arrow" data-dir="1 -1">↗</div>
            <div class="arrow" data-dir="-1 0">←</div>
            <div style="width:56px"></div>
            <div class="arrow" data-dir="1 0">→</div>
            <div class="arrow" data-dir="-1 1">↙</div>
            <div class="arrow" data-dir="0 1">↓</div>
            <div class="arrow" data-dir="1 1">↘</div>
          </div>
        </div>
        <div class="card">
          <div class="space-between"><strong>Acciones</strong><div><button id="btn-capture" class="small">Atrapar</button> <button id="btn-fight" class="small">Pelear</button></div></div>
        </div>
        <div class="card"><strong>Registro</strong><div id="small-log" style="font-size:13px; color:var(--muted); margin-top:6px"></div></div>
      </div>
    `;
    target.appendChild(root);

    // build grid
    const grid = root.querySelector('#map-grid');
    grid.innerHTML = '';
    const size = MapSystem.gridSize;
    for(let i=0;i<size*size;i++){
      const t = document.createElement('div');
      t.className='tile';
      t.dataset.i = i;
      grid.appendChild(t);
    }

    const playerSprite = root.querySelector('#player-sprite');
    const statusBox = root.querySelector('#status-box');
    const smallLog = root.querySelector('#small-log');

    let pos = MapSystem.createEmpty(); // x,y
    updateSpritePos();

    let currentEncounter = null;

    function appendLog(msg){
      smallLog.prepend(`[${new Date().toLocaleTimeString()}] ${msg}\n`);
      log && log(msg);
    }

    // movement handlers
    root.querySelectorAll('.arrow').forEach(btn=>{
      btn.onclick = async () => {
        const [dx,dy] = btn.dataset.dir.split(' ').map(Number);
        pos = MapSystem.move(pos, {dx,dy});
        updateSpritePos();
        appendLog(`Te moviste a (${pos.x},${pos.y})`);
        // on move, roll encounter
        if(MapSystem.encounterRoll()){
          currentEncounter = MapSystem.pickCreatureInstance();
          showEncounter(currentEncounter);
        } else {
          currentEncounter = null;
          statusBox.innerHTML = 'No se encontró monstruo';
        }
      };
    });

    function updateSpritePos(){
      // compute tile center position
      const gridRect = grid.getBoundingClientRect();
      const tileW = grid.clientWidth / MapSystem.gridSize;
      const tileH = grid.clientHeight / MapSystem.gridSize;
      const cx = grid.offsetLeft + tileW*(pos.x + 0.5);
      const cy = grid.offsetTop + tileH*(pos.y + 0.5);
      // absolute within map-panel
      playerSprite.style.left = `${cx}px`;
      playerSprite.style.top = `${cy}px`;
    }

    function showEncounter(cre){
      const specialClass = cre.special ? 'creature-name special' : 'creature-name';
      statusBox.innerHTML = `<div class="creature-card">
        <div class="creature-img">${cre.name.slice(0,2)}</div>
        <div class="creature-meta">
          <div class="${specialClass}"><strong>${cre.name}</strong> ${cre.special? '★' : ''}</div>
          <div>Nivel ${cre.level} • Tipo: ${cre.element}</div>
          <div>HP: ${cre.hp}/${cre.maxHp}</div>
        </div>
      </div>`;
      appendLog(`Apareció ${cre.name} (LV ${cre.level})`);
    }

    // actions
    root.querySelector('#btn-capture').onclick = () => {
      if(!currentEncounter) { appendLog('No hay criatura para atrapar.'); return; }
      // use great_ball if have, else normal
      const prof = player.getProfile();
      let mult = 1;
      const ib = prof.inventory && prof.inventory.find(i=>i.id==='great_ball' && i.qty>0);
      if(ib){ ib.qty--; player.save(); mult = 1.6; appendLog('Usaste una Gran Bola.'); }
      const res = CaptureSystem.attemptCapture(currentEncounter, mult);
      if(res.success){
        player.addCreature(currentEncounter);
        appendLog(`¡Enhorabuena, has atrapado ${currentEncounter.name}!`);
        currentEncounter = null;
        statusBox.innerHTML = 'No se encontró monstruo';
      } else {
        appendLog(`Falló la captura (${res.roll.toFixed(2)} >= ${res.threshold.toFixed(2)})`);
      }
    };

    root.querySelector('#btn-fight').onclick = async () => {
      if(!currentEncounter){ appendLog('No hay criatura para pelear.'); return; }
      const prof = player.getProfile();
      if(!prof.team.length){ appendLog('No tienes criaturas para pelear.'); return; }
      // use first creature of team
      const my = prof.team[0];
      const result = BattleSystem.simulateFight(my, currentEncounter);
      // show summary
      let summary = '';
      result.logs.forEach(l=>{
        if(l.actor==='player'){
          summary += `Tu ${my.name} usó ${l.move.name} y causó ${l.dmg} daño (x${l.mult.toFixed(2)})\n`;
        } else {
          summary += `Enemigo usó ${l.move.name} y causó ${l.dmg} daño\n`;
        }
      });
      if(result.w.hp<=0){
        appendLog(`Victoria en combate! Ganaste ${currentEncounter.expYield} XP`);
        player.addXP(currentEncounter.expYield);
        // small chance to autopick? We leave capture to button
      } else {
        appendLog(`Derrota parcial. Tu criatura quedó con ${result.p.hp} HP`);
        // reduce player's creature HP in profile
        prof.team[0].hp = result.p.hp;
        player.save();
      }
      // update status box
      if(result.w.hp<=0){
        currentEncounter = null;
        statusBox.innerHTML = 'No se encontró monstruo';
      } else {
        currentEncounter.hp = result.w.hp;
        statusBox.querySelector('.creature-meta div:nth-child(3)').innerText = `HP: ${currentEncounter.hp}/${currentEncounter.maxHp}`;
      }
    };

    // responsive: recalc position on resize
    window.addEventListener('resize', updateSpritePos);
    setTimeout(updateSpritePos, 50);
  }
};