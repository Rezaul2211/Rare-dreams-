cat src/store/useCategoryStore.ts | sed -n '1,74p' > temp.ts
cat << 'INNEREOF' >> temp.ts
export const useCategoryStore = create<CategoryState>((set, get) => {
  const getInitialCategories = () => {
    try {
      const cached = localStorage.getItem('rare_dreams_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return sortCategoriesByStandardOrder(DEFAULT_CATEGORIES);
  };

  return {
    categories: getInitialCategories(),
    loading: true,
    fetchCategories: () => {
      try {
        const docRef = doc(db, 'settings', 'categories');
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.list && Array.isArray(data.list) && data.list.length > 0) {
              const sorted = sortCategoriesByStandardOrder(data.list);
              set({ categories: sorted, loading: false });
              localStorage.setItem('rare_dreams_categories', JSON.stringify(sorted));
            } else {
              set({ categories: sortCategoriesByStandardOrder(DEFAULT_CATEGORIES), loading: false });
              localStorage.removeItem('rare_dreams_categories');
            }
          } else {
            set({ categories: sortCategoriesByStandardOrder(DEFAULT_CATEGORIES), loading: false });
            localStorage.removeItem('rare_dreams_categories');
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
      localStorage.setItem('rare_dreams_categories', JSON.stringify(newCategories));
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
        link: newCat.link || \`/category/\${encodeURIComponent(newCat.title)}\`,
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
          current[index].link = \`/category/\${updatedFields.title}\`;
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
  };
});
INNEREOF
mv temp.ts src/store/useCategoryStore.ts
