import React from 'react';

interface PlateMathVisualizerProps {
  weight: number;
}

export default function PlateMathVisualizer({ weight }: PlateMathVisualizerProps) {
  // Bar weight is usually 20kg (45 lbs)
  const barWeight = 20;
  const sideWeight = (weight - barWeight) / 2;

  if (sideWeight <= 0) return null;

  const plates = [
    { value: 25, color: '#E02424' }, // Red for 25kg
    { value: 20, color: '#1C64F2' }, // Blue for 20kg
    { value: 15, color: '#E6A700' }, // Yellow for 15kg
    { value: 10, color: '#31C48D' }, // Green for 10kg
    { value: 5, color: '#FDFBF7' },  // White for 5kg
    { value: 2.5, color: '#111928' },// Black for 2.5kg
    { value: 1.25, color: '#A3A3A3' },// Silver for 1.25kg
  ];

  let remaining = sideWeight;
  const layout: number[] = [];

  plates.forEach(p => {
    while (remaining >= p.value) {
      layout.push(p.value);
      remaining -= p.value;
    }
  });

  return (
    <div className="flex items-center gap-1 h-12">
      {layout.map((p, i) => {
        const plateInfo = plates.find(plt => plt.value === p);
        const height = 16 + (p / 25) * 24;
        const width = 4 + (p / 25) * 4;
        
        return (
          <div 
            key={i} 
            className="rounded-sm shadow-lg border border-white/10"
            style={{ 
              height: `${height}px`, 
              width: `${width}px`, 
              backgroundColor: plateInfo?.color || '#A3A3A3',
              boxShadow: plateInfo?.value === 25 ? '0 0 10px rgba(224,36,36,0.3)' : 'none'
            }}
          />
        );
      })}
      {/* Bar End */}
      <div className="w-16 h-2 bg-text-dim/30 rounded-full -ml-1 flex items-center justify-center">
        <span className="font-micro text-[7px] text-text-dim">20 BAR</span>
      </div>
    </div>
  );
}
