// engine/saveSystem.js
import { PlayerSystem } from './playerSystem.js';

export const SaveSystem = {
  key: PlayerSystem.getInstance().key ?? 'mymmo-save-v1',
  save(playerInstance = PlayerSystem.getInstance()){
    try {
      const data = playerInstance.getProfile ? playerInstance.getProfile() : playerInstance.serialize();
      localStorage.setItem(this.key, JSON.stringify(data));
      return true;
    } catch(e){ console.error(e); return false; }
  },
  load(playerInstance = PlayerSystem.getInstance()){
    try {
      const raw = localStorage.getItem(this.key);
      if(!raw) return false;
      const data = JSON.parse(raw);
      // assign to profile
      if(playerInstance.profile) playerInstance.profile = data;
      else Object.assign(playerInstance, data);
      window.dispatchEvent(new Event('player-updated'));
      return true;
    } catch(e){ console.error(e); return false; }
  },
  delete(){
    try { localStorage.removeItem(this.key); return true; } catch(e){ return false; }
  }
};