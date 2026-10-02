import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useNutrition } from '../context/NutritionContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Trash2, Plus, Search, Apple, Coffee, Utensils, Pizza } from 'lucide-react';
import { nutritionService } from '../services/nutritionService';

export default function NutritionPage() {
  const { dailyLog, macroTotals, targets, removeFood, addMeal } = useNutrition();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const lang = language as 'en' | 'fr';

  const [activeMealType, setActiveMealType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isSanctuary = theme === 'light';

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const delay = setTimeout(async () => {
      setLoading(true);
      const res = await nutritionService.searchFood(searchQuery);
      setSearchResults(res);
      setLoading(false);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleAddFood = (food: any) => {
    if (activeMealType) {
      addMeal({ 
        quantity: food.servingSize,
        mealType: activeMealType as any
      } as any, food);
      setActiveMealType(null);
      setSearchQuery('');
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-10">
        <header>
          <h1 className="font-display text-5xl font-black text-text-main uppercase tracking-tighter">
            {lang === 'fr' ? 'NUTRITION' : 'NUTRITION'}
          </h1>
        </header>

        {/* MACRO SUMMARY — THE PLATE */}
        <section className="flex flex-col items-center justify-center py-10">
          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            {/* Dark Mode: Neon Rings */}
            {!isSanctuary ? (
              <div className="absolute inset-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="150" cy="150" r="100" fill="none" stroke="#FF4D00" strokeWidth="8" strokeDasharray="628" strokeDashoffset={628 * (1 - macroTotals.protein / targets.protein)} className="opacity-80" style={{ filter: 'blur(1px)' }} />
                  <circle cx="150" cy="150" r="115" fill="none" stroke="#00C853" strokeWidth="8" strokeDasharray="722" strokeDashoffset={722 * (1 - macroTotals.carbs / targets.carbs)} className="opacity-80" style={{ filter: 'blur(1px)' }} />
                  <circle cx="150" cy="150" r="130" fill="none" stroke="#FF6D00" strokeWidth="8" strokeDasharray="816" strokeDashoffset={816 * (1 - macroTotals.fats / targets.fats)} className="opacity-80" style={{ filter: 'blur(1px)' }} />
                </svg>
              </div>
            ) : (
              /* Light Mode: Watercolor Circle */
              <div 
                className="absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse" 
                style={{ background: 'radial-gradient(circle, rgba(230,81,0,0.2) 0%, rgba(230,81,0,0) 70%)' }} 
              />
            )}
            
            <div className="glass-card w-56 h-56 rounded-full flex flex-col items-center justify-center text-center p-6 border-2 border-white/5">
              <span className="font-micro text-[10px] text-text-dim mb-2 uppercase tracking-[0.2em]">{lang === 'fr' ? 'CALORIES' : 'CALORIES'}</span>
              <span className="font-hero text-4xl text-text-main leading-none">{macroTotals.calories.toFixed(0)}</span>
              <div className="w-12 h-px bg-border my-4" />
              <span className="font-hero text-sm text-text-dim uppercase tracking-widest">{targets.calories}</span>
            </div>
          </div>

          {/* Light Mode Macro Bars */}
          {isSanctuary && (
            <div className="mt-12 w-full max-w-md grid grid-cols-3 gap-6">
              {[
                { label: 'PROT', val: macroTotals.protein, target: targets.protein },
                { label: 'CARB', val: macroTotals.carbs, target: targets.carbs },
                { label: 'FAT', val: macroTotals.fats, target: targets.fats }
              ].map(m => (
                <div key={m.label} className="flex flex-col gap-2">
                  <div className="flex justify-between font-micro text-[9px] text-text-dim">
                    <span>{m.label}</span>
                    <span>{m.val.toFixed(0)}g</span>
                  </div>
                  <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(m.val / m.target) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MEAL ENTRIES */}
        <section className="grid grid-cols-1 gap-6">
          {[
            { id: 'Breakfast', icon: Coffee, label: { fr: 'Petit-déjeuner', en: 'Breakfast' } },
            { id: 'Lunch', icon: Utensils, label: { fr: 'Déjeuner', en: 'Lunch' } },
            { id: 'Snack', icon: Apple, label: { fr: 'Collation', en: 'Snack' } },
            { id: 'Dinner', icon: Pizza, label: { fr: 'Dîner', en: 'Dinner' } }
          ].map(meal => {
            const entries = dailyLog.filter(e => e.mealType === meal.id);
            const total = entries.reduce((acc, e) => acc + e.macros.calories, 0);
            
            return (
              <div key={meal.id} className="glass-card overflow-hidden group hover:border-primary/20 transition-all duration-500">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface/50 border border-border flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                      <meal.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-text-main uppercase">{lang === 'fr' ? meal.label.fr : meal.label.en}</h3>
                      <p className="font-micro text-[10px] text-text-dim">{entries.length} {lang === 'fr' ? 'ALIMENTS' : 'ITEMS'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-hero text-xl text-text-main">{total.toFixed(0)} <span className="text-xs text-text-dim">CAL</span></span>
                    <button 
                      onClick={() => setActiveMealType(meal.id)}
                      className="w-10 h-10 rounded-full bg-surface/50 border border-border flex items-center justify-center text-text-muted hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {entries.length > 0 && (
                  <div className="px-6 pb-6 space-y-3">
                    {entries.map(e => (
                      <div key={e.id} className="p-4 rounded-2xl bg-surface/30 border border-border flex items-center justify-between group/item">
                        <div>
                          <p className="font-bold text-sm text-text-main">{lang === 'fr' ? e.foodName.fr : e.foodName.en}</p>
                          <p className="font-micro text-[9px] text-text-dim">P:{Math.round(e.macros.protein)}g C:{Math.round(e.macros.carbs)}g F:{Math.round(e.macros.fats)}g</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-hero text-sm text-text-muted">{Math.round(e.macros.calories)}</span>
                          <button onClick={() => removeFood(e.id)} className="text-text-dim hover:text-primary transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* QUICK ADD SHEET */}
        {activeMealType && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setActiveMealType(null)} />
            <div className="relative glass-card w-full max-w-2xl h-[80vh] rounded-t-[40px] border-t-2 border-primary/20 p-8 flex flex-col gap-8 animate-in slide-in-from-bottom-20 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-black text-text-main uppercase">{lang === 'fr' ? 'AJOUTER' : 'ADD MEAL'}</h3>
                <button onClick={() => setActiveMealType(null)} className="text-text-dim hover:text-text-main">CLOSE</button>
              </div>

              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
                <input 
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={lang === 'fr' ? 'Rechercher un aliment...' : 'Search for food...'}
                  className="w-full h-16 pl-14 pr-6 rounded-3xl bg-surface/50 border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {loading ? (
                  <div className="p-10 text-center font-micro text-text-dim animate-pulse tracking-widest">SCANNING DATABASE...</div>
                ) : (
                  searchResults.map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => handleAddFood(f)}
                      className="w-full p-6 rounded-3xl bg-surface/30 border border-border hover:border-primary/30 transition-all flex items-center justify-between group"
                    >
                      <div className="text-left">
                        <p className="font-display text-lg font-bold text-text-main uppercase">{lang === 'fr' ? f.name.fr : f.name.en}</p>
                        <p className="font-micro text-[10px] text-text-dim">PER {f.servingSize}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-hero text-xl text-text-main">{f.calories} <span className="text-xs text-text-dim">CAL</span></span>
                        <div className="flex gap-2 font-micro text-[9px] text-text-dim">
                          <span>P:{f.protein}g</span>
                          <span>C:{f.carbs}g</span>
                          <span>F:{f.fats}g</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
