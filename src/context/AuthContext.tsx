import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface OnboardingData {
  goal: string
  fitnessLevel: string
  weightKg?: number
  heightCm?: number
  age?: number
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  register: (data: RegisterData) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  updateOnboarding: (data: OnboardingData) => Promise<{ error: string | null }>
  refreshUser: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Helper: fetch full user profile ─────────────────────────────────────────

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

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    if (currentSession?.user) {
      const profile = await fetchUserProfile(currentSession.user.id)
      setUser(profile)
    }
  }, [])

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setIsLoading(false);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
      
      if (!newSession) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Separate Effect for Profile Fetching (Non-blocking)
  useEffect(() => {
    if (session?.user) {
      fetchUserProfile(session.user.id).then(profile => {
        if (profile) setUser(profile);
      });
    }
  }, [session]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    
    // Manual session set triggers the profile fetch useEffect
    setSession(data.session)
    return { error: null }
  }

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (data: RegisterData): Promise<{ error: string | null }> => {
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
    if (error) return { error: error.message }
    
    // Set session to trigger transition and profile fetch
    if (signUpData.user) {
      setSession(signUpData.session)
    }
    
    return { error: null }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  // ── Update Onboarding ──────────────────────────────────────────────────────
  const updateOnboarding = async (data: OnboardingData): Promise<{ error: string | null }> => {
    if (!session?.user) return { error: 'Not authenticated' }

    const { error } = await supabase
      .from('profiles')
      .update({
        goal: data.goal,
        fitness_level: data.fitnessLevel,
        weight_kg: data.weightKg,
        height_cm: data.heightCm,
        age: data.age,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    if (error) return { error: error.message }

    await refreshUser()
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!session, // Primary check is session presence
      login,
      register,
      logout,
      updateOnboarding,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
