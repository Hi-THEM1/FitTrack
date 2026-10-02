import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Utensils, LineChart, User, Bell, Flame } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import AchievementToast from '../ui/AchievementToast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/dashboard', icon: Home, label: { fr: 'Accueil', en: 'Home' } },
  { to: '/exercises', icon: Dumbbell, label: { fr: 'Exercices', en: 'Exercises' } },
  { to: '/nutrition', icon: Utensils, label: { fr: 'Nutrition', en: 'Nutrition' } },
  { to: '/progress', icon: LineChart, label: { fr: 'Progrès', en: 'Progress' } },
  { to: '/profile', icon: User, label: { fr: 'Profil', en: 'Profile' } },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const { theme, changeTheme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { stats } = useGamification();
  const location = useLocation();
  const lang = language as 'en' | 'fr';

  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const [isRippling, setIsRippling] = useState(false);
  
  const handleThemeToggle = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    setRipplePos({ x, y });
    setIsRippling(true);
    
    setTimeout(() => {
      changeTheme(theme === 'dark' ? 'light' : 'dark');
    }, 400);

    setTimeout(() => {
      setIsRippling(false);
    }, 800);
  };

  const xpPct = Math.min(Math.round((stats.xp / stats.xpToNextLevel) * 100), 100);

  return (
    <div className={`min-h-screen bg-canvas selection:bg-primary/30 spatial-container overflow-x-hidden`}>
      <AchievementToast />

      {/* XP BAR */}
      <div className="fixed top-0 left-0 w-full h-[4px] bg-surface/30 z-[100] overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary via-gold to-primary shadow-[0_0_15px_rgba(255,77,0,0.5)] transition-all duration-1000 ease-out"
          style={{ width: `${xpPct}%` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full h-20 flex items-center justify-between px-8 z-[50] pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,77,0,0.4)] group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-black text-text-main uppercase tracking-tighter leading-none">FitTrack</span>
              <span className="font-micro text-[8px] text-primary tracking-[0.2em] uppercase font-black">Analytics Engine</span>
            </div>
          </NavLink>

          <div className="hidden md:flex flex-col border-l border-border pl-6">
            <span className="font-display text-sm font-black text-text-main uppercase tracking-tighter">LVL {stats.level}</span>
            <span className="font-micro text-[8px] text-text-dim tracking-widest uppercase">TRAINER</span>
          </div>
        </div>

        <div className="flex items-center gap-6 pointer-events-auto bg-surface/50 backdrop-blur-xl px-5 py-2 rounded-2xl border border-border shadow-2xl">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Flame className="w-4 h-4 text-primary fill-current" />
            <span className="font-hero text-sm text-primary font-black">{stats.streakDays}</span>
          </div>
          
          <button onClick={handleThemeToggle} className="h-8 px-4 rounded-xl border border-border hover:border-primary/30 transition-all font-micro text-[9px] tracking-widest text-text-dim hover:text-text-main uppercase">
            {theme === 'dark' ? 'THE FORGE' : 'SANCTUARY'}
          </button>

          <div className="flex items-center gap-3 border-l border-border pl-6">
              <button className="text-text-dim hover:text-text-main transition-colors relative mr-2">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
              </button>
              
              <NavLink 
                to="/profile"
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-sm font-black text-white shadow-lg border border-white/10 group overflow-hidden relative transition-transform hover:scale-105"
              >
                {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </NavLink>
          </div>
        </div>
      </header>

      {/* RIPPLE OVERLAY */}
      {isRippling && (
        <div className="ripple-overlay">
          <div 
            className="ripple-circle active"
            style={{ left: ripplePos.x, top: ripplePos.y }}
          />
        </div>
      )}

      {/* PAGE CONTENT */}
      <main className="pt-28 pb-36 px-4 md:px-12 max-w-7xl mx-auto">
        {children}
      </main>

      {/* NAVIGATION DOCK */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <nav className="glass-card h-20 px-4 rounded-[28px] border border-primary/10 flex items-center gap-2 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative h-12 w-14 flex items-center justify-center rounded-2xl transition-all duration-500 ${
                  isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text-dim hover:text-text-main hover:bg-surface/50'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {isActive && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg animate-in slide-in-from-bottom-2 duration-300">
                    {lang === 'fr' ? item.label.fr : item.label.en}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
        .spatial-container main > * { transition: transform 0.8s var(--tension); }
      `}</style>
    </div>
  );
}
