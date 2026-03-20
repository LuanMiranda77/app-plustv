import { create } from 'zustand';
import type { StreamType } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface FavoritesState {
  favorites: Array<any>;
  currentProfileId: string | null;

  // Profile management
  setCurrentProfile: (profileId: string | null) => void;

  isFavorite: (id: string) => boolean;
  addFavorite: (item: any, type: StreamType) => void;
  removeFavorite: (id: string) => void;
  getFavoritesByType: (type: 'live' | 'movie' | 'series') => Array<any>;
  loadFromStorage: () => void;
  loadProfileFavorites: (profileId: string) => void;
  clearFavorites: () => void;
}

// Gera a chave de storage com o profileId
const getFavoritesKey = (profileId: string | null) => {
  return profileId ? `${STORAGE_KEYS.FAVORITES}_${profileId}` : STORAGE_KEYS.FAVORITES;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  currentProfileId: null,

  setCurrentProfile: (profileId) => {
    set({ currentProfileId: profileId });
    if (profileId) {
      get().loadProfileFavorites(profileId);
    }
  },

  loadProfileFavorites: (profileId) => {
    const key = getFavoritesKey(profileId);
    const stored = storage.get(key) || [];
    set({ favorites: stored, currentProfileId: profileId });
  },

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

      // Salva com chave do perfil atual
      const key = getFavoritesKey(state.currentProfileId);
      storage.set(key, updated);

      return { favorites: updated };
    });
  },

  removeFavorite: (id: string) => {
    set((state) => {
      const updated = state.favorites.filter((item) => item.id !== id);

      // Salva com chave do perfil atual
      const key = getFavoritesKey(state.currentProfileId);
      storage.set(key, updated);

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
    const state = get();
    const key = getFavoritesKey(state.currentProfileId);
    storage.remove(key);
    set({ favorites: [] });
  },
}));
