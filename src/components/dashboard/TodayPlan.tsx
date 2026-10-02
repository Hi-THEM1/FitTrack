import React, { useState, useEffect } from 'react';
import { Play, Clock, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../../context/WorkoutSessionContext';
import { useAuth } from '../../context/AuthContext';
import { workoutService } from '../../services/workoutService';

export default function TodayPlan() {
  const navigate = useNavigate();
  const { startSession } = useWorkoutSession();
  const { user } = useAuth();
  const [smartTemplate, setSmartTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      if (user) {
        const plan = await workoutService.generateSmartProgram(user.id, user);
        setSmartTemplate(plan);
      }
      setLoading(false);
    }
    loadPlan();
  }, [user]);

  const handleStart = async () => {
    if (smartTemplate) {
      await startSession(smartTemplate);
      navigate(`/workout/active/smart-${Date.now()}`);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-brand-blue/10 to-transparent relative overflow-hidden group">
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-primary mb-4">
          <Target className="w-5 h-5" />
          <span className="font-display font-bold text-sm uppercase tracking-widest">Plan d'aujourd'hui</span>
        </div>
        
        <h2 className="font-display text-3xl font-bold text-text-main mb-2">
          {smartTemplate?.name || "Préparation..."}
        </h2>
        <p className="text-text-muted text-sm mb-6 max-w-[80%]">
          {smartTemplate?.description || "Votre coach IA a préparé une séance optimisée pour vos objectifs."}
        </p>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" />
            <span className="font-mono text-sm font-medium text-text-main">45 MIN</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-muted" />
            <span className="font-mono text-sm font-medium text-text-main">350 KCAL</span>
          </div>
        </div>
        
        <button 
          onClick={handleStart}
          className="btn-press w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition-colors"
        >
          <Play className="w-5 h-5 fill-current" />
          COMMENCER LA SÉANCE
        </button>
      </div>
    </div>
  );
}
