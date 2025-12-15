import React, { useState } from 'react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Llama a tu endpoint de backend para enviar el correo de recuperación
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.message || 'No se pudo enviar el correo.');
      }
    } catch (err) {
      setError('Error al enviar el correo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] via-[#414345] to-[#232526]">
      <form onSubmit={onSubmit} className="bg-white/90 shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold text-neutral-800 mb-2 text-center">Recuperar Contraseña</h1>
        {sent ? (
          <div className="text-green-600 text-center">Si el correo existe, se ha enviado un enlace para restablecer la contraseña.</div>
        ) : (
          <>
            {error && <div className="text-red-600 text-sm mb-2 text-center">{error}</div>}
            <label className="block text-sm font-semibold text-neutral-700">Correo electrónico</label>
            <input type="email" className="border border-neutral-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" value={email} onChange={e=>setEmail(e.target.value)} required />
            <button disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-3 w-full font-bold text-lg transition-colors shadow disabled:opacity-60">{loading ? 'Enviando...' : 'Enviar enlace'}</button>
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
