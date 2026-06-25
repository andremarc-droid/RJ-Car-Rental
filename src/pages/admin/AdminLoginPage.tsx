import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const ADMIN_EMAILS = ['admin@carrental.com', 'admin@driveph.com'];

async function checkIsAdmin(uid: string, email: string | null): Promise<boolean> {
  if (ADMIN_EMAILS.includes(email ?? '')) return true;
  const adminDoc = await getDoc(doc(db, 'admins', uid));
  if (adminDoc.exists()) return true;
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() && userDoc.data().role === 'admin';
}

export default function AdminLoginPage() {
  const { user, isAdmin, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Authentication failed');

      const admin = await checkIsAdmin(currentUser.uid, currentUser.email);
      if (!admin) {
        await signOut(auth);
        setError('You do not have admin access.');
        setSubmitting(false);
        return;
      }

      navigate('/admin/dashboard');
    } catch (e: any) {
      const code = e?.code || '';
      const message = e?.message || '';
      let friendlyMessage = 'These credentials do not match our records.';
      
      if (code === 'auth/invalid-credential' || message.includes('auth/invalid-credential') || message.includes('invalid-credential')) {
        friendlyMessage = 'Invalid email address or password. Please try again.';
      } else if (code === 'auth/wrong-password' || message.includes('wrong-password')) {
        friendlyMessage = 'Incorrect password. Please try again.';
      } else if (code === 'auth/user-not-found' || message.includes('user-not-found')) {
        friendlyMessage = 'No admin account found with this email address.';
      } else if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
        friendlyMessage = 'Please enter a valid email address.';
      } else if (code === 'auth/user-disabled' || message.includes('user-disabled')) {
        friendlyMessage = 'This admin account has been disabled.';
      } else if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
        friendlyMessage = 'Too many failed login attempts. Please try again later.';
      } else if (message) {
        friendlyMessage = message;
      }
      setError(friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-150 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center">
          <span className="text-2xl font-black tracking-wider text-navy">RJ<span className="text-accent"> Car Rental</span></span>
          <h2 className="text-xl font-bold text-navy mt-3">Admin Portal</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Please sign in to access your administrative dashboard</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">{error}</div>}

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="premium-input bg-gray-50" placeholder="admin@carrental.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="premium-input bg-gray-50" placeholder="••••••••" />
          </div>
          <button type="button" onClick={handleLogin} disabled={submitting} className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-navy hover:bg-navy-dark text-white font-bold transition-all shadow-md text-sm disabled:opacity-50">
            {submitting ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
