import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ChevronRight, ArrowLeft, Target, Activity, Check, Scale, Ruler } from 'lucide-react';

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { updateOnboarding } = useAuth();
  const { language } = useLanguage();
  
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    goal: '',
    fitnessLevel: '',
    workoutDaysPerWeek: 3,
    heightCm: 175,
    weightKg: 70
  });

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishOnboarding = async () => {
    setIsLoading(true);
    try {
      // Premium delay for "AI Analysis" feel
      await new Promise(resolve => setTimeout(resolve, 2000));
      const { error } = await updateOnboarding({
        goal: profileData.goal,
        fitnessLevel: profileData.fitnessLevel,
        weightKg: profileData.weightKg,
        heightCm: profileData.heightCm,
      });
      
      if (error) {
        console.error('Onboarding failed:', error);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-success/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-10 border border-white/5 relative flex flex-col min-h-[600px] shadow-2xl">
        {/* Progress Strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 overflow-hidden rounded-t-[2.5rem]">
          <div 
            className="h-full bg-gradient-to-r from-brand-blue to-energy-cyan transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-10">
          {step > 1 && !isLoading ? (
            <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors text-text-muted">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : <div className="w-8"></div>}
          
          <div className="flex flex-col items-center">
            <span className="font-display font-black text-primary text-xs uppercase tracking-[0.3em] mb-1">
               {language === 'fr' ? 'Étape' : 'Step'} {step}
            </span>
            <div className="flex gap-1.5">
               {Array.from({ length: totalSteps }).map((_, i) => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-primary' : 'bg-white/10'}`} />
               ))}
            </div>
          </div>

          <div className="w-8"></div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500">
              <h2 className="font-display text-4xl font-black text-text-main uppercase tracking-tight leading-[0.9] mb-3">
                {language === 'fr' ? 'VOTRE' : 'YOUR'}<br/>
                <span className="text-primary">{language === 'fr' ? 'OBJECTIF' : 'GOAL'}</span>
              </h2>
              <p className="text-text-muted mb-8 text-sm font-medium">
                {language === 'fr' ? 'Commençons par définir votre destination.' : 'Let\'s start by defining your destination.'}
              </p>
              <div className="space-y-4">
                {[
                  { id: 'lose_weight', labelFr: 'Perdre du Poids', labelEn: 'Lose Weight', icon: Scale, color: 'text-warning', bg: 'bg-warning/10' },
                  { id: 'gain_muscle', labelFr: 'Prendre du Muscle', labelEn: 'Gain Muscle', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
                  { id: 'improve_endurance', labelFr: 'Endurance', labelEn: 'Improve Endurance', icon: Activity, color: 'text-success', bg: 'bg-success/10' }
                ].map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = profileData.goal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setProfileData({ ...profileData, goal: goal.id })}
                      className={`w-full p-5 rounded-2xl flex items-center gap-5 transition-all duration-300 border text-left group ${
                        isSelected 
                          ? 'border-primary bg-primary/10 scale-[1.02] shadow-xl' 
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-primary text-white' : `${goal.bg} ${goal.color}`}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`font-bold text-lg uppercase tracking-tight ${isSelected ? 'text-text-main' : 'text-text-muted group-hover:text-text-main'}`}>
                        {language === 'fr' ? goal.labelFr : goal.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500">
              <h2 className="font-display text-4xl font-black text-text-main uppercase tracking-tight leading-[0.9] mb-3">
                {language === 'fr' ? 'VOTRE' : 'YOUR'}<br/>
                <span className="text-success">{language === 'fr' ? 'NIVEAU' : 'LEVEL'}</span>
              </h2>
              <p className="text-text-muted mb-8 text-sm font-medium">
                {language === 'fr' ? 'Soyez honnête, l\'IA s\'adaptera à vous.' : 'Be honest, the AI will adapt to you.'}
              </p>
              <div className="space-y-4">
                {[
                  { id: 'beginner', labelFr: 'Débutant', labelEn: 'Beginner', desc: { fr: 'Moins de 6 mois de pratique', en: 'Less than 6 months' } },
                  { id: 'intermediate', labelFr: 'Intermédiaire', labelEn: 'Intermediate', desc: { fr: '1 à 2 ans de pratique régulière', en: '1-2 years of regular practice' } },
                  { id: 'advanced', labelFr: 'Avancé', labelEn: 'Advanced', desc: { fr: 'Plus de 3 ans de pratique intensive', en: '3+ years of intensive training' } }
                ].map((lvl) => {
                  const isSelected = profileData.fitnessLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => setProfileData({ ...profileData, fitnessLevel: lvl.id })}
                      className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all duration-300 border group ${
                        isSelected 
                          ? 'border-success bg-success/10 scale-[1.02] shadow-xl' 
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <span className={`block font-bold text-lg uppercase tracking-tight ${isSelected ? 'text-text-main' : 'text-text-muted group-hover:text-text-main'}`}>
                          {language === 'fr' ? lvl.labelFr : lvl.labelEn}
                        </span>
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest mt-1 opacity-70">
                           {language === 'fr' ? lvl.desc.fr : lvl.desc.en}
                        </span>
                      </div>
                      {isSelected && <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white"><Check className="w-5 h-5" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500">
              <h2 className="font-display text-4xl font-black text-text-main uppercase tracking-tight leading-[0.9] mb-3">
                {language === 'fr' ? 'VOS' : 'YOUR'}<br/>
                <span className="text-gold">{language === 'fr' ? 'MESURES' : 'METRICS'}</span>
              </h2>
              <p className="text-text-muted mb-8 text-sm font-medium">
                {language === 'fr' ? 'Ces données permettent de calibrer vos macros.' : 'Data used to calibrate your macro targets.'}
              </p>
              <div className="space-y-8">
                <div className="relative">
                  <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 ml-1">
                    <Ruler className="w-3 h-3" /> {language === 'fr' ? 'Taille (cm)' : 'Height (cm)'}
                  </label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={profileData.heightCm}
                      onChange={(e) => setProfileData({ ...profileData, heightCm: parseInt(e.target.value) })}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-6 text-center font-mono text-4xl font-black text-text-main focus:outline-none focus:border-gold/50 transition-all"
                    />
                    <div className="absolute inset-0 border-2 border-gold opacity-0 group-focus-within:opacity-20 rounded-2xl pointer-events-none transition-opacity"></div>
                  </div>
                </div>
                
                <div className="relative">
                  <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 ml-1">
                    <Scale className="w-3 h-3" /> {language === 'fr' ? 'Poids actuel (kg)' : 'Current Weight (kg)'}
                  </label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={profileData.weightKg}
                      onChange={(e) => setProfileData({ ...profileData, weightKg: parseInt(e.target.value) })}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-6 text-center font-mono text-4xl font-black text-text-main focus:outline-none focus:border-gold/50 transition-all"
                    />
                    <div className="absolute inset-0 border-2 border-gold opacity-0 group-focus-within:opacity-20 rounded-2xl pointer-events-none transition-opacity"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in duration-500">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    <div className="absolute inset-4 rounded-full border border-success/30 animate-[ping_2s_infinite]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display font-black text-primary text-2xl tracking-tighter">AI</span>
                    </div>
                  </div>
                  <h2 className="font-display text-3xl font-black text-text-main uppercase mb-2 tracking-tight">
                    {language === 'fr' ? 'GÉNÉRATION DU PLAN' : 'GENERATING PLAN'}
                  </h2>
                  <p className="text-text-muted text-sm font-medium animate-pulse">
                    {language === 'fr' ? 'Analyse de votre morphotype...' : 'Analyzing your body type...'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-success/10 rounded-3xl flex items-center justify-center mb-8 border border-success/20 rotate-12">
                    <Check className="w-12 h-12 text-success -rotate-12" />
                  </div>
                  <h2 className="font-display text-4xl font-black text-text-main uppercase mb-3 tracking-tight">
                    {language === 'fr' ? 'PRÊT À L\'ACTION' : 'READY FOR ACTION'}
                  </h2>
                  <p className="text-text-muted mb-10 text-sm font-medium px-4 leading-relaxed">
                    {language === 'fr' 
                      ? 'Votre écosystème d\'entraînement personnalisé a été configuré avec succès.' 
                      : 'Your personalized training ecosystem has been successfully configured.'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* CTA Footer */}
        <div className="mt-10 h-[72px]">
          {step < totalSteps ? (
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && !profileData.goal) ||
                (step === 2 && !profileData.fitnessLevel)
              }
              className="btn-press w-full h-full bg-primary text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all disabled:opacity-30 disabled:hover:scale-100 flex justify-center items-center gap-3"
            >
              {language === 'fr' ? 'CONTINUER' : 'CONTINUE'}
              <ChevronRight className="w-6 h-6" />
            </button>
          ) : (
            !isLoading && (
              <button 
                onClick={finishOnboarding}
                className="btn-press w-full h-full bg-success text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all flex justify-center items-center"
              >
                {language === 'fr' ? 'ACCÉDER AU DASHBOARD' : 'GO TO DASHBOARD'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
