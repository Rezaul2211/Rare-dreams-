import { create } from 'zustand';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoreConfig } from '../types';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  facebookUrl: 'https://facebook.com/raredreamsbd',
  instagramUrl: 'https://instagram.com/raredreamsbd',
  whatsappNumber: '+8801712345678',
  youtubeUrl: 'https://youtube.com/@raredreamsbd',
  tiktokUrl: 'https://tiktok.com/@raredreamsbd',
  helplineNumber: '+880 1712-345678',
  supportEmail: 'support@raredreams.com.bd',
  tradeLicenseNo: 'TRAD/DNCC/012984/2026',
  tinNo: '849201948123',
  dbidNo: 'DBID-2026-884129',
  address: 'Level 4, Block B, Jamuna Future Park, Dhaka, Bangladesh',
  bkashNumber: '01712345678',
  nagadNumber: '01812345678',
  rocketNumber: '01912345678',
};

interface StoreConfigState {
  config: StoreConfig;
  loading: boolean;
  fetchConfig: () => void;
  updateConfig: (newConfig: Partial<StoreConfig>) => Promise<void>;
}

export const useStoreConfigStore = create<StoreConfigState>((set, get) => ({
  config: DEFAULT_STORE_CONFIG,
  loading: true,

  fetchConfig: () => {
    try {
      const docRef = doc(db, 'settings', 'storeConfig');
      // Set real-time listener so any update by Admin reflects instantly for all users
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<StoreConfig>;
          set({
            config: { ...DEFAULT_STORE_CONFIG, ...data },
            loading: false,
          });
        } else {
          set({ config: DEFAULT_STORE_CONFIG, loading: false });
        }
      }, (error) => {
        console.error("Firestore storeConfig listener error:", error);
        set({ loading: false });
      });
    } catch (err) {
      console.error("Error setting storeConfig listener:", err);
      set({ loading: false });
    }
  },

  updateConfig: async (newConfig: Partial<StoreConfig>) => {
    const updated = { ...get().config, ...newConfig };
    set({ config: updated });
    try {
      const docRef = doc(db, 'settings', 'storeConfig');
      await setDoc(docRef, updated, { merge: true });
    } catch (error) {
      console.error("Error saving storeConfig to Firestore:", error);
      throw error;
    }
  },
}));
