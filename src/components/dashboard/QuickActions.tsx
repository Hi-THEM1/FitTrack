import React from 'react';
import { Plus, Activity, Apple, Scale, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function QuickActions() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language as 'en' | 'fr';

  const actions = [
    { 
      id: 'workout',
      icon: Activity, 
      label: { en: 'New Workout', fr: 'Nouvelle Séance' }, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      path: '/exercises'
    },
    { 
      id: 'meal',
      icon: Apple, 
      label: { en: 'Log Meal', fr: 'Noter un repas' }, 
      color: 'text-warning', 
      bg: 'bg-warning/10',
      path: '/nutrition'
    },
    { 
      id: 'weight',
      icon: Scale, 
      label: { en: 'Update Weight', fr: 'Poids Actuel' }, 
      color: 'text-gold', 
      bg: 'bg-gold/10',
      path: '/profile'
    },
    { 
      id: 'history',
      icon: History, 
      label: { en: 'History', fr: 'Historique' }, 
      color: 'text-success', 
      bg: 'bg-success/10',
      path: '/progress'
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button 
          key={action.id}
          onClick={() => navigate(action.path)}
          className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-3 group transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
            <action.icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-text-main uppercase tracking-widest text-center">
            {action.label[lang]}
          </span>
        </button>
      ))}
    </div>
  );
}
