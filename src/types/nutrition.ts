export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodItem {
  id: string;
  name: { en: string; fr: string };
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: number;
  unit: 'g' | 'ml' | 'piece';
}

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: { en: string; fr: string };
  quantity: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  mealType: MealType;
  timestamp: string;
}

export interface DailyNutrition {
  date: string;
  entries: MealEntry[];
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export const NUTRITION_VERSION = '1.0.0';
