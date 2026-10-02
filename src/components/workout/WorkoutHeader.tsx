import React from 'react';
import { Pause, X, Clock } from 'lucide-react';

interface WorkoutHeaderProps {
  name: string;
  timer: number;
  onPause: () => void;
  onQuit: () => void;
}

export default function WorkoutHeader({ name, timer, onPause, onQuit }: WorkoutHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onQuit}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-danger"
        >
          <X className="w-6 h-6" />
        </button>
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-text-main line-clamp-1">{name}</h2>
          <div className="flex items-center gap-1.5 text-warning">
             <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest">En cours</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-2 text-text-main font-mono text-2xl font-bold">
             <Clock className="w-5 h-5 text-text-muted" />
             {formatTime(timer)}
           </div>
        </div>
        
        <button 
          onClick={onPause}
          className="p-3 bg-surface hover:bg-white/10 rounded-xl transition-all active:scale-95 border border-white/5"
        >
          <Pause className="w-5 h-5 fill-current" />
        </button>
      </div>
    </header>
  );
}
