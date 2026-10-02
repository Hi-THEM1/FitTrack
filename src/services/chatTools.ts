import { supabase } from '../lib/supabaseClient'
import { nutritionService } from './nutritionService'
import { workoutService } from './workoutService'
import { exerciseService } from './exerciseService'
import { gamificationService } from './gamificationService'

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export const toolDefinitions: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_user_profile',
      description: 'Get the current user profile including weight, height, age, goal, and fitness level.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_user_profile',
      description: 'Update user profile fields like weight (kg), height (cm), age, goal (lose_weight | gain_muscle | maintenance | improve_endurance), or fitness level (beginner | intermediate | advanced).',
      parameters: {
        type: 'object',
        properties: {
          weight_kg: { type: 'number', description: 'Weight in kilograms' },
          height_cm: { type: 'number', description: 'Height in centimeters' },
          age: { type: 'number', description: 'Age in years' },
          goal: { type: 'string', enum: ['lose_weight', 'gain_muscle', 'maintenance', 'improve_endurance'] },
          fitness_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_nutrition_today',
      description: "Get the user's logged meals and macro totals for today.",
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_nutrition_targets',
      description: "Get the user's daily calorie and macro targets.",
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_food',
      description: 'Search the food database by name. Returns food items with their calories and macros per serving.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Food name to search for (e.g. "chicken", "rice", "banana")' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_meal',
      description: 'Log a meal for the user. Requires a food_id from search_food results, a quantity, and a meal type.',
      parameters: {
        type: 'object',
        properties: {
          food_id: { type: 'string', description: 'UUID of the food item from search_food results' },
          quantity: { type: 'number', description: 'Quantity in the food item unit (grams, ml, or pieces)' },
          meal_type: { type: 'string', enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
        },
        required: ['food_id', 'quantity', 'meal_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_meal',
      description: 'Remove a logged meal entry by its ID.',
      parameters: {
        type: 'object',
        properties: {
          meal_entry_id: { type: 'string', description: 'UUID of the meal entry to remove' },
        },
        required: ['meal_entry_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_workout_history',
      description: "Get the user's recent workout history (last N workouts).",
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of recent workouts to fetch (default 5)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_exercises',
      description: 'Search the exercise library by name or category. Returns exercises with muscles, difficulty, and instructions.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Exercise name to search for' },
          category: { type: 'string', description: 'Filter by category (Chest, Back, Shoulders, Arms, Legs, Core, Full Body)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_user_stats',
      description: "Get the user's gamification stats: XP, level, streak, and achievements.",
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
]

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<string> {
  try {
    switch (toolName) {
      case 'get_user_profile':
        return await getUserProfile(userId)
      case 'update_user_profile':
        return await updateUserProfile(userId, args)
      case 'get_nutrition_today':
        return await getNutritionToday(userId)
      case 'get_nutrition_targets':
        return await getNutritionTargets(userId)
      case 'search_food':
        return await searchFood(args.query as string)
      case 'log_meal':
        return await logMeal(userId, args)
      case 'remove_meal':
        return await removeMeal(args.meal_entry_id as string)
      case 'get_workout_history':
        return await getWorkoutHistory(userId, (args.limit as number) || 5)
      case 'search_exercises':
        return await searchExercises(userId, args)
      case 'get_user_stats':
        return await getUserStats(userId)
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }
  } catch (err: any) {
    return JSON.stringify({ error: err.message || 'Tool execution failed' })
  }
}

async function getUserProfile(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return JSON.stringify({ error: error.message })

  return JSON.stringify({
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    goal: data.goal,
    fitness_level: data.fitness_level,
    weight_kg: data.weight_kg,
    height_cm: data.height_cm,
    age: data.age,
  })
}

async function updateUserProfile(userId: string, args: Record<string, unknown>): Promise<string> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (args.weight_kg !== undefined) updates.weight_kg = args.weight_kg
  if (args.height_cm !== undefined) updates.height_cm = args.height_cm
  if (args.age !== undefined) updates.age = args.age
  if (args.goal !== undefined) updates.goal = args.goal
  if (args.fitness_level !== undefined) updates.fitness_level = args.fitness_level

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) return JSON.stringify({ error: error.message })

  if (args.weight_kg || args.height_cm || args.age || args.goal || args.fitness_level) {
    const profile = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (profile.data) {
      const targets = nutritionService.calculatePersonalizedTargets({
        weightKg: profile.data.weight_kg,
        heightCm: profile.data.height_cm,
        age: profile.data.age,
        goal: profile.data.goal,
        fitnessLevel: profile.data.fitness_level,
      })
      await nutritionService.updateTargets(userId, targets)
    }
  }

  return JSON.stringify({ success: true, updated_fields: Object.keys(updates).filter(k => k !== 'updated_at') })
}

async function getNutritionToday(userId: string): Promise<string> {
  const meals = await nutritionService.getDailyLog(userId)
  const macros = await nutritionService.getTodaysMacros(userId)

  return JSON.stringify({
    meals: meals.map(m => ({
      id: m.id,
      food_name: m.foodName,
      quantity: m.quantity,
      meal_type: m.mealType,
      calories: m.macros.calories,
      protein: m.macros.protein,
      carbs: m.macros.carbs,
      fats: m.macros.fats,
    })),
    totals: macros,
  })
}

async function getNutritionTargets(userId: string): Promise<string> {
  const targets = await nutritionService.getTargets(userId)
  return JSON.stringify(targets)
}

async function searchFood(query: string): Promise<string> {
  const results = await nutritionService.searchFood(query)
  return JSON.stringify(
    results.slice(0, 10).map(f => ({
      id: f.id,
      name: f.name,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fats: f.fats,
      serving_size: f.servingSize,
      unit: f.unit,
    }))
  )
}

async function logMeal(userId: string, args: Record<string, unknown>): Promise<string> {
  const foodId = args.food_id as string
  const quantity = args.quantity as number
  const mealType = args.meal_type as string

  const { data: foodRow, error: foodErr } = await supabase
    .from('food_items')
    .select('*')
    .eq('id', foodId)
    .single()

  if (foodErr || !foodRow) return JSON.stringify({ error: 'Food item not found' })

  const food = {
    id: foodRow.id,
    name: { en: foodRow.name_en, fr: foodRow.name_fr },
    calories: foodRow.calories,
    protein: foodRow.protein,
    carbs: foodRow.carbs,
    fats: foodRow.fats,
    servingSize: foodRow.serving_size,
    unit: foodRow.unit,
  }

  const { error } = await nutritionService.logMeal(userId, food, quantity, mealType as any)

  if (error) return JSON.stringify({ error })

  const multiplier = quantity / food.servingSize
  return JSON.stringify({
    success: true,
    logged: {
      food_name: food.name,
      quantity,
      meal_type: mealType,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fats: Math.round(food.fats * multiplier * 10) / 10,
    },
  })
}

async function removeMeal(entryId: string): Promise<string> {
  const { error } = await nutritionService.removeMeal(entryId)
  if (error) return JSON.stringify({ error })
  return JSON.stringify({ success: true, removed_id: entryId })
}

async function getWorkoutHistory(userId: string, limit: number): Promise<string> {
  const history = await workoutService.getHistory(userId, limit)
  return JSON.stringify(
    history.map(h => ({
      id: h.id,
      name: h.name,
      date: h.startTime,
      duration_minutes: Math.round(h.durationSeconds / 60),
      total_volume_kg: h.totalVolume,
      xp_earned: h.xpEarned,
      exercise_count: h.exerciseCount,
    }))
  )
}

async function searchExercises(userId: string, args: Record<string, unknown>): Promise<string> {
  const results = await exerciseService.getAll({
    userId,
    search: args.query as string | undefined,
    category: args.category as string | undefined,
  })

  return JSON.stringify(
    results.slice(0, 10).map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      equipment: ex.equipment,
      muscles: ex.muscles.map(m => m.name.en),
    }))
  )
}

async function getUserStats(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return JSON.stringify({ xp: 0, level: 1, streak_days: 0, streak_status: 'active' })
  }

  return JSON.stringify({
    xp: data.xp ?? 0,
    level: data.level ?? 1,
    xp_to_next_level: data.xp_to_next_level ?? 1000,
    streak_days: data.streak_days ?? 0,
    streak_status: data.streak_status ?? 'active',
  })
}
