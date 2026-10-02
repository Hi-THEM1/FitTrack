import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../context/WorkoutSessionContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import WorkoutHeader from '../components/workout/WorkoutHeader';
import SetLogger from '../components/workout/SetLogger';
import RestTimer from '../components/workout/RestTimer';
import SummaryCard from '../components/workout/SummaryCard';
import PlateMathVisualizer from '../components/workout/PlateMathVisualizer';
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

export default function WorkoutExecutionPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const {
    currentWorkout, sessionState, currentExerciseIndex, elapsedTime,
    nextExercise, prevExercise, finishWorkout, pauseSession, skipRest
  } = useWorkoutSession();

  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const lang = language as 'en' | 'fr';

  if (!currentWorkout) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
        <h2 className="font-display text-2xl text-text-main uppercase mb-4 tracking-widest">
          {lang === 'fr' ? 'SYNCHRONISATION...' : 'SYNCHRONIZING...'}
        </h2>
        <div className="w-64 h-[2px] bg-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary shimmer" />
        </div>
      </div>
    );
  }

  if (sessionState === 'complete') {
    return <SummaryCard session={currentWorkout} onFinish={() => navigate('/dashboard')} />;
  }

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const isLast = currentExerciseIndex === currentWorkout.exercises.length - 1;
  const activeSet = currentExercise.sets.find(s => !s.isCompleted) || currentExercise.sets[currentExercise.sets.length - 1];

  return (
    <div className="min-h-screen bg-canvas text-text-main overflow-hidden flex flex-col spatial-container">
      {/* TOP HUD BAR */}
      <header className="h-20 flex items-center justify-between px-6 z-30 shrink-0 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsQuitModalOpen(true)} className="text-text-muted hover:text-text-main transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <span className="font-micro text-[10px] text-primary font-black tracking-[0.2em]">{currentWorkout.name.toUpperCase()}</span>
            <span className="font-display text-xs text-text-dim uppercase tracking-widest">{currentExerciseIndex + 1} OF {currentWorkout.exercises.length}</span>
          </div>
        </div>

        {/* REST TIMER PILL */}
        <div className="flex-1 flex justify-center">
          {sessionState === 'resting' ? (
            <RestTimer onSkip={skipRest} />
          ) : (
            <div className="glass-card px-6 py-2 rounded-full border border-border bg-surface/50">
              <span className="font-hero text-xl text-text-main">
                {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        <button className="text-text-muted hover:text-text-main">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-10 md:px-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* EXERCISE HEADER */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-black text-text-main uppercase tracking-tighter mb-2">
              {lang === 'fr' ? currentExercise.name.fr : currentExercise.name.en}
            </h1>
            <span className="font-micro text-text-dim tracking-[0.3em]">
              SET {currentExercise.sets.filter(s => s.isCompleted).length + 1} OF {currentExercise.sets.length}
            </span>
          </div>

          {/* WEIGHT DISPLAY (HERO) */}
          <div className="relative mb-12 flex flex-col items-center group">
            <div className="flex items-baseline gap-4">
              <span className={`font-hero text-[18vw] leading-none text-text-main ${theme === 'dark' ? 'tracking-[0.15em] animate-pulse-orange' : 'ink-underline'}`}>
                {activeSet.weight}
              </span>
              <span className="font-micro text-text-dim text-xl tracking-[0.2em]">KG</span>
            </div>
            
            {/* PLATE MATH VISUALIZER */}
            <div className="mt-4 transition-all duration-500 group-hover:scale-110">
              <PlateMathVisualizer weight={activeSet.weight} />
            </div>
          </div>

          {/* TARGET ROW */}
          <div className="w-full max-w-md flex items-center justify-center gap-12 mb-12 py-6 border-y border-border">
            <div className="flex flex-col items-center">
              <span className="font-micro text-[10px] text-text-dim mb-1">TARGET</span>
              <span className="font-hero text-2xl text-text-main">{activeSet.reps} REPS</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
              <span className="font-micro text-[10px] text-text-dim mb-1">RPE</span>
              <span className="font-hero text-2xl text-primary">8.5</span>
            </div>
          </div>

          {/* PREVIOUS SETS PANEL */}
          <section className="w-full max-w-2xl mb-12">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-text-dim" />
              <span className="font-micro text-[10px] text-text-dim tracking-widest uppercase">PREVIOUS SESSIONS</span>
            </div>
            <div className="glass-card p-6 bg-surface/30 space-y-4">
              <div className="flex items-center justify-between font-micro text-[10px] text-text-dim border-b border-border pb-2">
                <span>HISTORY</span>
                <span>VOLUME</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Last Session: 275 × 5 (RPE 7)</span>
                <span className="font-hero text-text-main">625 KG</span>
              </div>
            </div>
          </section>

          <div className="w-full max-w-2xl">
            <SetLogger exercise={currentExercise} exerciseIndex={currentExerciseIndex} />
          </div>
        </div>
      </main>

      {/* FOOTER NAV */}
      <nav className="h-24 px-8 border-t border-border flex items-center justify-between bg-canvas z-40">
        <button 
          onClick={prevExercise} 
          disabled={currentExerciseIndex === 0}
          className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-surface/50 disabled:opacity-20 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex gap-2">
          {currentWorkout.exercises.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentExerciseIndex ? 'w-12 bg-primary shadow-[0_0_10px_rgba(255,77,0,0.4)]' : 'w-2 bg-border'}`} />
          ))}
        </div>

        {isLast ? (
          <button 
            onClick={finishWorkout}
            className="h-14 px-10 rounded-full bg-success text-white font-display font-black uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(0,200,83,0.3)] hover:shadow-[0_15px_30px_rgba(0,200,83,0.5)] hover:-translate-y-1 transition-all"
          >
            {lang === 'fr' ? 'TERMINER' : 'FINISH'}
          </button>
        ) : (
          <button 
            onClick={nextExercise}
            className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-surface/50 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </nav>

      {/* QUIT MODAL */}
      {isQuitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-md" onClick={() => setIsQuitModalOpen(false)} />
          <div className="relative glass-card p-10 max-w-md w-full border border-primary/20 animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-3xl font-black text-text-main uppercase text-center mb-4">{lang === 'fr' ? 'QUITTER ?' : 'QUIT SESSION?'}</h3>
            <p className="text-text-muted text-center mb-10 leading-relaxed">{lang === 'fr' ? 'Toute progression non enregistrée sera perdue.' : 'Any unsaved progress will be permanently lost.'}</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => navigate('/dashboard')} className="h-16 rounded-full bg-primary text-white font-display font-black uppercase tracking-widest shadow-xl">{lang === 'fr' ? 'ABANDONNER' : 'QUIT WORKOUT'}</button>
              <button onClick={() => setIsQuitModalOpen(false)} className="h-16 rounded-full border border-border text-text-main font-display font-black uppercase tracking-widest">{lang === 'fr' ? 'CONTINUER' : 'CONTINUE'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-pulse-orange { animation: pulse-orange 2s infinite; }
        .ink-underline { border-bottom: 4px solid var(--primary); padding-bottom: 8px; }
      `}</style>
    </div>
  );
}
