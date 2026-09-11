import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }

    setIsLoading(true);
    clearError();
    
    try {
      await signUp(email, password, name);
    } catch (err) {
      // Error is handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 dark:from-brand-950 dark:via-brand-900 dark:to-brand-800 p-4">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onSwitchToLogin}
          className="absolute -left-4 top-0 p-2 text-brand-600 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Logo & Title */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-900 dark:text-white font-display">
            FLOW
          </h1>
          <p className="text-brand-600 dark:text-brand-300 mt-2 text-sm">
            Crie a sua conta gratuitamente
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 dark:bg-brand-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-brand-700/50 p-8">
          <h2 className="text-2xl font-bold text-brand-900 dark:text-white mb-2 font-display">
            Começar agora
          </h2>
          <p className="text-brand-600 dark:text-brand-300 text-sm mb-6">
            Preencha os dados para criar conta
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-brand-50/50 dark:bg-brand-800/50 border border-brand-200 dark:border-brand-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-brand-900 dark:text-white placeholder-brand-400"
                  placeholder="João Silva"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-brand-50/50 dark:bg-brand-800/50 border border-brand-200 dark:border-brand-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-brand-900 dark:text-white placeholder-brand-400"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 bg-brand-50/50 dark:bg-brand-800/50 border border-brand-200 dark:border-brand-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-brand-900 dark:text-white placeholder-brand-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">
                Confirmar palavra-passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-brand-50/50 dark:bg-brand-800/50 border border-brand-200 dark:border-brand-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-brand-900 dark:text-white placeholder-brand-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                required 
                className="w-4 h-4 mt-0.5 rounded border-brand-300 text-brand-500 focus:ring-brand-500" 
              />
              <span className="text-xs text-brand-600 dark:text-brand-400">
                Ao criar uma conta, concorda com os nossos{' '}
                <a href="#" className="underline hover:text-brand-700 dark:hover:text-brand-300">
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="#" className="underline hover:text-brand-700 dark:hover:text-brand-300">
                  Política de Privacidade
                </a>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>A criar conta...</span>
                </>
              ) : (
                <>
                  <span>Criar conta</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-brand-200 dark:bg-brand-700" />
            <span className="text-xs text-brand-500 dark:text-brand-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-brand-200 dark:bg-brand-700" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-brand-600 dark:text-brand-400">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-white transition-colors"
            >
              Iniciar sessão
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-brand-600/70 dark:text-brand-400/70 mt-6">
          © 2025 FLOW. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
