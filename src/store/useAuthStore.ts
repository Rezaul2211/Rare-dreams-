import { create } from 'zustand';
import { User } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

const ADMIN_EMAIL = 'xmrezaul.karim998@gmail.com';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('rare_dreams_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rare_dreams_user');
    }
    set({ user });
  },
  setLoading: (loading) => set({ loading }),
  initialize: () => {
    // First load from localStorage for instant response on custom domains like Vercel
    const cachedUser = localStorage.getItem('rare_dreams_user');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        set({ user: parsed, loading: false });
      } catch (e) {
        console.error("Error parsing cached user", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          const isAdminEmail = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;

          if (userDoc.exists()) {
            const data = userDoc.data();
            const role = (isAdminEmail || data.role === 'admin') ? 'admin' : (data.role || 'customer');
            
            if (isAdminEmail && data.role !== 'admin') {
              setDoc(userRef, { role: 'admin' }, { merge: true }).catch(console.error);
            }

            const activeUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || data.email || '',
              displayName: firebaseUser.displayName || data.displayName || '',
              role: role,
              createdAt: data.createdAt || new Date()
            };

            localStorage.setItem('rare_dreams_user', JSON.stringify(activeUser));
            set({ user: activeUser, loading: false });
          } else {
            const role = isAdminEmail ? 'admin' : 'customer';
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: role,
              createdAt: new Date()
            };
            
            setDoc(userRef, newUser).catch(console.error);
            localStorage.setItem('rare_dreams_user', JSON.stringify(newUser));
            set({ user: newUser, loading: false });
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          const isAdminEmail = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;
          const fallbackUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: isAdminEmail ? 'admin' : 'customer',
            createdAt: new Date()
          };
          localStorage.setItem('rare_dreams_user', JSON.stringify(fallbackUser));
          set({ user: fallbackUser, loading: false });
        }
      } else {
        localStorage.removeItem('rare_dreams_user');
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  }
}));

