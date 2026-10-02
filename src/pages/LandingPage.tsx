import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Dumbbell, Activity, Shield, ArrowRight, Moon, Sun, Globe } from 'lucide-react';

export default function LandingPage() {
  const { theme, changeTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();

  const toggleTheme = () => {
    changeTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    changeLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-8 h-8 text-[var(--primary)]" />
          <span className="font-display text-2xl font-bold tracking-wider uppercase text-[var(--text-main)]">
            FitTrack
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-[var(--surface)] transition-colors" aria-label="Toggle Language">
            <Globe className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--surface)] transition-colors" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[var(--text-muted)]" /> : <Moon className="w-5 h-5 text-[var(--text-muted)]" />}
          </button>
          <Link to="/login" className="hidden sm:block px-6 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all">
            {language === 'fr' ? 'Connexion' : 'Login'}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--success)] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <h1 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tight mb-6 max-w-4xl z-10 leading-[0.9]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--gold)]">
            {language === 'fr' ? 'FORGEZ' : 'FORGE'}
          </span><br/>
          {language === 'fr' ? 'VOTRE HÉRITAGE' : 'YOUR LEGACY'}
        </h1>
        <p className="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mb-10 z-10 font-medium">
          {language === 'fr'
            ? 'La plateforme fitness premium avec suivi de précision, gamification avancée et analyses basées sur la science.'
            : 'The premium fitness platform with precision tracking, advanced gamification, and science-based analytics.'}
        </p>

        <Link
          to="/register"
          className="z-10 flex items-center gap-3 px-10 py-5 bg-[var(--primary)] text-white rounded-2xl font-bold text-xl hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(255,77,0,0.4)]"
        >
          {language === 'fr' ? 'COMMENCER MAINTENANT' : 'START NOW'}
          <ArrowRight className="w-6 h-6" />
        </Link>
      </main>

      {/* Features Section */}
      <section className="py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-6">
              <Activity className="w-8 h-8 text-[var(--warning)]" />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase mb-3 text-[var(--text-main)]">
              {language === 'fr' ? 'Suivi de Précision' : 'Precision Tracking'}
            </h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              {language === 'fr' ? 'Enregistrez chaque série, répétition et poids avec une interface optimisée pour l\'action.' : 'Log every set, rep, and weight with an interface optimized for action.'}
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(230,167,0,0.2)]">
              <Dumbbell className="w-8 h-8 text-[var(--gold)]" />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase mb-3 text-[var(--text-main)]">
              {language === 'fr' ? 'Système de XP' : 'XP System'}
            </h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              {language === 'fr' ? 'Gagnez de l\'expérience, débloquez des badges et maintenez votre série quotidienne active.' : 'Earn experience, unlock badges, and keep your daily streak alive.'}
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-[var(--success)]" />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase mb-3 text-[var(--text-main)]">
              {language === 'fr' ? 'Objectifs IA' : 'AI Goals'}
            </h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              {language === 'fr' ? 'Obtenez des résumés générés par IA et des suggestions d\'entraînement basées sur vos performances.' : 'Get AI-generated summaries and workout suggestions based on your performance.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
