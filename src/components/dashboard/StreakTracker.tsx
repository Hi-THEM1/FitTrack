import React from 'react';
import { Flame } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function StreakTracker() {
  const { stats }    = useGamification();
  const { language } = useLanguage();
  const lang = language as 'en' | 'fr';
  const { streakDays, streakStatus } = stats;

  const flameConfig = {
    active:   { color: 'text-warning',   glow: 'bg-warning',   anim: 'animate-pulse',  label: { fr: 'Série Active 🔥',    en: 'Active Streak 🔥'    } },
    'at-risk':{ color: 'text-gold',         glow: 'bg-gold',        anim: 'animate-bounce', label: { fr: '⚠️ En danger',      en: '⚠️ At Risk'          } },
    broken:   { color: 'text-text-muted',         glow: 'bg-text-muted',        anim: '',               label: { fr: 'Série brisée',       en: 'Streak broken'       } },
  };

  const cfg = flameConfig[streakStatus];

  return (
    <div className="glass-card p-4 rounded-2xl border border-gold/20 flex items-center gap-4 bg-gold/5">
      <div className="relative">
        <div className={`absolute inset-0 ${cfg.glow} blur-xl opacity-40 ${cfg.anim} rounded-full`} />
        <Flame className={`w-10 h-10 ${cfg.color} relative z-10 ${streakStatus === 'active' ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : ''}`} />
      </div>
      <div>
        <div className="font-display text-2xl font-bold text-text-main tabular-nums leading-none">
          {streakDays} {lang === 'fr' ? (streakDays > 1 ? 'JOURS' : 'JOUR') : (streakDays > 1 ? 'DAYS' : 'DAY')}
        </div>
        <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${cfg.color}`}>
          {cfg.label[lang]}
        </div>
      </div>
    </div>
  );
}
