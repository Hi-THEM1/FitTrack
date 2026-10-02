import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Target, Activity, Scale, Ruler, Save, LogOut, Shield, Bell, Moon, Sun, Globe } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateOnboarding, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { theme, changeTheme } = useTheme();
  const lang = language as 'en' | 'fr';

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    goal: user?.goal || '',
    fitnessLevel: user?.fitnessLevel || '',
    weightKg: user?.weightKg || 0,
    heightCm: user?.heightCm || 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    const { error } = await updateOnboarding({
      goal: formData.goal,
      fitnessLevel: formData.fitnessLevel,
      weightKg: formData.weightKg,
      heightCm: formData.heightCm,
    });
    
    if (!error) {
      setMessage(lang === 'fr' ? 'Profil mis à jour !' : 'Profile updated!');
    } else {
      setMessage(error);
    }
    setIsSaving(false);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto flex flex-col gap-12 pb-20">
        <header className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[40px] bg-gradient-to-br from-primary to-gold p-1 shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-all duration-500">
               <div className="w-full h-full rounded-[38px] bg-canvas flex items-center justify-center text-5xl font-display font-black text-text-main overflow-hidden relative">
                 {user?.firstName?.[0].toUpperCase()}
                 <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
            </div>
            <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-surface border border-border rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-all">
              <Activity className="w-5 h-5 text-primary" />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-display text-5xl font-black text-text-main uppercase tracking-tighter">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
              <span className="font-micro text-[10px] text-text-dim tracking-widest uppercase flex items-center gap-2">
                <Mail className="w-3 h-3" /> {user?.email}
              </span>
              <div className="w-1 h-1 rounded-full bg-border" />
              <span className="font-micro text-[10px] text-primary tracking-widest uppercase font-black">PRO MEMBER</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* PHYSICAL DATA CARD */}
            <section className="glass-card p-10 flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-black text-text-main uppercase tracking-tight">
                  {lang === 'fr' ? 'BIO-MÉTRIQUES' : 'BIOMETRICS'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">WEIGHT (KG)</label>
                  <input 
                    type="number" 
                    value={formData.weightKg}
                    onChange={e => setFormData({...formData, weightKg: parseFloat(e.target.value)})}
                    className="w-full h-14 px-6 bg-surface/50 border border-border rounded-2xl text-text-main font-hero text-xl focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">HEIGHT (CM)</label>
                  <input 
                    type="number" 
                    value={formData.heightCm}
                    onChange={e => setFormData({...formData, heightCm: parseFloat(e.target.value)})}
                    className="w-full h-14 px-6 bg-surface/50 border border-border rounded-2xl text-text-main font-hero text-xl focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">PRIMARY GOAL</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['lose_weight', 'gain_muscle', 'maintenance'].map(g => (
                      <button
                        key={g}
                        onClick={() => setFormData({...formData, goal: g})}
                        className={`h-14 px-4 rounded-2xl border font-display font-bold text-xs uppercase tracking-widest transition-all ${
                          formData.goal === g ? 'bg-primary border-primary text-white' : 'bg-surface/30 border-border text-text-dim hover:text-text-main'
                        }`}
                      >
                        {g.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* PREFERENCES CARD */}
            <section className="glass-card p-10 flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-black text-text-main uppercase tracking-tight">
                  {lang === 'fr' ? 'PRÉFÉRENCES' : 'PREFERENCES'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">THEME MODE</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => changeTheme('dark')}
                      className={`flex-1 h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all ${theme === 'dark' ? 'bg-surface border-primary text-primary' : 'bg-surface/30 border-border text-text-dim'}`}
                    >
                      <Moon className="w-4 h-4" /> <span className="font-display font-bold text-[10px] uppercase">FORGE</span>
                    </button>
                    <button 
                      onClick={() => changeTheme('light')}
                      className={`flex-1 h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all ${theme === 'light' ? 'bg-white border-gold text-gold' : 'bg-surface/30 border-border text-text-dim'}`}
                    >
                      <Sun className="w-4 h-4" /> <span className="font-display font-bold text-[10px] uppercase">SANCTUARY</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-micro text-[10px] text-text-dim uppercase tracking-widest">LANGUAGE</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => changeLanguage('en')}
                      className={`flex-1 h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all ${language === 'en' ? 'bg-surface border-primary text-primary' : 'bg-surface/30 border-border text-text-dim'}`}
                    >
                      <Globe className="w-4 h-4" /> <span className="font-display font-bold text-[10px] uppercase">ENGLISH</span>
                    </button>
                    <button 
                      onClick={() => changeLanguage('fr')}
                      className={`flex-1 h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all ${language === 'fr' ? 'bg-surface border-primary text-primary' : 'bg-surface/30 border-border text-text-dim'}`}
                    >
                      <Globe className="w-4 h-4" /> <span className="font-display font-bold text-[10px] uppercase">FRANÇAIS</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-8">
            <div className="glass-card p-8 flex flex-col gap-6">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-16 bg-primary text-white font-display font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                {isSaving ? '...' : <><Save className="w-5 h-5" /> {lang === 'fr' ? 'ENREGISTRER' : 'SAVE CHANGES'}</>}
              </button>

              <button 
                onClick={logout}
                className="w-full h-16 bg-surface/30 border border-border text-text-dim hover:text-white hover:bg-danger hover:border-danger transition-all font-display font-black rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                {lang === 'fr' ? 'DÉCONNEXION' : 'SIGN OUT'}
              </button>

              {message && (
                <div className={`p-4 rounded-xl border text-center font-micro text-[10px] uppercase tracking-widest ${message.includes('error') ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-success/10 border-success/30 text-success'}`}>
                  {message}
                </div>
              )}
            </div>

            <div className="glass-card p-8 bg-primary/5 border-primary/10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="font-display text-sm font-black text-text-main uppercase tracking-widest">PRIVACY & SECURITY</h4>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Cloud Sync', active: true },
                  { label: 'Public Profile', active: false },
                  { label: 'FaceID Login', active: true }
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase">{s.label}</span>
                    <div className={`w-10 h-5 rounded-full transition-all p-1 ${s.active ? 'bg-success' : 'bg-border'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-all ${s.active ? 'translate-x-5' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
