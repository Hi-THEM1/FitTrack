import type { XPTransaction } from '../types/gamification';

export const XP_RULES = {
  COMPLETE_SET: 5,
  COMPLETE_WORKOUT_BASE: 50,
  SET_BONUS: 2,
  PR_BONUS: 25,
  LOG_ALL_MEALS: 20,
  WEEKLY_STREAK: 100,
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2700, 3500, 4400];

export const calculateWorkoutXP = (setsCount: number, prsCount: number = 0) => {
  return XP_RULES.COMPLETE_WORKOUT_BASE + (setsCount * XP_RULES.SET_BONUS) + (prsCount * XP_RULES.PR_BONUS);
};

export const getLevelFromXP = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

export const getXPToNextLevel = (level: number): number => {
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 2000;
  return LEVEL_THRESHOLDS[level];
};
