import { supabase } from '../lib/supabaseClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'

export interface FoodItem {
  id: string
  name: { en: string; fr: string }
  calories: number
  protein: number
  carbs: number
  fats: number
  servingSize: number
  unit: 'g' | 'ml' | 'piece'
}

export interface MealEntry {
  id: string
  foodId: string
  foodName: { en: string; fr: string }
  quantity: number
  mealType: MealType
  macros: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
  timestamp: string
  loggedDate: string
}

export interface DailyMacros {
  calories: number
  protein: number
  carbs: number
  fats: number
}

export interface NutritionTargets {
  calories: number
  protein: number
  carbs: number
  fats: number
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const nutritionService = {
  // Search food items
  async searchFood(query: string): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .or(`name_en.ilike.%${query}%,name_fr.ilike.%${query}%`)
      .limit(20)

    if (error || !data) return []

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: { en: row.name_en as string, fr: row.name_fr as string },
      calories: row.calories as number,
      protein: row.protein as number,
      carbs: row.carbs as number,
      fats: row.fats as number,
      servingSize: row.serving_size as number,
      unit: row.unit as 'g' | 'ml' | 'piece',
    }))
  },

  // Get all food items
  async getAllFood(): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('name_en')

    if (error || !data) return []

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: { en: row.name_en as string, fr: row.name_fr as string },
      calories: row.calories as number,
      protein: row.protein as number,
      carbs: row.carbs as number,
      fats: row.fats as number,
      servingSize: row.serving_size as number,
      unit: row.unit as 'g' | 'ml' | 'piece',
    }))
  },

  // Log a meal entry
  async logMeal(
    userId: string,
    food: FoodItem,
    quantity: number,
    mealType: MealType
  ): Promise<{ error: string | null }> {
    const multiplier = quantity / food.servingSize

    const { error } = await supabase.from('meal_entries').insert({
      user_id: userId,
      food_id: food.id,
      quantity,
      meal_type: mealType,
      total_calories: Math.round(food.calories * multiplier),
      total_protein: Math.round(food.protein * multiplier * 10) / 10,
      total_carbs: Math.round(food.carbs * multiplier * 10) / 10,
      total_fats: Math.round(food.fats * multiplier * 10) / 10,
      logged_date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    })

    if (error) return { error: error.message }
    return { error: null }
  },

  // Get today's meal entries for a user
  async getDailyLog(userId: string): Promise<MealEntry[]> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('meal_entries')
      .select(`
        *,
        food_items (name_en, name_fr)
      `)
      .eq('user_id', userId)
      .eq('logged_date', today)
      .order('timestamp', { ascending: true })

    if (error || !data) return []

    return data.map((row: Record<string, unknown>) => {
      const food = row.food_items as { name_en: string; name_fr: string }
      return {
        id: row.id as string,
        foodId: row.food_id as string,
        foodName: { en: food?.name_en ?? '', fr: food?.name_fr ?? '' },
        quantity: row.quantity as number,
        mealType: row.meal_type as MealType,
        macros: {
          calories: row.total_calories as number,
          protein: row.total_protein as number,
          carbs: row.total_carbs as number,
          fats: row.total_fats as number,
        },
        timestamp: row.timestamp as string,
        loggedDate: row.logged_date as string,
      }
    })
  },

  // Delete a meal entry
  async removeMeal(entryId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('meal_entries')
      .delete()
      .eq('id', entryId)

    if (error) return { error: error.message }
    return { error: null }
  },

  // Get today's macro totals
  async getTodaysMacros(userId: string): Promise<DailyMacros> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('meal_entries')
      .select('total_calories, total_protein, total_carbs, total_fats')
      .eq('user_id', userId)
      .eq('logged_date', today)

    if (error || !data) return { calories: 0, protein: 0, carbs: 0, fats: 0 }

    return data.reduce(
      (acc: DailyMacros, row: Record<string, unknown>) => ({
        calories: acc.calories + (row.total_calories as number ?? 0),
        protein: acc.protein + (row.total_protein as number ?? 0),
        carbs: acc.carbs + (row.total_carbs as number ?? 0),
        fats: acc.fats + (row.total_fats as number ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  },

  // Get nutrition targets
  async getTargets(userId: string): Promise<NutritionTargets> {
    const { data, error } = await supabase
      .from('nutrition_targets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) return { calories: 2000, protein: 150, carbs: 200, fats: 65 }

    return {
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
    }
  },

  // Update nutrition targets
  async updateTargets(
    userId: string,
    targets: NutritionTargets
  ): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('nutrition_targets')
      .upsert({ user_id: userId, ...targets, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

    if (error) return { error: error.message }
    return { error: null }
  },

  // ─── AI & Personalization Logic ─────────────────────────────────────────────

  // Calculate personalized targets based on profile
  calculatePersonalizedTargets(user: {
    weightKg?: number,
    heightCm?: number,
    age?: number,
    goal?: string,
    fitnessLevel?: string
  }): NutritionTargets {
    // Default values if data is missing
    const weight = user.weightKg ?? 70;
    const height = user.heightCm ?? 175;
    const age = user.age ?? 25;
    
    // Mifflin-St Jeor Equation for BMR (Male default as base)
    // BMR = 10 * weight + 6.25 * height - 5 * age + 5
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    
    // Activity Factor (Mapping fitness level to factor)
    const activityFactors: Record<string, number> = {
      'beginner': 1.2,       // Sedentary/Light
      'intermediate': 1.55,  // Moderate
      'advanced': 1.725      // Very Active
    };
    const factor = activityFactors[user.fitnessLevel || 'beginner'] || 1.375;
    let tdee = bmr * factor;

    // Adjust based on goal
    let calories = tdee;
    let proteinPct = 0.25;
    let carbPct = 0.45;
    let fatPct = 0.30;

    switch(user.goal) {
      case 'lose_weight':
        calories -= 500; // Deficit
        proteinPct = 0.35; // Higher protein for muscle preservation
        carbPct = 0.35;
        fatPct = 0.30;
        break;
      case 'gain_muscle':
        calories += 300; // Surplus
        proteinPct = 0.30;
        carbPct = 0.50;
        fatPct = 0.20;
        break;
      case 'improve_endurance':
        proteinPct = 0.20;
        carbPct = 0.60; // Higher carbs for performance
        fatPct = 0.20;
        break;
      default: // maintenance
        break;
    }

    // Convert Pct to Grams
    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fats: 9 kcal/g
    return {
      calories: Math.round(calories),
      protein: Math.round((calories * proteinPct) / 4),
      carbs: Math.round((calories * carbPct) / 4),
      fats: Math.round((calories * fatPct) / 9),
    };
  },

  // Suggest next meal based on remaining macros
  getSmartSuggestions(remaining: DailyMacros): { en: string; fr: string }[] {
    const suggestions: { en: string; fr: string }[] = [];
    
    if (remaining.protein > 30) {
      suggestions.push({ 
        en: "Focus on high-protein: Chicken breast, Greek yogurt, or a protein shake.",
        fr: "Priorisez les protéines : Blanc de poulet, yaourt grec ou un shake de whey."
      });
    }
    
    if (remaining.carbs > 50) {
      suggestions.push({
        en: "Need energy? Add some complex carbs like oats, brown rice, or sweet potato.",
        fr: "Besoin d'énergie ? Ajoutez des glucides complexes : avoine, riz complet ou patate douce."
      });
    }

    if (remaining.fats > 15) {
      suggestions.push({
        en: "Healthy fats needed: Handful of almonds or half an avocado.",
        fr: "Graisses saines requises : Une poignée d'amandes ou un demi-avocat."
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        en: "You're on track! Keep staying hydrated.",
        fr: "Vous êtes sur la bonne voie ! Pensez à bien vous hydrater."
      });
    }

    return suggestions;
  }
}
