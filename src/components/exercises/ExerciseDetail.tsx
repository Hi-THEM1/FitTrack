import React, { useState } from 'react';
import { X, Info, CheckCircle2, Plus, ChevronRight, Dumbbell, Trash2 } from 'lucide-react';
import type { Exercise } from '../../types/fitness';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../../context/WorkoutSessionContext';
import { useAuth } from '../../context/AuthContext';
import { exerciseService } from '../../services/exerciseService';

interface ExerciseDetailProps {
  exercise: Exercise & { userId?: string };
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const difficultyColors: Record<string, string> = {
  Beginner:     'text-success bg-success/10 border-success/20',
  Intermediate: 'text-gold bg-gold/10 border-gold/20',
  Advanced:     'text-danger bg-danger/10 border-danger/20',
};

export default function ExerciseDetail({ exercise, onClose, onDelete }: ExerciseDetailProps) {
  const { language } = useLanguage();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const { startSession } = useWorkoutSession();
  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const name         = language === 'fr' ? exercise.name.fr        : exercise.name.en;
  const instructions = language === 'fr' ? exercise.instructions.fr : exercise.instructions.en;
  const primaryMuscles   = exercise.muscles.filter(m => m.isPrimary);
  const secondaryMuscles = exercise.muscles.filter(m => !m.isPrimary);

  const isOwner = user && exercise.userId === user.id;

  const handleDelete = async () => {
    if (!window.confirm(language === 'fr' ? 'Supprimer cet exercice ?' : 'Delete this exercise?')) return;
    setIsDeleting(true);
    try {
      const success = await exerciseService.delete(exercise.id);
      if (success) {
        onDelete?.(exercise.id);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToWorkout = async () => {
    await startSession({
      id: `quick-${exercise.id}`,
      name: { en: exercise.name.en, fr: exercise.name.fr },
      description: { en: '', fr: '' },
      targetMuscles: primaryMuscles.map(m => m.name.en),
      estimatedDuration: 30,
      exercises: [exercise],
    } as any);
    navigate(`/workout/active/quick-${exercise.id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="glass-card relative w-full max-w-4xl max-h-[92vh] rounded-3xl border border-secondary-bg shadow-2xl overflow-hidden flex flex-col"
        style={{ animation: 'modalIn 200ms ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-start px-8 py-6 bg-surface/60 backdrop-blur-md border-b border-white/5">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-text-main uppercase tracking-tight leading-none">{name}</h2>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${difficultyColors[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
              {exercise.equipment.map(eq => (
                <span key={eq} className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/10 text-text-muted">
                  {eq}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-text-muted transition-colors mt-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Media + Muscles */}
            <div className="p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-white/5">
              {/* Media */}
              <div className="aspect-video w-full bg-surface rounded-2xl overflow-hidden border border-white/5 relative">
                {!imgError && exercise.mediaUrl ? (
                  <img
                    src={exercise.mediaUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center">
                      <Dumbbell className="w-10 h-10 text-warning" />
                    </div>
                  </div>
                )}
              </div>

              {/* Muscles */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                {primaryMuscles.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-text-muted mb-2">Muscles Primaires</p>
                    <div className="flex flex-wrap gap-2">
                      {primaryMuscles.map(m => (
                        <span key={m.id} className="px-3 py-1 rounded-full bg-warning/15 border border-warning/30 text-warning text-xs font-bold uppercase">
                          {language === 'fr' ? m.name.fr : m.name.en}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {secondaryMuscles.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-text-muted mb-2">Muscles Secondaires</p>
                    <div className="flex flex-wrap gap-2">
                      {secondaryMuscles.map(m => (
                        <span key={m.id} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-text-muted text-xs font-bold uppercase">
                          {language === 'fr' ? m.name.fr : m.name.en}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Instructions + Tips */}
            <div className="p-8 space-y-6">
              <section>
                <h3 className="font-display text-lg font-bold text-text-main uppercase mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-success" />
                  {language === 'fr' ? 'Instructions' : 'Instructions'}
                </h3>
                <div className="space-y-3">
                  {instructions.map((step, i) => (
                    <div key={i} className="flex gap-3 text-sm text-text-muted leading-relaxed">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="font-mono text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Bilingual Pro Tip */}
              <section>
                <h3 className="font-display text-lg font-bold text-text-main uppercase mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  {language === 'fr' ? 'Conseil Pro' : 'Pro Tip'}
                </h3>
                <div className="p-5 rounded-2xl bg-success/5 border border-success/15 space-y-3">
                  <p className="text-sm text-text-main leading-relaxed">
                    "Focus on the mind-muscle connection during the squeeze."
                  </p>
                  <div className="h-px bg-success/10" />
                  <p className="text-sm text-text-muted leading-relaxed italic">
                    "Concentrez-vous sur la connexion esprit-muscle pendant la contraction."
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 px-8 py-5 bg-surface/60 backdrop-blur-md border-t border-white/5 flex gap-3">
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-4 bg-danger/10 text-danger border border-danger/20 rounded-2xl hover:bg-danger/20 transition-all disabled:opacity-50"
              title={language === 'fr' ? 'Supprimer' : 'Delete'}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleAddToWorkout}
            className="flex-1 py-4 bg-warning text-white font-bold rounded-2xl uppercase tracking-widest shadow-[0_0_25px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {language === 'fr' ? 'Commencer cet exercice' : 'Start this exercise'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
