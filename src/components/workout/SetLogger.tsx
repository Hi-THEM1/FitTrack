import React from 'react';
import { useWorkoutSession } from '../../context/WorkoutSessionContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { ExerciseInSession } from '../../types/fitness';
import { Check, Plus, Minus } from 'lucide-react';

interface SetLoggerProps {
  exercise: ExerciseInSession;
  exerciseIndex: number;
}

export default function SetLogger({ exercise, exerciseIndex }: SetLoggerProps) {
  const { logSet, completeSet } = useWorkoutSession();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const lang = language as 'en' | 'fr';

  const handleUpdate = (setIndex: number, field: 'weight' | 'reps', value: number) => {
    logSet(exerciseIndex, { id: exercise.sets[setIndex].id, [field]: Math.max(0, value) });
  };

  return (
    <div className="flex flex-col gap-6">
      {exercise.sets.map((set, i) => (
        <div
          key={set.id}
          className={`glass-card p-6 flex flex-col gap-6 transition-all duration-500 border-l-4 ${
            set.isCompleted ? 'border-l-success bg-success/5' : 'border-l-border bg-surface/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-micro text-[10px] text-text-muted tracking-widest uppercase">SET {i + 1}</span>
            {set.isCompleted && (
              <span className="font-micro text-[9px] text-success font-black">COMPLETED</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Weight Control */}
            <div className="flex flex-col gap-3">
              <span className="font-micro text-[10px] text-text-dim">{lang === 'fr' ? 'POIDS (KG)' : 'WEIGHT (KG)'}</span>
              <div className="flex items-center justify-between bg-canvas/50 rounded-2xl p-2 border border-border">
                <button onClick={() => handleUpdate(i, 'weight', set.weight - 5)} disabled={set.isCompleted} className="w-10 h-10 rounded-xl hover:bg-surface/50 text-text-muted disabled:opacity-20 transition-all active:scale-90">
                  <Minus className="w-4 h-4 mx-auto" />
                </button>
                <input 
                  type="number" 
                  value={set.weight} 
                  onChange={e => handleUpdate(i, 'weight', parseFloat(e.target.value) || 0)}
                  disabled={set.isCompleted}
                  className="w-16 bg-transparent text-center font-hero text-2xl text-text-main focus:outline-none"
                />
                <button onClick={() => handleUpdate(i, 'weight', set.weight + 5)} disabled={set.isCompleted} className="w-10 h-10 rounded-xl hover:bg-surface/50 text-text-muted disabled:opacity-20 transition-all active:scale-90">
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Reps Control */}
            <div className="flex flex-col gap-3">
              <span className="font-micro text-[10px] text-text-dim">{lang === 'fr' ? 'RÉPÉTITIONS' : 'REPS'}</span>
              <div className="flex items-center justify-between bg-canvas/50 rounded-2xl p-2 border border-border">
                <button onClick={() => handleUpdate(i, 'reps', set.reps - 1)} disabled={set.isCompleted} className="w-10 h-10 rounded-xl hover:bg-surface/50 text-text-muted disabled:opacity-20 transition-all active:scale-90">
                  <Minus className="w-4 h-4 mx-auto" />
                </button>
                <input 
                  type="number" 
                  value={set.reps} 
                  onChange={e => handleUpdate(i, 'reps', parseInt(e.target.value) || 0)}
                  disabled={set.isCompleted}
                  className="w-16 bg-transparent text-center font-hero text-2xl text-text-main focus:outline-none"
                />
                <button onClick={() => handleUpdate(i, 'reps', set.reps + 1)} disabled={set.isCompleted} className="w-10 h-10 rounded-xl hover:bg-surface/50 text-text-muted disabled:opacity-20 transition-all active:scale-90">
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => completeSet(exerciseIndex, i)}
            disabled={set.isCompleted}
            className={`h-16 rounded-2xl font-display font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
              set.isCompleted 
                ? 'bg-success/20 text-success border border-success/30' 
                : 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40'
            }`}
          >
            {set.isCompleted ? (
              <Check className="w-5 h-5" />
            ) : (
              lang === 'fr' ? `✓ VALIDER LA SÉRIE — ${set.reps} × ${set.weight}` : `✓ LOG SET — ${set.reps} × ${set.weight}`
            )}
          </button>
        </div>
      ))}

      <button
        onClick={() => logSet(exerciseIndex, {
          id: Date.now().toString(),
          weight: exercise.sets[exercise.sets.length - 1]?.weight ?? 0,
          reps:   exercise.sets[exercise.sets.length - 1]?.reps   ?? 0,
          isCompleted: false,
          timestamp: new Date().toISOString()
        })}
        className="h-16 rounded-2xl border-2 border-dashed border-border text-text-muted font-micro text-xs tracking-widest hover:border-primary/40 hover:text-primary transition-all"
      >
        + ADD SET
      </button>
    </div>
  );
}
