import { supabase } from '../lib/supabaseClient'

// ─── XP Level Thresholds ──────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2750, 3600, 4600, 6000]

function getLevelFromXP(xp: number): { level: number; xpToNextLevel: number } {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return { level, xpToNextLevel: nextThreshold }
}

// ─── XP Rules ─────────────────────────────────────────────────────────────────

export const XP_RULES = {
  COMPLETE_SET: 5,
  COMPLETE_WORKOUT: 50,
  WORKOUT_BONUS_PER_SET: 2,
  PERSONAL_RECORD: 25,
  LOG_ALL_MEALS: 20,
  STREAK_7_DAYS: 100,
  STREAK_30_DAYS: 500,
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const gamificationService = {
  // Award XP to a user and recalculate level
  async awardXP(userId: string, amount: number): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    const { data: stats, error: fetchError } = await supabase
      .from('user_stats')
      .select('xp, level')
      .eq('user_id', userId)
      .single()

    if (fetchError || !stats) return { newXP: 0, newLevel: 1, leveledUp: false }

    const oldLevel = stats.level as number
    const newXP = (stats.xp as number) + amount
    const { level: newLevel, xpToNextLevel } = getLevelFromXP(newXP)

    await supabase
      .from('user_stats')
      .update({
        xp: newXP,
        level: newLevel,
        xp_to_next_level: xpToNextLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    return { newXP, newLevel, leveledUp: newLevel > oldLevel }
  },

  // Update streak based on last workout date
  async updateStreak(userId: string): Promise<{ streakDays: number; streakStatus: string }> {
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('streak_days, last_workout_date, streak_status')
      .eq('user_id', userId)
      .single()

    if (error || !stats) return { streakDays: 0, streakStatus: 'broken' }

    const today = new Date().toISOString().split('T')[0]
    const lastWorkout = stats.last_workout_date as string | null
    let streakDays = stats.streak_days as number
    let streakStatus = stats.streak_status as string

    if (!lastWorkout) {
      // First ever workout
      streakDays = 1
      streakStatus = 'active'
    } else {
      const last = new Date(lastWorkout)
      const now = new Date(today)
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Already worked out today
        streakStatus = 'active'
      } else if (diffDays === 1) {
        // Consecutive day — increment streak
        streakDays += 1
        streakStatus = 'active'
      } else {
        // Missed a day — reset
        streakDays = 1
        streakStatus = 'active'
      }
    }

    await supabase
      .from('user_stats')
      .update({
        streak_days: streakDays,
        streak_status: streakStatus,
        last_workout_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    // Award streak bonuses
    if (streakDays === 7) {
      await gamificationService.awardXP(userId, XP_RULES.STREAK_7_DAYS)
    }
    if (streakDays === 30) {
      await gamificationService.awardXP(userId, XP_RULES.STREAK_30_DAYS)
    }

    return { streakDays, streakStatus }
  },

  // Check and unlock achievements
  async checkAchievements(userId: string): Promise<string[]> {
    const unlocked: string[] = []

    const { data: stats } = await supabase
      .from('user_stats')
      .select('xp, level, streak_days')
      .eq('user_id', userId)
      .single()

    const { count: workoutCount } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: mealCount } = await supabase
      .from('meal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: prCount } = await supabase
      .from('set_logs')
      .select('*', { count: 'exact', head: true })
      .eq('is_pr', true)

    // Get already unlocked achievements
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('achievement_id, achievements(key)')
      .eq('user_id', userId)

    const unlockedKeys = new Set(
      (existing ?? []).map((row: Record<string, unknown>) => {
        const ach = row.achievements as { key: string } | null
        return ach?.key ?? ''
      })
    )

    // Define conditions
    const conditions: { key: string; condition: boolean }[] = [
      { key: 'first_workout', condition: (workoutCount ?? 0) >= 1 },
      { key: 'streak_3', condition: (stats?.streak_days ?? 0) >= 3 },
      { key: 'streak_7', condition: (stats?.streak_days ?? 0) >= 7 },
      { key: 'streak_30', condition: (stats?.streak_days ?? 0) >= 30 },
      { key: 'first_pr', condition: (prCount ?? 0) >= 1 },
      { key: 'log_meal', condition: (mealCount ?? 0) >= 1 },
      { key: 'level_5', condition: (stats?.level ?? 1) >= 5 },
      { key: 'total_workouts_10', condition: (workoutCount ?? 0) >= 10 },
    ]

    for (const { key, condition } of conditions) {
      if (condition && !unlockedKeys.has(key)) {
        // Get achievement ID
        const { data: achievement } = await supabase
          .from('achievements')
          .select('id, xp_reward')
          .eq('key', key)
          .single()

        if (achievement) {
          await supabase.from('user_achievements').insert({
            user_id: userId,
            achievement_id: achievement.id,
          })
          // Award XP for achievement
          if (achievement.xp_reward > 0) {
            await gamificationService.awardXP(userId, achievement.xp_reward)
          }
          unlocked.push(key)
        }
      }
    }

    return unlocked
  },

  // Get user's achievements
  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        unlocked_at,
        achievements (key, name_en, name_fr, description_en, description_fr, xp_reward, icon)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error || !data) return []
    return data
  },

  // Get all achievements (for achievements page — locked + unlocked)
  async getAllAchievements(userId: string) {
    const { data: all } = await supabase.from('achievements').select('*')
    const { data: userAch } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId)

    const unlockedMap = new Map(
      (userAch ?? []).map((row: { achievement_id: string; unlocked_at: string }) =>
        [row.achievement_id, row.unlocked_at]
      )
    )

    return (all ?? []).map((ach: Record<string, unknown>) => ({
      ...ach,
      isUnlocked: unlockedMap.has(ach.id as string),
      unlockedAt: unlockedMap.get(ach.id as string) ?? null,
    }))
  },
}
