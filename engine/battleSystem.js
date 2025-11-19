// engine/battleSystem.js
// define type effectiveness table (simple)
const EFFECT = {
  fire: { weakTo: ['water'], strongAgainst: ['grass','ice'] },
  water: { weakTo: ['electric','grass'], strongAgainst: ['fire','rock'] },
  grass: { weakTo: ['fire'], strongAgainst: ['water'] },
  ice: { weakTo: ['fire'], strongAgainst: ['grass'] },
  electric: { weakTo: ['ground'], strongAgainst: ['water'] },
  normal: { weakTo: [], strongAgainst: [] }
};

function typeMultiplier(attackType, defendType){
  const e = EFFECT[attackType];
  if(!e) return 1;
  if(e.strongAgainst && e.strongAgainst.includes(defendType)) return 1.6;
  if(e.weakTo && e.weakTo.includes(defendType)) return 0.6;
  return 1;
}

export const BattleSystem = {
  pickAIMove(enemy, target){
    // prefer moves that are strong vs target
    if(!enemy.moves || !enemy.moves.length) return null;
    // score moves
    let best = enemy.moves[0];
    let bestScore = -Infinity;
    for(const m of enemy.moves){
      const mult = typeMultiplier(m.type, target.element);
      // prefer higher power and favorable multiplier
      const score = m.power * mult + (Math.random()*6);
      if(score > bestScore){ bestScore = score; best = m; }
    }
    return best;
  },

  executeMove(attacker, defender, move){
    const basePower = move.power || 10;
    const mult = typeMultiplier(move.type, defender.element);
    // damage formula: (attack * basePower / 20) * mult - defense*0.3
    let dmg = Math.max(1, Math.floor((attacker.attack * basePower / 20) * mult - Math.floor(defender.defense * 0.3)));
    defender.hp -= dmg;
    if(defender.hp < 0) defender.hp = 0;
    return { dmg, mult };
  },

  simulateFight(playerCreature, wildCreature, onStep){
    // simple loop where AI chooses and player chooses first (we'll pick first move)
    const p = JSON.parse(JSON.stringify(playerCreature));
    const w = JSON.parse(JSON.stringify(wildCreature));
    const logs = [];
    // player uses first move
    for(let turn=0; turn<20 && p.hp>0 && w.hp>0; turn++){
      // player's turn: choose best move (simple pick highest power)
      const myMove = (p.moves && p.moves.length) ? p.moves.reduce((a,b)=>a.power>=b.power?a:b) : { name:'Golpe', power:10, type:'normal' };
      const res1 = this.executeMove(p, w, myMove);
      logs.push({ actor:'player', move:myMove, dmg:res1.dmg, mult:res1.mult, pHp:p.hp, wHp:w.hp });
      if(w.hp<=0) break;

      // enemy turn: pick move by AI
      const aiMove = this.pickAIMove(w, p) || { name:'Ataque', power:10, type:'normal' };
      const res2 = this.executeMove(w, p, aiMove);
      logs.push({ actor:'enemy', move:aiMove, dmg:res2.dmg, mult:res2.mult, pHp:p.hp, wHp:w.hp });
      if(p.hp<=0) break;
    }
    return { p, w, logs };
  }
};