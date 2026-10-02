export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Muscle {
  id: string;
  name: { en: string; fr: string };
  isPrimary: boolean;
}

export interface Exercise {
  id: string;
  name: { en: string; fr: string };
  category: string;
  equipment: string[];
  difficulty: Difficulty;
  muscles: Muscle[];
  instructions: { en: string[]; fr: string[] };
  mediaUrl?: string;
  lastPerformed?: string; // ISO Date
}

export interface SetLog {
  id: string;
  weight: number;
  reps: number;
  isCompleted: boolean;
  timestamp: string;
  previousWeight?: number;
  previousReps?: number;
}

export interface ExerciseInSession extends Exercise {
  sets: SetLog[];
}

export interface WorkoutTemplate {
  id: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  targetMuscles: string[];
  estimatedDuration: number; // minutes
  exercises: Exercise[];
}

export interface WorkoutSession {
  id: string;
  templateId?: string;
  name: string;
  startTime: string;
  endTime?: string;
  duration: number; // seconds
  exercises: ExerciseInSession[];
  totalVolume: number;
  xpEarned: number;
}

export const FITNESS_VERSION = '1.0.0';
