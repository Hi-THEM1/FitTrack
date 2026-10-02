import React, { useState, useRef } from 'react';
import { Play, Dumbbell } from 'lucide-react';
import type { Exercise } from '../../types/fitness';
import { useLanguage } from '../../context/LanguageContext';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

export default function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const { language } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const name = language === 'fr' ? exercise.name.fr : exercise.name.en;
  const primaryMuscle = exercise.muscles.find(m => m.isPrimary);
  const muscleName = primaryMuscle 
    ? (language === 'fr' ? primaryMuscle.name.fr : primaryMuscle.name.en)
    : 'Full Body';

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <button 
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-card group relative w-full aspect-[4/3] rounded-2xl border border-white/5 overflow-hidden text-left transition-all duration-200 ease-out will-change-transform"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {!imgError && exercise.mediaUrl ? (
          <img 
            src={exercise.mediaUrl} 
            alt={name}
            className="w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface/50">
            <Dumbbell className="w-12 h-12 text-text-muted opacity-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full p-6 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-micro text-[9px] font-black text-primary uppercase tracking-[0.2em]">
            {muscleName}
          </span>
          <div className="w-1 h-1 rounded-full bg-border" />
          <span className="font-micro text-[9px] text-text-dim uppercase tracking-widest">
            {exercise.difficulty}
          </span>
        </div>
        
        <h3 className="font-display text-xl font-black text-text-main uppercase leading-tight group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
           <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
             <Play className="w-3 h-3 text-primary fill-current ml-0.5" />
           </div>
           <span className="font-micro text-[10px] text-text-dim tracking-widest uppercase">VIEW DETAILS</span>
        </div>
      </div>
    </button>
  );
}
