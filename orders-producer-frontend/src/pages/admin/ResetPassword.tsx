import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Token inválido o expirado.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'No se pudo restablecer la contraseña.');
      }
    } catch (err) {
      setError('Error al restablecer la contraseña.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] via-[#414345] to-[#232526]">
      <form onSubmit={onSubmit} className="bg-white/90 shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold text-neutral-800 mb-2 text-center">Restablecer Contraseña</h1>
        {success ? (
          <div className="text-green-600 text-center">¡Contraseña actualizada! Redirigiendo al login...</div>
        ) : (
          <>
            {error && <div className="text-red-600 text-sm mb-2 text-center">{error}</div>}
            <label htmlFor="new-password" className="block text-sm font-semibold text-neutral-700">Nueva contraseña</label>
            <div className="relative mb-2">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                className="border border-neutral-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-orange-400 focus:border-transparent transition pr-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-orange-500 focus:outline-none"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.12 2.12A9.004 9.004 0 0012 5c-2.28 0-4.37.8-6.12 2.12M3 12c0 1.61.38 3.13 1.05 4.44M21 12c0-1.61-.38-3.13-1.05-4.44M9.88 9.88L3 3m0 0l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.12 2.12A9.004 9.004 0 0012 5c-2.28 0-4.37.8-6.12 2.12M3 12c0 1.61.38 3.13 1.05 4.44M21 12c0-1.61-.38-3.13-1.05-4.44" />
                  </svg>
                )}
              </button>
            </div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-neutral-700">Confirmar contraseña</label>
            <div className="relative mb-4">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                className="border border-neutral-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-orange-400 focus:border-transparent transition pr-12"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-orange-500 focus:outline-none"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.12 2.12A9.004 9.004 0 0012 5c-2.28 0-4.37.8-6.12 2.12M3 12c0 1.61.38 3.13 1.05 4.44M21 12c0-1.61-.38-3.13-1.05-4.44M9.88 9.88L3 3m0 0l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.12 2.12A9.004 9.004 0 0012 5c-2.28 0-4.37.8-6.12 2.12M3 12c0 1.61.38 3.13 1.05 4.44M21 12c0-1.61-.38-3.13-1.05-4.44" />
                  </svg>
                )}
              </button>
            </div>
            <button disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-3 w-full font-bold text-lg transition-colors shadow disabled:opacity-60">{loading ? 'Guardando...' : 'Restablecer'}</button>
          </>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
