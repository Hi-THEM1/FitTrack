import { supabase } from '../lib/supabaseClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SetLog {
  id?: string
  setNumber: number
  weightKg: number
  reps: number
  isCompleted: boolean
  isPR?: boolean
  previousWeightKg?: number
  previousReps?: number
  timestamp?: string
}

export interface WorkoutExercise {
  id?: string
  exerciseId: string
  exerciseName: string
  orderIndex: number
  sets: SetLog[]
}

export interface WorkoutSession {
  id?: string
  userId: string
  name: string
  templateId?: string
  startTime: string
  endTime?: string
  durationSeconds: number
  exercises: WorkoutExercise[]
  totalVolume: number
  xpEarned: number
  notes?: string
}

export interface WorkoutSummary {
  id: string
  name: string
  startTime: string
  durationSeconds: number
  totalVolume: number
  xpEarned: number
  exerciseCount: number
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const workoutService = {
  // Save a complete finished workout
  async saveWorkout(session: WorkoutSession): Promise<{ id: string } | null> {
    // 1. Insert the workout session
    const { data: workoutData, error: workoutError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: session.userId,
        name: session.name,
        template_id: session.templateId ?? null,
        start_time: session.startTime,
        end_time: session.endTime ?? new Date().toISOString(),
        duration_seconds: session.durationSeconds,
        total_volume: session.totalVolume,
        xp_earned: session.xpEarned,
        notes: session.notes ?? null,
      })
      .select('id')
      .single()

    if (workoutError || !workoutData) return null

    const workoutId = workoutData.id

    // 2. Insert each exercise
    for (const exercise of session.exercises) {
      const { data: exData, error: exError } = await supabase
        .from('workout_exercises')
        .insert({
          session_id: workoutId,
          exercise_id: exercise.exerciseId,
          order_index: exercise.orderIndex,
        })
        .select('id')
        .single()

      if (exError || !exData) continue

      // 3. Insert each set for this exercise
      const setsToInsert = exercise.sets.map(set => ({
        workout_exercise_id: exData.id,
        set_number: set.setNumber,
        weight_kg: set.weightKg,
        reps: set.reps,
        is_completed: set.isCompleted,
        is_pr: set.isPR ?? false,
        previous_weight_kg: set.previousWeightKg ?? null,
        previous_reps: set.previousReps ?? null,
        timestamp: set.timestamp ?? new Date().toISOString(),
      }))

      await supabase.from('set_logs').insert(setsToInsert)
    }

    return { id: workoutId }
  },

  // Get workout history for a user
  async getHistory(userId: string, limit = 20): Promise<WorkoutSummary[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        id, name, start_time, duration_seconds,
        total_volume, xp_earned,
        workout_exercises (count)
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit)

