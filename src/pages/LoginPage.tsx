import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Dumbbell, ArrowLeft, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('demo@fittrack.tn');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await login(email, password);
      if (error) {
        setError(error);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(language === 'fr' ? 'Identifiants invalides' : 'Invalid credentials');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[150px] opacity-10"></div>

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-bold uppercase tracking-widest text-[10px]">{language === 'fr' ? 'Retour' : 'Back'}</span>
      </Link>

      <div className={`max-w-md w-full glass-card rounded-3xl p-10 border border-white/5 relative z-10 ${isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-6 border border-[var(--primary)]/20">
            <Dumbbell className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <h2 className="font-display text-4xl font-black text-[var(--text-main)] uppercase tracking-tight">
            {language === 'fr' ? 'Connexion' : 'Login'}
          </h2>
          <p className="text-[var(--text-muted)] mt-2 text-center text-sm font-medium">
            {language === 'fr' ? 'Prêt à écraser vos objectifs ?' : 'Ready to crush your goals?'}
          </p>
        </div>

        {error && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] p-4 rounded-xl mb-6 flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold uppercase">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-[var(--surface)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)]/50 text-[var(--text-main)] transition-all placeholder:text-[var(--text-muted)]/50"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
              {language === 'fr' ? 'Mot de Passe' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-[var(--surface)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)]/50 text-[var(--text-main)] transition-all placeholder:text-[var(--text-muted)]/50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[var(--primary)] text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,77,0,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-h-[64px]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              language === 'fr' ? 'SE CONNECTER' : 'SIGN IN'
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[var(--text-muted)] text-xs font-medium">
            {language === 'fr' ? 'Pas encore de compte ?' : "Don't have an account?"}{' '}
            <Link to="/register" className="text-[var(--primary)] font-black hover:underline underline-offset-4 transition-all">
              {language === 'fr' ? "S'INSCRIRE" : 'SIGN UP'}
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
