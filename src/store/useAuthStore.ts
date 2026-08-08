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
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          const isAdminEmail = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;

          if (userDoc.exists()) {
            const data = userDoc.data();
            const role = (isAdminEmail || data.role === 'admin') ? 'admin' : (data.role || 'customer');
            
            // Sync admin role to firestore if needed
            if (isAdminEmail && data.role !== 'admin') {
              setDoc(userRef, { role: 'admin' }, { merge: true }).catch(console.error);
            }

            set({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || data.email || '',
                displayName: firebaseUser.displayName || data.displayName || '',
                role: role,
                createdAt: data.createdAt || new Date()
              },
              loading: false
            });
          } else {
            const role = isAdminEmail ? 'admin' : 'customer';
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: role,
              createdAt: new Date()
            };
            
            // Asynchronously persist new user document
            setDoc(userRef, newUser).catch(console.error);

            set({ user: newUser, loading: false });
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          const isAdminEmail = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: isAdminEmail ? 'admin' : 'customer',
              createdAt: new Date()
            },
            loading: false
          });
        }
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  }
}));

