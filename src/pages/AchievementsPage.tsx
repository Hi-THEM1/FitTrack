import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Trophy, Star, Zap, Flame, Target, Award, Lock, ChevronRight } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 1, icon: Flame, color: 'text-primary', title: { en: 'Early Bird', fr: 'Lève-tôt' }, desc: { en: '5 workouts before 8 AM', fr: '5 séances avant 8h' }, progress: 100, xp: 250 },
  { id: 2, icon: Target, color: 'text-gold', title: { en: 'Iron Master', fr: 'Maître du Fer' }, desc: { en: '1000kg in one session', fr: 'Soulever 1000kg' }, progress: 100, xp: 500 },
  { id: 3, icon: Zap, color: 'text-primary', title: { en: 'Streak Warrior', fr: 'Guerrier de Série' }, desc: { en: '7-day workout streak', fr: '7 jours consécutifs' }, progress: 40, xp: 300 },
  { id: 4, icon: Star, color: 'text-success', title: { en: 'Elite Performer', fr: 'Performance Élite' }, desc: { en: 'Reach level 10', fr: 'Atteindre le niveau 10' }, progress: 20, xp: 1000 },
  { id: 5, icon: Award, color: 'text-gold', title: { en: 'Community Legend', fr: 'Légende Locale' }, desc: { en: 'Help 10 newcomers', fr: 'Aider 10 nouveaux' }, progress: 0, xp: 1500 },
];

export default function AchievementsPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const lang = language as 'en' | 'fr';

  const isSanctuary = theme === 'light';

  return (
    <MainLayout>
      <div className="flex flex-col gap-12 pb-20">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-5xl font-black text-text-main uppercase tracking-tighter">
            {lang === 'fr' ? 'TROPHÉES' : 'ACHIEVEMENTS'}
          </h1>
          <p className="font-micro text-text-dim tracking-[0.2em] uppercase">
            {lang === 'fr' ? 'Débloquez des récompenses exclusives' : 'Unlock exclusive rewards & XP'}
          </p>
        </header>

        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'TOTAL UNLOCKED', val: '12/48', icon: Trophy, color: 'text-gold' },
            { label: 'TOTAL XP EARNED', val: '14,500', icon: Zap, color: 'text-primary' },
            { label: 'WORLD RANK', val: '#425', icon: Target, color: 'text-success' },
          ].map(s => (
            <div key={s.label} className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group">
              <s.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all ${s.color}`} />
              <span className="font-micro text-[10px] text-text-dim tracking-widest uppercase">{s.label}</span>
              <span className="font-display text-3xl font-black text-text-main uppercase">{s.val}</span>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* MAIN GALLERY */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-black text-text-dim uppercase tracking-widest">GALLERY</h3>
              <div className="flex gap-2">
                {['ALL', 'LOCKED', 'UNLOCKED'].map(f => (
                  <button key={f} className={`px-4 py-1 rounded-lg font-micro text-[9px] uppercase tracking-widest ${f === 'ALL' ? 'bg-primary text-white' : 'text-text-dim'}`}>{f}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {ACHIEVEMENTS.map(ach => {
                const isUnlocked = ach.progress === 100;
                return (
                  <div 
                    key={ach.id} 
                    className={`glass-card p-6 border transition-all flex items-center gap-6 group ${
                      isUnlocked 
                        ? 'bg-gradient-to-r from-gold/10 to-transparent border-gold/30 hover:border-gold shadow-[0_0_20px_rgba(230,167,0,0.1)]' 
                        : 'border-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 relative ${isUnlocked ? 'bg-gold shadow-lg shadow-gold/20' : 'bg-surface border border-border'}`}>
                      <ach.icon className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-text-dim'}`} />
                      {!isUnlocked && <Lock className="absolute -top-1 -right-1 w-4 h-4 text-text-dim" />}
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-lg font-black text-text-main uppercase tracking-tight group-hover:text-primary transition-colors">{ach.title[lang]}</h4>
                        <span className="font-hero text-sm text-gold">+{ach.xp} XP</span>
                      </div>
                      <p className="text-xs text-text-dim font-medium">{ach.desc[lang]}</p>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden border border-border/50">
                          <div 
                            className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-gold shimmer' : 'bg-primary'}`} 
                            style={{ width: `${ach.progress}%` }} 
                          />
                        </div>
                        <span className="font-micro text-[9px] text-text-dim font-black w-8">{ach.progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 flex flex-col gap-10">
            <div className="glass-card p-8 bg-primary/5 border-primary/10 flex flex-col gap-6">
              <h3 className="font-display text-xl font-black text-text-main uppercase tracking-tight">ACTIVE CHALLENGES</h3>
              <div className="space-y-6">
                {[
                  { label: 'Iron Sledge', progress: 85, end: '2d left' },
                  { label: 'Morning Hero', progress: 30, end: '5d left' },
                ].map(c => (
                  <div key={c.label} className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                      <span className="font-display font-bold text-xs uppercase text-text-main">{c.label}</span>
                      <span className="font-micro text-[8px] text-primary uppercase">{c.end}</span>
                    </div>
                    <div className="h-1 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full h-14 rounded-2xl border border-primary/30 text-primary font-display font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">JOIN CHALLENGE</button>
            </div>

            <div className="glass-card p-8 flex flex-col gap-6">
              <h3 className="font-display text-sm font-black text-text-dim uppercase tracking-widest">RECENT ACTIVITY</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs">💪</div>
                    <div>
                      <p className="text-[10px] text-text-main font-bold uppercase tracking-wide">Lifted 1,200kg Total</p>
                      <p className="text-[8px] text-text-dim uppercase mt-1">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
