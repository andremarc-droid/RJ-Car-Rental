import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const ADMIN_EMAILS = ['admin@carrental.com', 'admin@driveph.com'];

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  displayName: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveIsAdmin(user: User): Promise<boolean> {
  if (ADMIN_EMAILS.includes(user.email ?? '')) return true;

  const adminDoc = await getDoc(doc(db, 'admins', user.uid));
  if (adminDoc.exists()) return true;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists() && userDoc.data().role === 'admin') return true;

  const token = await user.getIdTokenResult();
  if (token.claims.admin === true) return true;

  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsAdmin(await resolveIsAdmin(firebaseUser));
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const value = useMemo(
    () => ({ user, loading, isAdmin, displayName, login, logout }),
    [user, loading, isAdmin, displayName, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
