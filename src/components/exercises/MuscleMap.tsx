import React from 'react';

interface MuscleMapProps {
  activeMuscle: string;
  onMuscleClick: (id: string) => void;
}

export default function MuscleMap({ activeMuscle, onMuscleClick }: MuscleMapProps) {
  const muscleNodes = [
    { id: 'chest', label: 'Chest', cx: 100, cy: 65, r: 8 },
    { id: 'abs', label: 'Abs', cx: 100, cy: 100, r: 8 },
    { id: 'shoulders', label: 'Shoulders', cx: 125, cy: 55, r: 6 },
    { id: 'quads', label: 'Quads', cx: 112, cy: 155, r: 10 },
    { id: 'biceps', label: 'Biceps', cx: 135, cy: 75, r: 5 },
    { id: 'triceps', label: 'Triceps', cx: 65, cy: 75, r: 5 },
    { id: 'back', label: 'Back', cx: 300, cy: 75, r: 12 },
    { id: 'hamstrings', label: 'Hams', cx: 288, cy: 155, r: 10 },
  ];

  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[280px]">
        {/* Simple Humanoid Shape Outline */}
        <path 
          d="M100 20 Q110 20 110 40 L110 50 Q140 50 145 80 L145 120 Q145 130 135 130 L125 130 L125 250 Q125 260 110 260 L90 260 Q75 260 75 250 L75 130 L65 130 Q55 130 55 120 L55 80 Q60 50 90 50 L90 40 Q90 20 100 20 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          className="text-text-muted/20" 
        />
        <path 
          d="M300 20 Q310 20 310 40 L310 50 Q340 50 345 80 L345 120 Q345 130 335 130 L325 130 L325 250 Q325 260 310 260 L290 260 Q275 260 275 250 L275 130 L265 130 Q255 130 255 120 L255 80 Q260 50 290 50 L290 40 Q290 20 300 20 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          className="text-text-muted/20" 
        />

        {/* Muscle Nodes */}
        {muscleNodes.map((node) => {
          const isActive = activeMuscle === node.id || activeMuscle === node.label.toLowerCase();
          return (
            <g 
              key={node.id} 
              className="cursor-pointer group" 
              onClick={() => onMuscleClick(node.id)}
            >
              <circle 
                cx={node.cx} 
                cy={node.cy} 
                r={node.r} 
                className={`transition-all duration-300 ${
                  isActive 
                    ? 'fill-primary stroke-primary/30 stroke-[8px]' 
                    : 'fill-white/10 hover:fill-primary/40'
                }`}
              />
              <circle 
                cx={node.cx} 
                cy={node.cy} 
                r={node.r + 4} 
                className={`fill-none stroke-primary opacity-0 group-hover:opacity-20 transition-opacity ${isActive ? 'animate-ping' : ''}`}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
      
      <div className="absolute bottom-0 inset-x-0 text-center">
         <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">Select Target Area</span>
      </div>
    </div>
  );
}
