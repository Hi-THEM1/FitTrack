import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { workoutService } from '../services/workoutService';
import type { WorkoutSummary } from '../services/workoutService';
import { TrendingUp, Award, Target, LayoutGrid, Calendar } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useGamification } from '../context/GamificationContext';

export default function ProgressPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { stats: gamificationStats } = useGamification();
  const lang = language as 'en' | 'fr';
  const [history, setHistory] = useState<WorkoutSummary[]>([]);
  const [exercisePRs, setExercisePRs] = useState<{ name: string, pr: number, trend: number[] }[]>([]);
  const [volumeData, setVolumeData] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user) {
        const days = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 90;
        const [histData, prData, volData] = await Promise.all([
            workoutService.getHistory(user.id),
            workoutService.getExercisePRs(user.id),
            workoutService.getWeeklyVolume(user.id, days)
        ]);
        setHistory(histData);
        setExercisePRs(prData);
        setVolumeData(volData);
      }
      setLoading(false);
    }
    loadData();
  }, [user, timeRange]);

  const isSanctuary = theme === 'light';

  return (
    <MainLayout>
      <div className="flex flex-col gap-10">
        <header className="flex justify-between items-center">
          <h1 className="font-display text-5xl font-black text-text-main uppercase tracking-tighter">
            {lang === 'fr' ? 'PROGRÈS' : 'ANALYTICS'}
          </h1>
          <button 
            onClick={() => navigate('/exercise-library')}
            className="h-12 px-6 rounded-2xl bg-surface border border-border font-micro text-[10px] text-text-main hover:border-primary hover:text-primary transition-all uppercase tracking-widest"
          >
            {lang === 'fr' ? 'Nouvelle Séance' : 'New Session'}
          </button>
        </header>

        {/* TRANSFORMATION HERO */}
        <section className="glass-card p-10 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col gap-2">
              <span className="font-micro text-[10px] text-text-dim tracking-widest uppercase">{lang === 'fr' ? 'SANTÉ & CORPS' : 'HEALTH & BODY'}</span>
              <h2 className="font-display text-4xl font-black text-text-main uppercase tracking-tight">
                {user?.weightKg ? `${user.weightKg} KG` : '-- KG'}
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <span className="px-4 py-1 rounded-full bg-success/20 text-success font-hero text-xl font-black shadow-[0_0_15px_rgba(0,200,83,0.3)]">
                    {user?.fitnessLevel?.toUpperCase() || 'NEWBIE'}
                </span>
                <span className="font-micro text-[10px] text-text-dim">{lang === 'fr' ? 'NIVEAU DE FORME' : 'FITNESS LEVEL'}</span>
              </div>
            </div>
            <div className="w-full md:w-64 h-32 bg-surface/50 rounded-3xl border border-border flex items-center justify-center">
              <svg className="w-full h-full p-4" viewBox="0 0 100 40">
                <path d="M 0 30 Q 25 25, 50 20 T 100 15" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary opacity-20" />
                <circle cx="100" cy="15" r="3" className="fill-primary" />
              </svg>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* VOLUME CHART */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-xl font-black text-text-main uppercase tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {lang === 'fr' ? 'VOLUME HEBDOMADAIRE' : 'WEEKLY VOLUME'}
                </h3>
                <div className="flex gap-2">
                  {['7D', '30D', '90D'].map(t => (
                    <button 
                        key={t} 
                        onClick={() => setTimeRange(t as any)}
                        className={`px-3 py-1 rounded-lg font-micro text-[9px] transition-all ${timeRange === t ? 'bg-primary text-white shadow-[0_5px_15px_rgba(255,77,0,0.3)]' : 'text-text-dim hover:text-text-main'}`}
                    >
                        {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full bg-surface/30 rounded-3xl border border-border relative flex items-end px-4 pb-4 gap-1">
                {(volumeData || []).length > 0 ? volumeData.map((v, i) => {
                  const maxVol = Math.max(...(volumeData || []), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-700 ${isSanctuary ? 'bg-primary' : 'bg-gradient-to-t from-primary to-gold'}`} 
                        style={{ height: `${(v / maxVol) * 85 + 5}%`, opacity: 0.3 + (i / (volumeData?.length || 1)) * 0.7 }} 
                      />
                    </div>
                  );
                }) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-micro text-text-dim tracking-widest uppercase">
                        {lang === 'fr' ? 'Données insuffisantes' : 'Not enough data'}
                    </div>
                )}
              </div>
            </section>

            {/* EXERCISE PROGRESS GRID */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-text-dim" />
                <h3 className="font-display text-xl font-black text-text-main uppercase tracking-tight">{lang === 'fr' ? 'PROGRESSION PAR EXERCICE' : 'EXERCISE PROGRESS'}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(exercisePRs || []).length > 0 ? exercisePRs.slice(0, 4).map(ex => (
                  <div key={ex.name} className="glass-card p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="font-display font-bold text-text-main uppercase">{ex.name}</span>
                      <svg className="w-16 h-8" viewBox="0 0 40 20">
                        <path 
                            d={`M 0 20 ${(ex.trend || []).map((v, i) => {
                                const trendLen = ex.trend?.length || 1;
                                const x = trendLen > 1 ? i * (40 / (trendLen - 1)) : 20;
                                const maxVal = Math.max(...(ex.trend || []), 1);
                                const y = 20 - (v / maxVal) * 15;
                                return `L ${x} ${y}`;
                            }).join(' ')}`} 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" 
                        />
                      </svg>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="font-micro text-[9px] text-text-dim uppercase">PR</span>
                        <span className="font-hero text-xl text-text-main">{ex.pr} KG</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-micro text-[9px] text-text-dim uppercase">EST. 1RM</span>
                        <span className="font-hero text-lg text-primary">{Math.round(ex.pr * 1.2)}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                    <div className="col-span-full p-12 rounded-3xl border border-dashed border-border flex items-center justify-center text-[10px] font-micro text-text-dim tracking-[0.3em] uppercase">
                        {lang === 'fr' ? 'Commencez à vous entraîner pour voir vos progrès' : 'Start training to see your progress'}
                    </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* ACHIEVEMENT GALLERY */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gold" />
                <h3 className="font-display text-xl font-black text-text-main uppercase tracking-tight">{lang === 'fr' ? 'TROPHÉES' : 'ACHIEVEMENTS'}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => {
                  const achievementsList = gamificationStats?.achievements || [];
                  const achievement = i < achievementsList.length ? achievementsList[i] : null;
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-2xl flex items-center justify-center text-2xl border transition-all ${
                        achievement 
                          ? 'glass-card bg-gold/10 border-gold/30 grayscale-0 shadow-[0_0_15px_rgba(230,167,0,0.2)]' 
                          : 'bg-surface/30 border-border grayscale opacity-30'
                      }`}
                      title={achievement?.name ? (lang === 'fr' ? achievement.name.fr : achievement.name.en) : 'Locked'}
                    >
                      {achievement ? (achievement.icon || '🏆') : '🔒'}
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => navigate('/achievements')}
                className="w-full h-14 rounded-2xl border border-border font-micro text-xs tracking-[0.2em] hover:text-primary hover:border-primary/30 transition-all uppercase"
              >
                {lang === 'fr' ? 'VOIR TOUT' : 'VIEW ALL'}
              </button>
            </section>

            {/* QUICK HISTORY LIST */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-text-dim" />
                <h3 className="font-display text-sm font-black text-text-dim uppercase tracking-widest">{lang === 'fr' ? 'HISTORIQUE' : 'HISTORY'}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {history.slice(0, 5).map((h, i) => (
                  <div 
                    key={`${h.id}-${i}`} 
                    onClick={() => navigate(`/workout/${h.id}`)}
                    className="glass-card p-4 flex items-center justify-between group hover:translate-x-1 transition-all cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                  >
                    <div>
                      <p className="font-display text-sm font-bold text-text-main uppercase group-hover:text-primary transition-colors">{h.name}</p>
                      <p className="font-micro text-[9px] text-text-dim">{new Date(h.startTime).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-hero text-sm text-text-main">{h.totalVolume}</span>
                      <span className="font-micro text-[8px] text-text-dim uppercase">KG</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
