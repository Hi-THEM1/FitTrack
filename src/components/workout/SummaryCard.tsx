import React, { useEffect, useState } from 'react';
import type { WorkoutSession } from '../../types/fitness';
import { 
  Trophy, ArrowRight, Share2, TrendingUp, Clock, 
  Zap, Heart, Target, Medal, Activity, ChevronRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface SummaryCardProps {
  session: WorkoutSession;
  onFinish: () => void;
}

interface StatItemProps { 
  label: string; 
  value: string; 
  icon: React.ElementType;
  delay: number; 
  color: string;
}

function StatItem({ label, value, icon: Icon, delay, color }: StatItemProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { 
    const t = setTimeout(() => setVisible(true), delay); 
    return () => clearTimeout(t); 
  }, [delay]);

  return (
    <div
      className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col items-center gap-3 transition-all duration-700 hover:border-primary/20 hover:bg-surface/50"
      style={{ 
        opacity: visible ? 1 : 0, 
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)' 
      }}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">{label}</span>
        <span className="font-hero text-2xl text-text-main leading-none">{value}</span>
      </div>
    </div>
  );
}

export default function SummaryCard({ session, onFinish }: SummaryCardProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const lang = language as 'en' | 'fr';
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    return lang === 'fr' ? `${mins} MIN` : `${mins} MIN`;
  };

  const stats = {
    volume: `${session.totalVolume || 0} KG`,
    sets: session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0),
    reps: session.exercises.reduce((acc, ex) => acc + ex.sets.reduce((sum, s) => sum + (s.isCompleted ? s.reps : 0), 0), 0),
    xp: `+${Math.round(session.xpEarned || 0)}`,
    prs: session.exercises.reduce((acc, ex) => 
      acc + ex.sets.filter(s => s.isCompleted && s.previousWeight && s.weight > s.previousWeight).length, 0
    ),
  };

  // Calculate Muscle Focus with extreme safety
  const muscleFocus: Record<string, number> = {};
  if (session?.exercises) {
    session.exercises.forEach(ex => {
      if (!ex?.muscles) return;
      ex.muscles.forEach(m => {
        if (!m) return;
        const muscleName = lang === 'fr' 
            ? (m.name?.fr || m.name || (typeof m === 'string' ? m : 'Unknown')) 
            : (m.name?.en || m.name || (typeof m === 'string' ? m : 'Unknown'));
            
        if (!muscleName || typeof muscleName !== 'string') return;
        const weight = m.isPrimary ? 1 : 0.5;
        muscleFocus[muscleName] = (muscleFocus[muscleName] || 0) + weight;
      });
    });
  }

  const topMuscles = Object.entries(muscleFocus)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const handleShare = async () => {
    const text = lang === 'fr' 
      ? `Je viens de terminer ma séance ${session.name} ! Volume total : ${session.totalVolume}kg. Rejoignez-moi sur FitTrack !`
      : `Just finished my ${session.name} workout! Total volume: ${session.totalVolume}kg. Join me on FitTrack!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FitTrack Workout',
          text: text,
          url: window.location.origin
        });
      } catch (err) {
        console.warn('Sharing failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      alert(lang === 'fr' ? 'Lien copié dans le presse-papier !' : 'Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-canvas overflow-y-auto px-6 py-12 flex flex-col items-center scrollbar-hide">
      <div className="max-w-2xl w-full space-y-10">
        
        {/* HERO SECTION */}
        <header className="relative text-center space-y-4">
          <div 
            className="w-24 h-24 bg-gradient-to-tr from-primary to-orange-600 rounded-[32px] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(255,77,0,0.3)] animate-bounce-slow"
            style={{ 
              opacity: showContent ? 1 : 0, 
              transform: showContent ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
              transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Trophy className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display text-5xl font-black text-text-main uppercase tracking-tighter shimmer">
              {lang === 'fr' ? 'SÉANCE TERMINÉE' : 'WORKOUT COMPLETE'}
            </h1>
            <p className="font-micro text-[10px] text-text-dim tracking-[0.4em] uppercase">
              {new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        {/* CORE STATS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem label="VOLUME" value={stats.volume} icon={TrendingUp} delay={400} color="bg-primary" />
          <StatItem label="DURÉE" value={formatDuration(session.duration)} icon={Clock} delay={600} color="bg-blue-500" />
          <StatItem label="SÉRIES" value={String(stats.sets)} icon={Zap} delay={800} color="bg-warning" />
          <StatItem label="XP" value={stats.xp} icon={Target} delay={1000} color="bg-success" />
        </section>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* INTENSITY CHART (MOCKED REALISM) */}
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {lang === 'fr' ? 'INTENSITÉ' : 'INTENSITY'}
              </h3>
              <span className="text-[10px] font-bold text-success uppercase tracking-widest">Optimal</span>
            </div>
            
            <div className="h-32 flex items-end justify-between gap-1 px-2">
              {(() => {
                // Generate a dynamic intensity curve based on exercise volumes
                const volumes = session.exercises.map(ex => 
                  ex.sets.reduce((acc, s) => acc + (s.isCompleted ? s.weight * s.reps : 0), 0)
                );
                const maxVol = Math.max(...volumes, 1);
                // Interpolate to 9 points for the chart
                const points = Array.from({ length: 9 }, (_, i) => {
                  const idx = Math.floor((i / 8) * (volumes.length - 1));
                  const h = (volumes[idx] / maxVol) * 80 + 20; // 20% min height
                  return h;
                });
                return points.map((h, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-primary/20 rounded-t-lg relative group transition-all duration-1000"
                    style={{ height: showContent ? `${h}%` : '0%' }}
                  >
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-40 transition-opacity rounded-t-lg" />
                  </div>
                ));
              })()}
            </div>
            <div className="flex justify-between font-micro text-[8px] text-text-dim uppercase tracking-widest">
              <span>START</span>
              <span>PEAK</span>
              <span>END</span>
            </div>
          </div>

          {/* MUSCLE FOCUS */}
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <h3 className="font-display text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              {lang === 'fr' ? 'FOCUS MUSCULAIRE' : 'MUSCLE FOCUS'}
            </h3>
            
            <div className="space-y-4">
              {topMuscles.map(([name, val], i) => (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-text-main">{name}</span>
                    <span className="text-text-dim">{Math.round((val / Object.values(muscleFocus).reduce((a,b)=>a+b,0)) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${i === 0 ? 'from-primary to-orange-500' : 'from-surface to-text-dim'} transition-all duration-1000 delay-500`}
                      style={{ width: showContent ? `${(val / topMuscles[0][1]) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PR HIGHLIGHTS */}
        {stats.prs > 0 && (
          <section className="glass-card p-6 bg-gradient-to-r from-gold/10 via-transparent to-transparent border border-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center">
                <Medal className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h4 className="font-display font-black text-gold uppercase tracking-tight">
                  {stats.prs} {lang === 'fr' ? 'NOUVEAUX RECORDS !' : 'NEW RECORDS!'}
                </h4>
                <p className="text-xs text-text-dim">{lang === 'fr' ? 'Votre force augmente visiblement.' : 'Your strength is visibly increasing.'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gold/50" />
          </section>
        )}

        {/* AI COACH INSIGHT */}
        <section className="glass-card p-8 bg-surface/30 border border-white/5 relative overflow-hidden group">
          <Heart className="absolute -right-8 -bottom-8 w-32 h-32 text-primary opacity-5 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-micro text-[10px] text-primary font-black uppercase tracking-[0.2em]">{lang === 'fr' ? 'ANALYSE DU COACH' : 'COACH INSIGHT'}</span>
            </div>
            <p className="text-text-main font-medium italic leading-relaxed text-lg">
              {lang === 'fr' 
                ? `"Volume impressionnant aujourd'hui. Votre focus sur les ${topMuscles[0]?.[0]} a été particulièrement intense. Prenez 48h de repos pour optimiser la récupération."`
                : `"Impressive volume today. Your focus on ${topMuscles[0]?.[0]} was particularly intense. Take 48h rest to optimize recovery."`}
            </p>
          </div>
        </section>

        {/* ACTIONS */}
        <footer className="flex flex-col gap-4">
          <button
            onClick={onFinish}
            className="w-full h-16 bg-primary text-white font-display font-black uppercase tracking-[0.2em] text-xs rounded-full shadow-[0_20px_40px_rgba(255,77,0,0.3)] hover:shadow-[0_25px_50px_rgba(255,77,0,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            {lang === 'fr' ? 'CONFIRMER LA SÉANCE' : 'CONFIRM SESSION'}
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <div className="flex gap-4">
            <button 
                onClick={handleShare}
                className="flex-1 h-14 bg-surface border border-border text-text-muted font-display font-black text-[10px] uppercase tracking-widest rounded-full flex items-center justify-center gap-2 hover:text-text-main transition-all"
            >
              <Share2 className="w-4 h-4" /> {lang === 'fr' ? 'PARTAGER' : 'SHARE'}
            </button>
            <button className="flex-1 h-14 bg-surface border border-border text-text-muted font-display font-black text-[10px] uppercase tracking-widest rounded-full flex items-center justify-center gap-2 hover:text-text-main transition-all">
              <Activity className="w-4 h-4" /> {lang === 'fr' ? 'DÉTAILS' : 'DETAILS'}
            </button>
          </div>
        </footer>

      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
        .shimmer {
          background: linear-gradient(90deg, #fff 0%, #ff4d00 50%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          to { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

