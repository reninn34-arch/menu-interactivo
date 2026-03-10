import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';

const STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || 'localStorage';

export const AdminLogin = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(false);
  const { login, isLoading, error } = useAuth();
  const { siteConfig } = useMenu();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(false);
    
    const success = await login(
      password,
      STORAGE_MODE === 'api' ? username : undefined
    );
    
    if (!success) {
      setLocalError(true);
      setPassword('');
      setTimeout(() => setLocalError(false), 3000);
    }
  };

  const displayError = localError || error;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(to bottom right, ${siteConfig.backgroundColor || '#320A0A'}, #0A0604)`
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: `linear-gradient(to bottom right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
              boxShadow: `0 25px 50px -12px ${siteConfig.primaryColor || '#FF9F0A'}80`
            }}
          >
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-gray-400">
            {STORAGE_MODE === 'api' 
              ? 'Ingresa tus credenciales para continuar' 
              : 'Ingresa tu contraseña para continuar'}
          </p>
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="space-y-6">
            {STORAGE_MODE === 'api' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none transition-all"
                  placeholder="admin"
                  autoComplete="username"
                  onFocus={(e) => {
                    e.target.style.borderColor = siteConfig.primaryColor || '#FF9F0A';
                    e.target.style.boxShadow = `0 0 0 2px ${siteConfig.primaryColor || '#FF9F0A'}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#374151';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-gray-800 border rounded-xl text-white focus:outline-none transition-all ${
                    displayError ? 'shake' : ''
                  }`}
                  style={{
                    borderColor: displayError ? '#EF4444' : '#374151'
                  }}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  autoFocus={STORAGE_MODE !== 'api'}
                  onFocus={(e) => {
                    if (!displayError) {
                      e.target.style.borderColor = siteConfig.primaryColor || '#FF9F0A';
                      e.target.style.boxShadow = `0 0 0 2px ${siteConfig.primaryColor || '#FF9F0A'}40`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!displayError) {
                      e.target.style.borderColor = '#374151';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-400">
                  {error || 'Contraseña incorrecta'}
                </span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                boxShadow: `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                  e.currentTarget.style.boxShadow = `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}80`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.boxShadow = `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`;
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Ingresando...</span>
                </>
              ) : (
                'Acceder'
              )}
            </button>
          </div>
        </motion.form>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};
