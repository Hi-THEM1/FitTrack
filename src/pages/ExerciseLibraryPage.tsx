import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ExerciseCard from '../components/exercises/ExerciseCard';
import ExerciseDetail from '../components/exercises/ExerciseDetail';
import MuscleMap from '../components/exercises/MuscleMap';
import { exerciseService } from '../services/exerciseService';
import type { Exercise } from '../types/fitness';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { History, Search, Plus, X, Upload, Save, ChevronRight, Filter, LayoutGrid } from 'lucide-react';

interface CustomExerciseForm {
  nameEn: string;
  nameFr: string;
  category: string;
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  muscles: string[];
  instructionsEn: string;
  instructionsFr: string;
  mediaUrl: string;
}

export default function ExerciseLibraryPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const lang = language as 'en' | 'fr';
  const { user } = useAuth();

  const [exercises, setExercises]           = useState<Exercise[]>([]);
  const [recentlyUsed, setRecentlyUsed]     = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [data, recent] = await Promise.all([
        exerciseService.getAll({ userId: user.id }),
        exerciseService.getRecentlyUsed(user.id),
      ]);
      setExercises(data);
      setRecentlyUsed(recent);
    } catch (err) {
      setError(lang === 'fr' ? 'Impossible de charger les exercices.' : 'Failed to load exercises.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (formData: CustomExerciseForm) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const newEx = await exerciseService.create(user.id, {
        name: { en: formData.nameEn, fr: formData.nameFr },
        category: formData.category,
        equipment: formData.equipment,
        difficulty: formData.difficulty,
        muscles: formData.muscles.map(m => ({ id: m, name: { en: m, fr: m }, isPrimary: true })),
        instructions: {
          en: formData.instructionsEn.split('\n').filter(s => s.trim()),
          fr: formData.instructionsFr.split('\n').filter(s => s.trim()),
        },
        mediaUrl: formData.mediaUrl
      });

      if (newEx) {
        setExercises(prev => [newEx as Exercise, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
    setRecentlyUsed(prev => prev.filter(ex => ex.id !== id));
  };

  const filteredExercises = exercises.filter(ex => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ex.name.en.toLowerCase().includes(q) ||
      ex.name.fr.toLowerCase().includes(q);
    const matchesMuscle =
      selectedFilter === 'All' ||
      ex.muscles.some(m => m.name.en === selectedFilter || m.name.fr === selectedFilter);
    return matchesSearch && matchesMuscle;
  });

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

  return (
    <MainLayout>
      <div className="flex flex-col gap-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl font-black text-text-main uppercase tracking-tighter">
              {lang === 'fr' ? 'BIBLIOTHÈQUE' : 'EXERCISES'}
            </h1>
            <p className="font-micro text-text-dim mt-2 tracking-widest uppercase">
              {lang === 'fr' ? '500+ exercices . 2.5D spatial navigation' : '500+ exercises . 2.5D spatial navigation'}
            </p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-14 px-8 bg-primary text-white rounded-2xl font-display font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            {lang === 'fr' ? 'CRÉER' : 'CREATE NEW'}
          </button>
        </header>

        {/* SEARCH & FILTERS */}
        <section className="flex flex-col gap-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim group-focus-within:text-primary transition-colors" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'fr' ? 'RECHERCHER UN EXERCICE...' : 'SEARCH EXERCISES...'}
              className="w-full h-16 pl-16 pr-8 bg-surface/50 border border-border rounded-2xl text-text-main font-display font-bold uppercase tracking-widest placeholder:text-text-dim focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`h-10 px-6 rounded-full border font-micro text-[10px] tracking-widest uppercase transition-all whitespace-nowrap ${
                  selectedFilter === cat 
                    ? 'bg-primary text-white border-primary shadow-[0_5px_15px_rgba(255,77,0,0.3)]' 
                    : 'bg-surface/30 border-border text-text-dim hover:text-text-main'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <main className="lg:col-span-8 flex flex-col gap-8">
            {recentlyUsed.length > 0 && !searchQuery && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-text-dim">
                  <History className="w-4 h-4" />
                  <span className="font-micro text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'fr' ? 'RÉCENTS' : 'RECENT'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recentlyUsed.map(ex => (
                    <ExerciseCard key={ex.id} exercise={ex} onClick={() => setSelectedExercise(ex)} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-dim">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="font-micro text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'fr' ? 'TOUS LES EXERCICES' : 'ALL EXERCISES'}</span>
                </div>
                <span className="font-micro text-[10px] text-text-dim">{filteredExercises.length} RESULTS</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => <div key={i} className="aspect-[4/3] rounded-3xl bg-surface/30 animate-pulse" />)}
                </div>
              ) : filteredExercises.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredExercises.map(ex => (
                    <ExerciseCard key={ex.id} exercise={ex} onClick={() => setSelectedExercise(ex)} />
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center gap-6 opacity-40">
                  <Search className="w-16 h-16 text-text-dim" />
                  <p className="font-display text-xl font-black text-text-dim uppercase">NO MATCHES FOUND</p>
                </div>
              )}
            </div>
          </main>

          <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-10">
            <div className="glass-card p-8 flex flex-col gap-8">
              <h3 className="font-display text-xl font-black text-text-main uppercase tracking-tight text-center">MUSCLE MAP</h3>
              <MuscleMap
                activeMuscle={selectedFilter.toLowerCase()}
                onMuscleClick={(id: string) => setSelectedFilter(id.charAt(0).toUpperCase() + id.slice(1))}
              />
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between font-micro text-[9px] text-text-dim uppercase tracking-widest border-b border-border pb-2">
                  <span>LEGEND</span>
                  <span>DIFF</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Beginner', color: 'bg-success' },
                    { label: 'Intermediate', color: 'bg-warning' },
                    { label: 'Advanced', color: 'bg-primary' }
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted font-bold uppercase">{d.label}</span>
                      <div className={`w-2 h-2 rounded-full ${d.color}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateExerciseModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateExercise}
          isSubmitting={isSubmitting}
          language={lang}
        />
      )}

      {selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onDelete={handleDeleteExercise}
        />
      )}
    </MainLayout>
  );
}

function CreateExerciseModal({ onClose, onSubmit, isSubmitting, language }: { 
  onClose: () => void; 
  onSubmit: (data: CustomExerciseForm) => void; 
  isSubmitting: boolean;
  language: 'en' | 'fr';
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CustomExerciseForm>({
    nameEn: '', nameFr: '', category: 'Chest', equipment: [], difficulty: 'Beginner',
    muscles: [], instructionsEn: '', instructionsFr: '', mediaUrl: ''
  });

  const categories = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Calves', 'Abs', 'Full Body'];
  const musclesList = ['Pectorals', 'Lats', 'Traps', 'Deltoids', 'Biceps', 'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-canvas/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-primary/10 animate-in zoom-in-95 duration-200">
        <div className="px-10 py-8 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-black text-text-main uppercase tracking-tighter">
              {language === 'fr' ? 'CRÉATION' : 'NEW EXERCISE'}
            </h2>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 w-8 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-surface/50 rounded-full transition-colors">
            <X className="w-6 h-6 text-text-dim" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">NAME (EN)</label>
                  <input value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} placeholder="e.g. Bench Press" className="w-full h-14 px-6 bg-surface/50 border border-border rounded-2xl text-text-main focus:outline-none focus:border-primary transition-all uppercase font-display font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">NOM (FR)</label>
                  <input value={formData.nameFr} onChange={e => setFormData({...formData, nameFr: e.target.value})} placeholder="ex: Développé Couché" className="w-full h-14 px-6 bg-surface/50 border border-border rounded-2xl text-text-main focus:outline-none focus:border-primary transition-all uppercase font-display font-bold" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">CATEGORY</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c} onClick={() => setFormData({...formData, category: c})} className={`h-10 px-6 rounded-full font-micro text-[10px] tracking-widest uppercase transition-all border ${formData.category === c ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface/30 border-border text-text-dim hover:text-text-main'}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">
              <div className="space-y-3">
                <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">TARGET MUSCLES</label>
                <div className="flex flex-wrap gap-2">
                  {musclesList.map(m => (
                    <button key={m} onClick={() => { const next = formData.muscles.includes(m) ? formData.muscles.filter(i => i !== m) : [...formData.muscles, m]; setFormData({...formData, muscles: next}); }} className={`h-10 px-6 rounded-full font-micro text-[10px] tracking-widest uppercase transition-all border ${formData.muscles.includes(m) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface/30 border-border text-text-dim hover:text-text-main'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">MEDIA URL (GIF/VIDEO)</label>
                <div className="relative">
                  <input value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} placeholder="https://..." className="w-full h-14 pl-14 pr-6 bg-surface/50 border border-border rounded-2xl text-text-main focus:outline-none focus:border-primary transition-all" />
                  <Upload className="w-5 h-5 text-text-dim absolute left-5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">
              <div className="space-y-3">
                <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">INSTRUCTIONS (EN)</label>
                <textarea rows={4} value={formData.instructionsEn} onChange={e => setFormData({...formData, instructionsEn: e.target.value})} className="w-full p-6 bg-surface/50 border border-border rounded-2xl text-text-main focus:outline-none focus:border-primary transition-all resize-none" />
              </div>
              <div className="space-y-3">
                <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">INSTRUCTIONS (FR)</label>
                <textarea rows={4} value={formData.instructionsFr} onChange={e => setFormData({...formData, instructionsFr: e.target.value})} className="w-full p-6 bg-surface/50 border border-border rounded-2xl text-text-main focus:outline-none focus:border-primary transition-all resize-none" />
              </div>
            </div>
          )}
        </div>

        <div className="px-10 py-8 border-t border-border flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="font-micro text-xs text-text-dim tracking-widest hover:text-text-main transition-colors uppercase">
            {step === 1 ? (language === 'fr' ? 'ANNULER' : 'CANCEL') : (language === 'fr' ? 'RETOUR' : 'BACK')}
          </button>

          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 1 && (!formData.nameEn || !formData.nameFr)} className="h-14 px-10 bg-primary text-white rounded-2xl font-display font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-30">
              {language === 'fr' ? 'SUIVANT' : 'NEXT STEP'} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => onSubmit(formData)} disabled={isSubmitting} className="h-14 px-10 bg-success text-white rounded-2xl font-display font-black uppercase tracking-widest text-xs shadow-lg shadow-success/20 hover:shadow-success/40 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-30">
              {isSubmitting ? '...' : <><Save className="w-5 h-5" /> {language === 'fr' ? 'ENREGISTRER' : 'SAVE'}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

