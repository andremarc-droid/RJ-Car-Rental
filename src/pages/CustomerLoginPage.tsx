import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function CustomerLoginPage() {
  const { user, isAdmin, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && !isAdmin) {
    return <Navigate to="/bookings" replace />;
  }

  if (!loading && user && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } else {
        await login(email, password);
      }
      navigate('/bookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-150 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center">
          <span className="text-2xl font-black text-navy">RJ<span className="text-accent"> Car Rental</span></span>
          <h2 className="text-xl font-bold text-navy mt-3">{isRegister ? 'Create Account' : 'Customer Sign In'}</h2>
          <p className="text-xs text-gray-400 mt-1">Sign in to view bookings and use live support chat</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="premium-input bg-gray-50" required />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="premium-input bg-gray-50" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="premium-input bg-gray-50" required minLength={6} />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold disabled:opacity-50">
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button type="button" onClick={() => setIsRegister(!isRegister)} className="w-full text-xs text-gray-500 hover:text-navy">
          {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
        </button>

        <p className="text-center text-xs text-gray-400">
          <Link to="/" className="hover:text-navy">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
