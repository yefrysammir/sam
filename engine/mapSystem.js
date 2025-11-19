// engine/mapSystem.js
import creatures from '../config/creatures.json' assert { type: 'json' };

export const MapSystem = {
  gridSize: 8,
  specialProbability: 0.8, // 80% para prueba según pediste
  createEmpty(){
    // start center
    return { x: Math.floor(this.gridSize/2), y: Math.floor(this.gridSize/2) };
  },
  move(pos, dir){
    // dir: {dx,dy}
    const nx = Math.max(0, Math.min(this.gridSize-1, pos.x + dir.dx));
    const ny = Math.max(0, Math.min(this.gridSize-1, pos.y + dir.dy));
    return { x:nx, y:ny };
  },
  encounterRoll(){
    // base 55% de que aparezca una criatura al moverte (ajustable)
    return Math.random() < 0.55;
  },
  pickCreatureInstance(){
    // weighted by (1 - captureRate) to make rarer appear less frequently? keep simple: random
    const cfg = creatures[Math.floor(Math.random()*creatures.length)];
    const isSpecial = cfg.specialPossible && (Math.random() < this.specialProbability);
    return this._createInstance(cfg, isSpecial);
  },
  _createInstance(config, special=false){
    const level = Math.floor(Math.random()*5)+1;
    const hp = Math.floor(config.baseHP + level * 8);
    const atk = Math.floor(config.baseAttack + level * 2);
    const def = Math.floor(config.baseDefense + level * 1.5);
    return {
      uid: `${config.id}_${Date.now()}_${Math.floor(Math.random()*10000)}`,
      id: config.id,
      name: config.name,
      level,
      hp,
      maxHp: hp,
      attack: atk,
      defense: def,
      element: config.element,
      captureRate: config.captureRate,
      icon: config.icon,
      expYield: config.expYield,
      moves: config.moves || [],
      special: special
    };
  }
};