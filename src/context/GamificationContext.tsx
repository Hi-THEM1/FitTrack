import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Achievement, UserStats, XPTransaction } from '../types/gamification';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface GamificationContextType {
  stats: UserStats;
  isLoading: boolean;
  addXP: (amount: number, reason: { en: string; fr: string }) => Promise<void>;
  unlockAchievement: (id: string, achievement: Achievement) => Promise<void>;
  recentAchievement: Achievement | null;
  clearAchievement: () => void;
  refreshStats: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    xpToNextLevel: 1000,
    streakDays: 0,
    streakStatus: 'active',
    achievements: []
  });
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Fetch stats from Supabase ──────────────────────────────────────────────
  const fetchStats = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK, create default
      console.warn('Gamification stats fetch error:', error);
    }

    const loadedStats: UserStats = data || {
      xp: 0,
      level: 1,
      xpToNextLevel: 1000,
      streakDays: 0,
      streakStatus: 'active' as const,
      achievements: []
    };

    setStats({
      ...loadedStats,
      achievements: Array.isArray(loadedStats.achievements) ? loadedStats.achievements : []
    });
    setIsLoading(false);
  }, []);

  // ─── Load on user change ────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      fetchStats(user.id);
    } else {
      setStats({
        xp: 0, level: 1, xpToNextLevel: 1000, streakDays: 0, streakStatus: 'active', achievements: []
      });
      setIsLoading(false);
    }
  }, [user?.id, fetchStats]);

  // ─── Refresh callback ────────────────────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    if (user?.id) {
      await fetchStats(user.id);
    }
  }, [user?.id, fetchStats]);

  // ─── Add XP with level up logic & persist ───────────────────────────────────
  const addXP = async (amount: number, reason: { en: string; fr: string }) => {
    if (!user?.id) return;

    // Optimistic calculation
    setStats(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNextLevel;

      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel += 1;
        newXPToNext = Math.floor(newXPToNext * 1.1);
      }

      const updated = {
        ...prev,
        xp: newXP,
        level: newLevel,
        xpToNextLevel: newXPToNext
      };
      setStats(updated);
      return updated;
    });

    // Persist
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        xp: stats.xp + amount,
        level: stats.level,
        xp_to_next_level: stats.xpToNextLevel,
        streak_days: stats.streakDays,
        streak_status: stats.streakStatus,
        achievements: stats.achievements,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to update XP:', error);
      await refreshStats();
    }
  };


  // ─── Unlock achievement & bonus XP ───────────────────────────────────────────
  const unlockAchievement = async (achievementId: string, achievement: Achievement) => {
    if (!user?.id) return;

    // Check if already unlocked
    const hasAchievement = stats.achievements.some(a => a.id === achievementId);
    if (hasAchievement) return;

    // Optimistic update
    const newAchievements = [...stats.achievements, { ...achievement, unlockedAt: new Date().toISOString() }];
    const updatedStats = { ...stats, achievements: newAchievements };
    setStats(updatedStats);
    setRecentAchievement(achievement);

    // Persist achievements
    const { error: achError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        achievements: newAchievements,
        updated_at: new Date().toISOString()
      });

    if (achError) {
      console.error('Failed to unlock achievement:', achError);
      await refreshStats();
      return;
    }

    // Bonus XP
    await addXP(achievement.xpBonus, achievement.name);
  };

  const clearAchievement = () => setRecentAchievement(null);

  return (
    <GamificationContext.Provider value={{
      stats,
      isLoading,
      addXP,
      unlockAchievement,
      recentAchievement,
      clearAchievement,
      refreshStats
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

