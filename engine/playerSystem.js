// engine/playerSystem.js
import gameConfig from '../config/game.config.json' assert { type: 'json' };

class PlayerSystemClass {
  constructor(){
    this.key = 'mymmo-save-v1';
    this.profile = {
      name: null,
      gender: null,
      sprite: null,
      level: 1,
      xp: 0,
      currency: gameConfig.startingCurrency || 0,
      team: [],
      inventory: []
    };
  }

  static getInstance(){
    if(!window.__PlayerSystemInstance) window.__PlayerSystemInstance = new PlayerSystemClass();
    return window.__PlayerSystemInstance;
  }

  static initialize(name='Entrenador', gender='male'){
    const inst = PlayerSystemClass.getInstance();
    inst.profile.name = name;
    inst.profile.gender = gender;
    inst.profile.sprite = gender === 'female' ? '♀' : '♂';
    inst.profile.level = 1;
    inst.profile.xp = 0;
    inst.profile.currency = gameConfig.startingCurrency || 0;
    inst.profile.team = [];
    inst.profile.inventory = [{ id:'potion', qty:3 }, { id:'great_ball', qty:3 }];
    inst.save();
    window.dispatchEvent(new Event('player-updated'));
    return inst;
  }

  getProfile(){ return JSON.parse(JSON.stringify(this.profile)); }

  addCreature(creature){
    if(this.profile.team.length < gameConfig.maxTeamSize) this.profile.team.push(creature);
    else { this.profile.storage = this.profile.storage || []; this.profile.storage.push(creature); }
    this.save();
    window.dispatchEvent(new Event('player-updated'));
  }

  addXP(amount){
    this.profile.xp += amount;
    const next = Math.floor(100 * Math.pow(this.profile.level, 1.2) * gameConfig.levelXPFactor);
    while(this.profile.xp >= next){
      this.profile.xp -= next;
      this.profile.level += 1;
    }
    this.save();
    window.dispatchEvent(new Event('player-updated'));
  }

  changeCurrency(delta){
    this.profile.currency += delta;
    this.save();
    window.dispatchEvent(new Event('player-updated'));
  }

  save(){
    try {
      localStorage.setItem(this.key, JSON.stringify(this.profile));
      return true;
    } catch(e){ console.error(e); return false; }
  }

  static autoLoadIfExists(){
    const inst = PlayerSystemClass.getInstance();
    try {
      const raw = localStorage.getItem(inst.key);
      if(!raw) return false;
      inst.profile = JSON.parse(raw);
      window.dispatchEvent(new Event('player-updated'));
      return true;
    } catch(e){ return false; }
  }

  static getInstance(){ return PlayerSystemClass.getInstance(); }

  static clearSave(){
    const inst = PlayerSystemClass.getInstance();
    localStorage.removeItem(inst.key);
    inst.profile = { name:null, gender:null, sprite:null, level:1, xp:0, currency:gameConfig.startingCurrency||0, team:[], inventory:[] };
    window.dispatchEvent(new Event('player-updated'));
  }
}

export const PlayerSystem = PlayerSystemClass;