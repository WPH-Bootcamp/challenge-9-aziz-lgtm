import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie } from '@/types/movie';

interface Toast {
  message: string;
  visible: boolean;
}

interface MovieStore {
  favorites: Movie[];
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toast: Toast;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useMovieStore = create<MovieStore>()(
  // persist saves the store to localStorage automatically
  persist(
    (set, get) => ({
      favorites: [],

      addToFavorites: (movie) => {
        set((state) => ({ favorites: [...state.favorites, movie] }));
        get().showToast('Success Add to Favorites');
      },

      removeFromFavorites: (id) =>
        set((state) => ({ favorites: state.favorites.filter((m) => m.id !== id) })),

      // get() reads the current snapshot without subscribing to state — safe to call outside React render
      isFavorite: (id) => get().favorites.some((m) => m.id === id),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      toast: { message: '', visible: false },
      showToast: (message) => {
        set({ toast: { message, visible: true } });
        setTimeout(() => set({ toast: { message: '', visible: false } }), 3000);
      },
      hideToast: () => set({ toast: { message: '', visible: false } }),
    }),
    {
      name: 'movie-favorites',
      partialize: (state) => ({ favorites: state.favorites, searchQuery: state.searchQuery }),
    }
  )
);
