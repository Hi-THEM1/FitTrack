import React, { useEffect, useState } from 'react';
import { useWorkoutSession } from '../../context/WorkoutSessionContext';

interface RestTimerProps { onSkip: () => void; }

export default function RestTimer({ onSkip }: RestTimerProps) {
  const { restTimeRemaining } = useWorkoutSession();
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (restTimeRemaining === 0) {
      setIsFinished(true);
      const timer = setTimeout(() => setIsFinished(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [restTimeRemaining]);

  const isWarning = restTimeRemaining < 10 && restTimeRemaining > 0;
  const isUrgent = restTimeRemaining < 5 && restTimeRemaining > 0;

  return (
    <button 
      onClick={onSkip}
      className={`glass-card px-8 py-2 rounded-full border transition-all duration-300 flex items-center gap-3 group relative overflow-hidden ${
        isFinished ? 'bg-success/20 border-success shadow-[0_0_20px_rgba(0,200,83,0.4)]' :
        isUrgent ? 'bg-warning/20 border-warning animate-shake' :
        isWarning ? 'bg-warning/10 border-warning/50' : 
        'bg-surface/50 border-border'
      }`}
    >
      <span className={`font-hero text-2xl tabular-nums transition-colors duration-300 ${
        isFinished ? 'text-success' :
        isWarning ? 'text-warning' :
        'text-text-main'
      }`}>
        {isFinished ? 'GO!' : `0:${String(restTimeRemaining).padStart(2, '0')}`}
      </span>
      
      {/* Background Pulse for Urgent state */}
      {isUrgent && (
        <div className="absolute inset-0 bg-warning/20 animate-pulse pointer-events-none" />
      )}

      <span className="font-micro text-[8px] text-text-dim group-hover:text-primary transition-colors">
        SKIP
      </span>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px) rotate(-1deg); }
          75% { transform: translateX(2px) rotate(1deg); }
        }
        .animate-shake { animation: shake 0.2s infinite; }
      `}</style>
    </button>
  );
}