    if (error || !data) return []

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      startTime: row.start_time as string,
      durationSeconds: row.duration_seconds as number,
      totalVolume: row.total_volume as number,
      xpEarned: row.xp_earned as number,
      exerciseCount: (row.workout_exercises as { count: number }[])?.[0]?.count ?? 0,
    }))
  },

  // Get last performed sets for an exercise (for progressive overload suggestions)
  async getLastSets(userId: string, exerciseId: string): Promise<SetLog[]> {
    // Simplify: Query workout_exercises directly and join with sessions for ordering
    // Refactor to avoid complex nested ordering which causes 400 errors
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('id, start_time')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(5);

    if (sessionError || !sessionData || sessionData.length === 0) return [];

    const sessionIds = sessionData.map(s => s.id);

    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        exercise_id,
        set_logs (*)
      `)
      .eq('exercise_id', exerciseId)
      .in('session_id', sessionIds);

    if (error || !data) return []

    if (error || !data) return []

    // Flatten the sets from the last few sessions
    const allSets: SetLog[] = []
    data.forEach((row: any) => {
      if (row.set_logs) {
        row.set_logs.forEach((s: any) => {
          allSets.push({
            id: s.id,
            setNumber: s.set_number,
            weightKg: s.weight_kg || 0,
            reps: s.reps || 0,
            isCompleted: s.is_completed,
            isPR: s.is_pr,
            timestamp: s.timestamp
          })
        })
      }
    })

    return allSets
  },

  // Get workout count for a user (for dashboard stats)
  async getWorkoutCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) return 0
    return count ?? 0
  },

  // Get workouts for a date range (for calendar strip)
  async getWorkoutDates(userId: string, from: string, to: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('start_time')
      .eq('user_id', userId)
      .gte('start_time', from)
      .lte('start_time', to)

    if (error || !data) return []
    return data.map((row: { start_time: string }) =>
      new Date(row.start_time).toISOString().split('T')[0]
    )
  },

  // Get weekly volume for sparkline (last 7 days)
  // Get daily volume for a specific range of days
  async getWeeklyVolume(userId: string, daysCount = 7): Promise<number[]> {
    const days: number[] = []
    const today = new Date()

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const { data } = await supabase
        .from('workout_sessions')
        .select('total_volume')
        .eq('user_id', userId)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lte('start_time', `${dateStr}T23:59:59`)

      const volume = data?.reduce((sum: number, row: { total_volume: number }) =>
        sum + (row.total_volume ?? 0), 0) ?? 0
      days.push(volume)
    }

    return days
  },

  // Get Personal Records for all exercises
  async getExercisePRs(userId: string): Promise<{ name: string, pr: number, trend: number[] }[]> {
    // 1. Get recent sessions
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(50);

    if (!sessions || sessions.length === 0) return [];
    const sessionIds = sessions.map(s => s.id);

    // 2. Get exercise logs for those sessions
    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        exercise_id,
        exercises (name_en, name_fr),
        set_logs (*)
      `)
      .in('session_id', sessionIds);

    if (error || !data) return [];

    const prMap: Record<string, { name: string, pr: number, trend: number[] }> = {};

    data.forEach((row: any) => {
      const exName = row.exercises.name_en;
      if (!prMap[exName]) {
        prMap[exName] = { name: exName, pr: 0, trend: [] };
      }
      
      let sessionMax = 0;
      if (row.set_logs) {
        row.set_logs.forEach((s: any) => {
          if (s.is_completed) {
            sessionMax = Math.max(sessionMax, s.weight_kg || 0);
          }
        });
      }
      
      if (sessionMax > 0) {
        prMap[exName].trend.push(sessionMax);
        prMap[exName].pr = Math.max(prMap[exName].pr, sessionMax);
      }
    });

    return Object.values(prMap).filter(ex => ex.pr > 0);
  },

  // ─── AI Coaching & Smart Planning ───────────────────────────────────────────

  // Generate a personalized next workout based on user data
  async generateSmartProgram(userId: string, userProfile: any): Promise<{ name: string; exercises: any[] }> {
    const goal = userProfile.goal || 'maintenance';
    const level = userProfile.fitnessLevel || 'beginner';
    
    // 1. Fetch some exercises to pick from
    const { data: allExercises } = await supabase.from('exercises').select('*');
    if (!allExercises || allExercises.length === 0) return { name: 'Full Body Base', exercises: [] };

    // 2. Determine Focus & Selection (Shuffle for variety)
    const shuffled = [...allExercises].sort(() => Math.random() - 0.5);
    let programName = '';
    let selectedExercises: any[] = [];

    const isBeginner = level === 'beginner';
    const count = isBeginner ? 6 : 8; // More exercises for advanced users

    if (goal === 'gain_muscle') {
      programName = isBeginner ? 'Hypertrophy Foundations' : 'Advanced Power & Size';
      // Pick a mix of compounds and isolations
      selectedExercises = shuffled.slice(0, count);
    } else if (goal === 'lose_weight') {
      programName = 'Metabolic Conditioning';
      // Focus on legs and full body if possible
      selectedExercises = shuffled
        .filter(ex => ex.category === 'Full Body' || ex.category === 'Legs' || ex.category === 'Push')
        .slice(0, count);
    } else {
      programName = 'Elite Performance';
      selectedExercises = shuffled.slice(0, count);
    }

    // Ensure we have at least 'count' exercises
    if (selectedExercises.length < count) {
        selectedExercises = [...selectedExercises, ...shuffled.slice(0, count - selectedExercises.length)];
    }

    return {
      name: programName,
      exercises: selectedExercises.map((ex, idx) => ({
        exerciseId: ex.id,
        name: { en: ex.name_en, fr: ex.name_fr },
        muscles: ex.muscles || [], // Use the muscles from the row
        orderIndex: idx,
        sets: Array.from({ length: 3 }, (_, i) => ({
            setNumber: i + 1,
            weightKg: 0,
            reps: 10,
            isCompleted: false
        }))
      }))
    };
  },

  // Get AI Coaching suggestions based on history
  async getAICoachSuggestions(userId: string): Promise<{ en: string; fr: string }[]> {
    const history = await this.getHistory(userId, 5);
    if (history.length === 0) {
      return [{ 
        en: "Start your first workout to get AI-powered coaching tips!", 
        fr: "Commencez votre première séance pour recevoir des conseils de l'IA !" 
      }];
    }

    const suggestions = [];
    const totalVolume = history.reduce((sum, h) => sum + h.totalVolume, 0);
    const avgVolume = history.length > 0 ? totalVolume / history.length : 0;

    if (history[0].totalVolume > avgVolume) {
      suggestions.push({
        en: "Great job! Your volume is increasing. Try adding 2.5kg to your main lifts next time.",
        fr: "Beau travail ! Votre volume augmente. Essayez d'ajouter 2,5 kg à vos exercices de base."
      });
    }

    const lastDate = new Date(history[0].startTime);
    const daysSinceLast = (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysSinceLast > 4) {
      suggestions.push({
        en: "It's been a while! Start with a light session to ease back in.",
        fr: "Ça fait un moment ! Commencez par une séance légère pour reprendre en douceur."
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        en: "Consistency is key. You're doing well, keep following the plan.",
        fr: "La régularité est la clé. Continuez ainsi et suivez le plan."
      });
    }

    return suggestions;
  }
}
