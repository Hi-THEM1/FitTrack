import { supabase } from '../lib/supabaseClient'
import type { User as AuthUser, Session } from '@supabase/supabase-js'


// ─── Types (matching AuthContext exactly) ─────────────────────────────────────

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  goal?: string
  fitnessLevel?: string
  weightKg?: number
  heightCm?: number
  age?: number
  gamification: {
    currentLevel: number
    currentStreak: number
    xp: number
    streakStatus: 'active' | 'at-risk' | 'broken'
  }
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface OnboardingData {
  goal: string
  fitnessLevel: string
  weightKg?: number
  heightCm?: number
  age?: number
}


// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {
  // Login (matches AuthContext.login)
  login: async (email: string, password: string): Promise<{ user: User | null; session: Session | null; error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { user: null, session: null, error: error.message }
    }
    // Fetch full profile like AuthContext
    if (data.user) {
      const fullUser = await fetchUserProfile(data.user.id)
      return { user: fullUser, session: data.session!, error: null }
    }
    return { user: null, session: null, error: 'Login failed' }
  },

  // Register (matches AuthContext.register)
  register: async (data: RegisterData): Promise<{ user: User | null; session: Session | null; error: string | null }> => {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    })
    if (error) {
      return { user: null, session: null, error: error.message }
    }
    if (signUpData.user) {
      const fullUser = await fetchUserProfile(signUpData.user.id)
      return { user: fullUser, session: signUpData.session ?? null, error: null }
    }
    return { user: null, session: null, error: 'Registration failed' }
  },

  // Logout
  logout: async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    return { error: null }
  },

  // Get current profile
  getProfile: async (userId: string): Promise<User | null> => {
    return await fetchUserProfile(userId)
  },

  // Update profile/onboarding
  updateProfile: async (userId: string, updates: Partial<OnboardingData>): Promise<{ user: User | null; error: string | null }> => {
    const { error } = await supabase
      .from('profiles')
      .update({
        goal: updates.goal,
        fitness_level: updates.fitnessLevel,
        weight_kg: updates.weightKg,
        height_cm: updates.heightCm,
        age: updates.age,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return { user: null, error: error.message }
    }

    const updatedUser = await fetchUserProfile(userId)
    return { user: updatedUser, error: null }
  },
}

// ─── Helper: Fetch full user profile (copied from AuthContext for consistency) ──

async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) return null

  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    goal: profile.goal,
    fitnessLevel: profile.fitness_level,
    weightKg: profile.weight_kg,
    heightCm: profile.height_cm,
    age: profile.age,
    gamification: {
      currentLevel: stats?.level ?? 1,
      currentStreak: stats?.streak_days ?? 0,
      xp: stats?.xp ?? 0,
      streakStatus: (stats?.streak_status as 'active' | 'at-risk' | 'broken') ?? 'active',
    },
  }
}

