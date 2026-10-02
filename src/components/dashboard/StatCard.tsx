import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  trend: number;
  colorClass: string;
  sparklineData: string;
}

export default function StatCard({ label, value, unit, trend, colorClass, sparklineData }: StatCardProps) {
  const isPositive = trend > 0;
  
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
      {/* Background Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity bg-${colorClass}`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
          {trend !== 0 && (
            <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-1 mb-6">
          <span className="font-mono text-3xl font-black text-text-main tabular-nums">{value}</span>
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{unit}</span>
        </div>
        
        {/* Simple Sparkline SVG */}
        <div className="h-10 w-full mt-auto">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
             <polyline
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               className={`text-${colorClass}`}
               points={sparklineData}
             />
          </svg>
        </div>
      </div>
    </div>
  );
}
