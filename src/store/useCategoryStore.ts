import { create } from 'zustand';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CategoryItem {
  id?: string;
  title: string;
  link: string;
  image?: string;
  description?: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'mens-items',
    title: "Men's items",
    link: "/category/Men's items",
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'womens-items',
    title: "Women's items",
    link: "/category/Women's items",
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'baby-items',
    title: 'Baby items',
    link: '/category/Baby items',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'foot-wear',
    title: 'Foot wear',
    link: '/category/Foot wear',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop'
  }
];

interface CategoryState {
  categories: CategoryItem[];
  loading: boolean;
  fetchCategories: () => void;
  saveCategories: (categories: CategoryItem[]) => Promise<void>;
  addCategory: (category: Omit<CategoryItem, 'id'>) => Promise<void>;
  updateCategory: (index: number, category: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (index: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  loading: true,

  fetchCategories: () => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.list && Array.isArray(data.list) && data.list.length > 0) {
            set({ categories: data.list, loading: false });
          } else {
            set({ categories: DEFAULT_CATEGORIES, loading: false });
          }
        } else {
          set({ categories: DEFAULT_CATEGORIES, loading: false });
        }
      }, (error) => {
        console.error("Firestore categories listener error:", error);
        set({ loading: false });
      });
    } catch (err) {
      console.error("Error setting categories listener:", err);
      set({ loading: false });
    }
  },

  saveCategories: async (newCategories: CategoryItem[]) => {
    set({ categories: newCategories });
    try {
      const docRef = doc(db, 'settings', 'categories');
      await setDoc(docRef, { list: newCategories }, { merge: true });
    } catch (error) {
      console.error("Error saving categories to Firestore:", error);
      throw error;
    }
  },

  addCategory: async (newCat: Omit<CategoryItem, 'id'>) => {
    const current = get().categories;
    const catItem: CategoryItem = {
      id: crypto.randomUUID(),
      title: newCat.title,
      link: newCat.link || `/category/${encodeURIComponent(newCat.title)}`,
      image: newCat.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      description: newCat.description || ''
    };
    const updated = [...current, catItem];
    await get().saveCategories(updated);
  },

  updateCategory: async (index: number, updatedFields: Partial<CategoryItem>) => {
    const current = [...get().categories];
    if (index >= 0 && index < current.length) {
      current[index] = { ...current[index], ...updatedFields };
      if (updatedFields.title && !updatedFields.link) {
        current[index].link = `/category/${updatedFields.title}`;
      }
      await get().saveCategories(current);
    }
  },

  deleteCategory: async (index: number) => {
    const current = [...get().categories];
    if (index >= 0 && index < current.length) {
      current.splice(index, 1);
      await get().saveCategories(current);
    }
  }
}));
