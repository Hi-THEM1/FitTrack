export interface Achievement {
  id: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  icon: string;
  unlockedAt?: string;
  xpBonus: number;
}

export interface UserStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  streakDays: number;
  streakStatus: 'active' | 'at-risk' | 'broken';
  achievements: Achievement[];
}

export interface XPTransaction {
  id: string;
  amount: number;
  reason: { en: string; fr: string };
  timestamp: string;
}

export const GAMIFICATION_VERSION = '1.0.0';
