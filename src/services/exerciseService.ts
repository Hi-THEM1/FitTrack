import { supabase } from '../lib/supabaseClient'
import type { Exercise, Muscle } from '../types/fitness'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExerciseFilters {
  search?: string
  category?: string
  equipment?: string
  difficulty?: string
  userId?: string // Current user ID to fetch their custom exercises
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapRow(row: Record<string, unknown>): Exercise & { userId?: string; isPublic?: boolean } {
  return {
    id: row.id as string,
    name: { en: row.name_en as string, fr: row.name_fr as string },
    category: row.category as string,
    equipment: (row.equipment as string[]) ?? [],
    difficulty: row.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
    muscles: (row.muscles as any[])?.map(m => {
        if (typeof m === 'string') return { id: m, name: { en: m, fr: m }, isPrimary: true };
        return {
            id: m.id || m.name_en,
            name: { en: m.name_en || m.en || m, fr: m.name_fr || m.fr || m },
            isPrimary: m.isPrimary ?? true
        };
    }) ?? [],
    instructions: {
      en: (row.instructions_en as string[]) ?? [],
      fr: (row.instructions_fr as string[]) ?? [],
    },
    mediaUrl: row.media_url as string | undefined,
    userId: row.user_id as string | undefined,
  }
}

// ─── Service Functions ────────────────────────────────────────────────────────

export const exerciseService = {
  // Get all exercises (built-in + user's custom)
  async getAll(filters?: ExerciseFilters): Promise<(Exercise & { userId?: string; isPublic?: boolean })[]> {
    let query = supabase.from('exercises').select('*')

    // No user_id filter because the table doesn't have it
    // if (filters?.userId) {
    //   query = query.eq('user_id', filters.userId)
    // }

    if (filters?.search) {
      query = query.or(`name_en.ilike.%${filters.search}%,name_fr.ilike.%${filters.search}%`)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters?.equipment) {
      query = query.contains('equipment', [filters.equipment])
    }

    // Try primary query with all filters
    const { data, error } = await query.order('name_en')
    
    if (error) {
        console.warn('Exercise query failed, likely missing columns. Trying fallback with basic columns...', error.message);
        
        // Fallback: try ordering by 'name' if 'name_en' failed, and strip complex filters
        let fallbackQuery = supabase.from('exercises').select('*')
        
        if (filters?.category) {
            fallbackQuery = fallbackQuery.eq('category', filters.category)
        }
        
        // Try ordering by 'name_en' first, then 'name'
        const { data: fbData, error: fbError } = await fallbackQuery.order('name_en')
        
        if (fbError) {
            const { data: fbData2, error: fbError2 } = await fallbackQuery.order('name')
            if (fbError2) throw new Error(fbError2.message)
            return (fbData2 ?? []).map(mapRow)
        }
        
        return (fbData ?? []).map(mapRow)
    }
    
    return (data ?? []).map(mapRow)
  },

  // Create a custom exercise
  async create(userId: string, exercise: Omit<Exercise, 'id'>): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        user_id: userId,
        name_en: exercise.name.en,
        name_fr: exercise.name.fr,
        category: exercise.category,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        muscles: exercise.muscles.map(m => ({
            name_en: m.name.en,
            name_fr: m.name.fr,
            isPrimary: m.isPrimary
        })),
        instructions_en: exercise.instructions.en,
        instructions_fr: exercise.instructions.fr,
        media_url: exercise.mediaUrl || null
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating custom exercise:', error)
      return null
    }
    return mapRow(data)
  },

  // Update a custom exercise
  async update(id: string, exercise: Partial<Exercise>): Promise<boolean> {
    const updateData: any = {}
    if (exercise.name?.en) updateData.name_en = exercise.name.en
    if (exercise.name?.fr) updateData.name_fr = exercise.name.fr
    if (exercise.category) updateData.category = exercise.category
    if (exercise.equipment) updateData.equipment = exercise.equipment
    if (exercise.difficulty) updateData.difficulty = exercise.difficulty
    if (exercise.muscles) updateData.muscles = exercise.muscles.map(m => ({
        name_en: m.name.en,
        name_fr: m.name.fr,
        isPrimary: m.isPrimary
    }))
    if (exercise.instructions?.en) updateData.instructions_en = exercise.instructions.en
    if (exercise.instructions?.fr) updateData.instructions_fr = exercise.instructions.fr
    if (exercise.mediaUrl !== undefined) updateData.media_url = exercise.mediaUrl

    const { error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', id)

    return !error
  },

  // Delete a custom exercise
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)

    return !error
  },

  // Get single exercise by ID
  async getById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return mapRow(data)
  },

  // Get recently used exercises for a user
  async getRecentlyUsed(userId: string, limit = 5): Promise<Exercise[]> {
    // Refactor to avoid complex nested ordering
    const { data: recentSessions } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(10);

    if (!recentSessions || recentSessions.length === 0) return [];
    const sessionIds = recentSessions.map(s => s.id);

    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        exercise_id,
        exercises (*)
      `)
      .in('session_id', sessionIds)
      .limit(limit);

    if (error || !data) {
      console.error('Error fetching recently used exercises:', error);
      return [];
    }

    // Deduplicate by exercise_id
    const seen = new Set<string>()
    const unique = data.filter((row: Record<string, unknown>) => {
      if (seen.has(row.exercise_id as string)) return false
      seen.add(row.exercise_id as string)
      return true
    })

    return unique.map((row: any) => mapRow(row.exercises as Record<string, unknown>))
  },

  // Get all unique categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('category')

    if (error || !data) return []
    return [...new Set(data.map((row: { category: string }) => row.category))].sort()
  },
}
