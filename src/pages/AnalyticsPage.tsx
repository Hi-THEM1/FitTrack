import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { workoutService } from '../services/workoutService';
import { LineChart as ChartIcon, TrendingUp, Weight, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language as 'en' | 'fr';

  const [weeklyVolume, setWeeklyVolume] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (user) {
        const volume = await workoutService.getWeeklyVolume(user.id);
        setWeeklyVolume(volume);
      }
      setLoading(false);
    }
    loadAnalytics();
  }, [user]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 pb-20">
        <div>
          <h1 className="font-display text-4xl font-black text-text-main uppercase tracking-tight">
            {lang === 'fr' ? 'Analyses' : 'Analytics'}
          </h1>
          <p className="text-text-muted font-medium mt-1">
            {lang === 'fr' ? 'Visualisez votre progression sur le long terme.' : 'Visualize your long-term progress.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transformation Hero */}
          <div className="glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-brand-blue/5 to-transparent">
             <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Transformation</span>
                <Weight className="w-5 h-5 text-primary" />
             </div>
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-3xl font-mono font-black text-text-main">{user?.weightKg || '--'} <span className="text-sm font-normal text-text-muted">KG</span></div>
                   <div className="text-[10px] font-bold text-text-muted uppercase">Actuel</div>
                </div>
                <div className="text-2xl text-text-tertiary">→</div>
                <div className="text-right">
                   <div className="text-3xl font-mono font-black text-success">-2.4 <span className="text-sm font-normal text-text-muted">KG</span></div>
                   <div className="text-[10px] font-bold text-text-muted uppercase">Évolution</div>
                </div>
             </div>
          </div>

          {/* Weekly Volume Chart */}
          <div className="glass-card p-8 rounded-3xl border border-white/5">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold text-text-main uppercase tracking-tight">
                   {lang === 'fr' ? 'Volume Hebdomadaire' : 'Weekly Volume'}
                </h3>
                <TrendingUp className="w-5 h-5 text-success" />
             </div>
             
             <div className="h-40 flex items-end justify-between gap-2">
                {loading ? (
                   <div className="w-full h-full skeleton rounded-xl" />
                ) : (
                   weeklyVolume.map((vol, i) => {
                      const max = Math.max(...weeklyVolume, 1);
                      const height = (vol / max) * 100;
                      return (
                         <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                               className="w-full bg-primary/20 border-t-2 border-primary rounded-t-lg transition-all duration-1000"
                               style={{ height: `${Math.max(height, 5)}%` }}
                            />
                            <span className="text-[8px] font-bold text-text-tertiary uppercase">J-{6-i}</span>
                         </div>
                      );
                   })
                )}
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
