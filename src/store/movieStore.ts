import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie } from '@/types/movie';

interface MovieStore {
  favorites: Movie[];
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useMovieStore = create<MovieStore>()(
  // persist saves the store to localStorage automatically
  persist(
    (set, get) => ({
      favorites: [],

      addToFavorites: (movie) =>
        set((state) => ({ favorites: [...state.favorites, movie] })),

      removeFromFavorites: (id) =>
        set((state) => ({ favorites: state.favorites.filter((m) => m.id !== id) })),

      // get() reads the current snapshot without subscribing to state — safe to call outside React render
      isFavorite: (id) => get().favorites.some((m) => m.id === id),
    }),
    { name: 'movie-favorites' } // localStorage key
  )
);
