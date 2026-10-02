import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strength = getStrength(formData.password);
  const strengthColors = ['bg-[var(--surface)]', 'bg-[var(--danger)]', 'bg-[var(--gold)]', 'bg-[var(--success)]', 'bg-[var(--success)]'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (strength < 2) {
      setError(language === 'fr' ? 'Le mot de passe est trop faible' : 'Password is too weak');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await register(formData);
      if (error) {
        setError(error);
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Decor */}
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[var(--success)] rounded-full mix-blend-multiply filter blur-[150px] opacity-10"></div>

      <Link to="/login" className="absolute top-6 left-6 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-bold uppercase tracking-widest text-[10px]">{language === 'fr' ? 'Connexion' : 'Back to login'}</span>
      </Link>

      <div className="max-w-md w-full glass-card rounded-3xl p-10 border border-white/5 relative z-10">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-black text-[var(--text-main)] uppercase tracking-tight">
            {language === 'fr' ? 'Inscription' : 'Sign Up'}
          </h2>
          <p className="text-[var(--text-muted)] mt-2 text-sm font-medium">
            {language === 'fr' ? 'Rejoignez la révolution FitTrack.' : 'Join the FitTrack revolution.'}
          </p>
        </div>

        {error && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] p-4 rounded-xl mb-6 flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold uppercase">{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                {language === 'fr' ? 'Prénom' : 'First Name'}
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--surface)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)]/50 text-[var(--text-main)] transition-all placeholder:text-[var(--text-muted)]/50 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                {language === 'fr' ? 'Nom' : 'Last Name'}
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--surface)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)]/50 text-[var(--text-main)] transition-all placeholder:text-[var(--text-muted)]/50 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-[var(--surface)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)]/50 text-[var(--text-main)] transition-all placeholder:text-[var(--text-muted)]/50 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
              {language === 'fr' ? 'Mot de passe' : 'Password'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-[var(--surface)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)]/50 text-[var(--text-main)] transition-all placeholder:text-[var(--text-muted)]/50 text-sm"
              required
            />

            {formData.password && (
              <div className="pt-2 px-1">
                <div className="flex gap-1.5 h-1.5 mb-2">
                  {[1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`flex-1 rounded-full transition-all duration-500 ${strength >= level ? strengthColors[strength] : 'bg-[var(--surface)]'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                  {strength <= 1 && (language === 'fr' ? 'Faible' : 'Weak')}
                  {strength === 2 && (language === 'fr' ? 'Moyen' : 'Fair')}
                  {strength === 3 && (language === 'fr' ? 'Bon' : 'Good')}
                  {strength === 4 && (language === 'fr' ? 'Très Fort' : 'Strong')}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[var(--primary)] text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,77,0,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center min-h-[64px]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              language === 'fr' ? "S'INSCRIRE" : 'SIGN UP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
