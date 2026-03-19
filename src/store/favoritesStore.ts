import { create } from 'zustand'
import type { StreamType } from '../types'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface FavoritesState {
  favorites: Array<any>;

  isFavorite: (id: string) => boolean;
  addFavorite: (item: any, type: StreamType) => void;
  removeFavorite: (id: string) => void;
  getFavoritesByType: (type: 'live' | 'movie' | 'series') => Array<any>;
  loadFromStorage: () => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  isFavorite: (id: string) => {
    return get().favorites.some((item) => item.id == id);
  },

  addFavorite: (item, type) => {
    set((state) => {
      if (state.favorites.some((f) => f.id === item.id)) {
        return state;
      }
      item.type = type; // Adiciona o tipo ao item
      const updated = [...state.favorites, item];
      storage.set(STORAGE_KEYS.FAVORITES, updated);
      return { favorites: updated };
    });
  },

  removeFavorite: (id: string) => {
    set((state) => {
      const updated = state.favorites.filter((item) => item.id !== id);
      storage.set(STORAGE_KEYS.FAVORITES, updated);
      return { favorites: updated };
    });
  },

  getFavoritesByType: (type: 'live' | 'movie' | 'series') => {
    const favorites = get().favorites;
    return favorites.filter((f) => f.type === type);
  },

  loadFromStorage: () => {
    const stored = storage.get(STORAGE_KEYS.FAVORITES) || [];
    set({ favorites: stored });
  },

  clearFavorites: () => {
    storage.remove(STORAGE_KEYS.FAVORITES);
    set({ favorites: [] });
  },
}));
