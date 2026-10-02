import React, { createContext, useContext, useState, useEffect } from 'react';
import type { MealEntry, DailyNutrition, MealType, FoodItem } from '../types/nutrition';

import { useAuth } from './AuthContext';
import { nutritionService } from '../services/nutritionService';

interface NutritionContextType {
  dailyLog: MealEntry[];
  macroTotals: { calories: number; protein: number; carbs: number; fats: number };
  targets: { calories: number; protein: number; carbs: number; fats: number };
  addMeal: (entry: Omit<MealEntry, 'id' | 'timestamp' | 'macros'>, food: FoodItem) => void;
  removeFood: (id: string) => void;
  updateFood: (id: string, quantity: number) => void;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [dailyLog, setDailyLog] = useState<MealEntry[]>([]);
  const [targets, setTargets] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 70
  });

  const [macroTotals, setMacroTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  // Calculate personalized targets and fetch daily logs whenever user profile changes
  useEffect(() => {
    async function loadNutritionData() {
      if (user) {
        // 1. Calculate Targets
        const personalTargets = nutritionService.calculatePersonalizedTargets({
          weightKg: user.weightKg,
          heightCm: user.heightCm,
          age: user.age,
          goal: user.goal,
          fitnessLevel: user.fitnessLevel
        });
        setTargets(personalTargets);
        nutritionService.updateTargets(user.id, personalTargets);

        // 2. Fetch Today's Logs
        const logs = await nutritionService.getDailyLog(user.id);
        setDailyLog(logs);
      }
    }
    loadNutritionData();
  }, [user]);

  useEffect(() => {
    const totals = dailyLog.reduce((acc, entry) => ({
      calories: acc.calories + entry.macros.calories,
      protein: acc.protein + entry.macros.protein,
      carbs: acc.carbs + entry.macros.carbs,
      fats: acc.fats + entry.macros.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    
    setMacroTotals(totals);
  }, [dailyLog]);

  const addMeal = async (entry: Omit<MealEntry, 'id' | 'timestamp' | 'macros' | 'foodName' | 'foodId'>, food: FoodItem) => {
    if (!user) return;

    try {
      const { error } = await nutritionService.logMeal(
        user.id,
        food,
        entry.quantity,
        entry.mealType
      );

      if (!error) {
        // Refresh logs to get the newly added entry with its ID from DB
        const logs = await nutritionService.getDailyLog(user.id);
        setDailyLog(logs);
      }
    } catch (error) {
      console.error('Failed to log meal:', error);
    }
  };

  const removeFood = async (id: string) => {
    try {
      await nutritionService.removeMeal(id);
      setDailyLog(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to remove meal:', error);
    }
  };

  const updateFood = (id: string, quantity: number) => {
    setDailyLog(prev => prev.map(entry => {
      if (entry.id === id) {
        const factor = quantity / entry.quantity;
        return {
          ...entry,
          quantity,
          macros: {
            calories: entry.macros.calories * factor,
            protein: entry.macros.protein * factor,
            carbs: entry.macros.carbs * factor,
            fats: entry.macros.fats * factor,
          }
        };
      }
      return entry;
    }));
  };

  return (
    <NutritionContext.Provider value={{ dailyLog, macroTotals, targets, addMeal, removeFood, updateFood }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) throw new Error('useNutrition must be used within NutritionProvider');
  return context;
};
