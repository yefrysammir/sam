// engine/captureSystem.js
import gameConfig from '../config/game.config.json' assert { type: 'json' };

export const CaptureSystem = {
  attemptCapture(wild, ballMultiplier = 1){
    // The lower the HP relative to max, the higher chance
    const hpFactor = 1 - (wild.hp / wild.maxHp); // 0 when full HP, 1 when 0 HP
    const base = gameConfig.captureBaseRate || 0.4; // baseline
    // incorporate creature captureRate (lower captureRate -> harder)
    const speciesFactor = (1 - wild.captureRate);
    // combine
    const rate = Math.max(0.02, Math.min(0.98, base * (0.5 + hpFactor*1.2) * speciesFactor * ballMultiplier));
    const roll = Math.random();
    return { success: roll < rate, roll, threshold: rate };
  }
};