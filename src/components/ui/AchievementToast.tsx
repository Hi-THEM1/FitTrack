import React, { useEffect } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Award, Zap } from 'lucide-react';

export default function AchievementToast() {
  const { recentAchievement, clearAchievement } = useGamification();
  const { language } = useLanguage();

  useEffect(() => {
    if (recentAchievement) {
      const timer = setTimeout(clearAchievement, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentAchievement]);

  if (!recentAchievement) return null;

  const name = language === 'fr' ? recentAchievement.name.fr : recentAchievement.name.en;
  const desc = language === 'fr' ? recentAchievement.description.fr : recentAchievement.description.en;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4 pointer-events-none">
      <div className="glass-card p-6 bg-gold/10 border-gold shadow-[0_0_50px_rgba(230,167,0,0.3)] animate-achievement pointer-events-auto">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center text-4xl shadow-lg animate-bounce-subtle">
            {recentAchievement.icon}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-micro text-[10px] text-gold font-black tracking-[0.3em] uppercase">ACHIEVEMENT UNLOCKED</span>
            <h4 className="font-display text-xl font-black text-text-main uppercase tracking-tight">{name}</h4>
            <p className="text-xs text-text-dim font-medium">{desc}</p>
            <div className="flex items-center gap-2 mt-2">
              <Zap className="w-3 h-3 text-gold fill-current" />
              <span className="font-hero text-sm text-gold">+{recentAchievement.xpBonus} XP</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes achievementIn {
          0% { transform: translateY(-100px) scale(0.9); opacity: 0; }
          60% { transform: translateY(10px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-achievement {
          animation: achievementIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
