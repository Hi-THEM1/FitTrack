import React from 'react';

interface DayData {
  name: string;
  date: number;
  isToday: boolean;
  status: 'completed' | 'missed' | 'rest' | 'future';
}

function getWeekData(): DayData[] {
  const today = new Date();
  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  
  // Build last 7 days centered on today
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 3 + i);
    const isFuture = date > today;
    const isToday = date.toDateString() === today.toDateString();

    let status: DayData['status'] = 'future';
    if (!isFuture && !isToday) {
      // Mock: alternate completed/missed for demo
      status = i % 3 === 1 ? 'missed' : 'completed';
    } else if (isToday) {
      status = 'rest';
    }

    return {
      name: dayNames[date.getDay()],
      date: date.getDate(),
      isToday,
      status,
    };
  });
}

const statusConfig = {
  completed: { dot: 'bg-success', glow: 'shadow-[0_0_8px_rgba(14,165,233,0.6)]', label: 'Fait' },
  missed:    { dot: 'bg-danger',   glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]',  label: 'Manqué' },
  rest:      { dot: 'bg-text-muted',   glow: '',                                        label: 'Repos' },
  future:    { dot: 'bg-transparent',  glow: '',                                        label: '' },
};

export default function CalendarStrip() {
  const days = getWeekData();

  return (
    <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
      {days.map((day, i) => {
        const cfg = statusConfig[day.status];
        return (
          <div
            key={i}
            className={`snap-center flex flex-col items-center min-w-[44px] p-2 rounded-xl transition-all duration-200 cursor-default ${
              day.isToday
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                : 'bg-surface text-text-muted border border-white/5'
            }`}
          >
            <span className="text-[10px] font-bold uppercase mb-1 opacity-70">{day.name}</span>
            <span className="font-display text-lg font-bold">{day.date}</span>
            {day.status !== 'future' && (
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${cfg.dot} ${cfg.glow}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
