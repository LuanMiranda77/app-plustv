import { create } from 'zustand';
import type { ServerConfig, StreamType } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface FavoritesState {
  favorites: Array<any>;
  currentProfileId: string | null;

  // Profile management
  setCurrentProfile: (profileId: string | null, config: ServerConfig) => void;

  isFavorite: (id: string) => boolean;
  addFavorite: (item: any, type: StreamType, config: ServerConfig) => void;
  removeFavorite: (id: string, config: ServerConfig) => void;
  getFavoritesByType: (type: 'live' | 'movie' | 'series') => Array<any>;
  loadFromStorage: () => void;
  loadProfileFavorites: (profileId: string, config: ServerConfig) => void;
  clearFavorites: (config: ServerConfig) => void;
}

// Gera a chave de storage com o profileId
const getFavoritesKey = (profileId: string | null, config:ServerConfig) => {
  return profileId ? `${STORAGE_KEYS.FAVORITES}_${profileId}_${config.url}` : STORAGE_KEYS.FAVORITES;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  currentProfileId: null,

  setCurrentProfile: (profileId, config) => {
    set({ currentProfileId: profileId });
    if (profileId) {
      get().loadProfileFavorites(profileId, config);
    }
  },

  loadProfileFavorites: (profileId, config) => {
    const key = getFavoritesKey(profileId, config);
    const stored = storage.get(key) || [];
    set({ favorites: stored, currentProfileId: profileId });
  },

  isFavorite: (id: string) => {
    return get().favorites.some(item => item.id == id);
  },

  addFavorite: (item, type, config) => {
    set(state => {
      if (state.favorites.some(f => f.id === item.id)) {
        return state;
      }
      item.type = type; // Adiciona o tipo ao item
      const updated = [...state.favorites, item];

      // Salva com chave do perfil atual
      const key = getFavoritesKey(state.currentProfileId, config);
      storage.set(key, updated);

      return { favorites: updated };
    });
  },

  removeFavorite: (id: string, config: ServerConfig) => {
    set(state => {
      const updated = state.favorites.filter(item => item.id !== id);

      // Salva com chave do perfil atual
      const key = getFavoritesKey(state.currentProfileId, config);
      storage.set(key, updated);

      return { favorites: updated };
    });
  },

  getFavoritesByType: (type: 'live' | 'movie' | 'series') => {
    const favorites = get().favorites;
    return favorites.filter(f => f.type === type);
  },

  loadFromStorage: () => {
    const stored = storage.get(STORAGE_KEYS.FAVORITES) || [];
    set({ favorites: stored });
  },

  clearFavorites: (config: ServerConfig) => {
    const state = get();
    const key = getFavoritesKey(state.currentProfileId, config);
    storage.remove(key);
    set({ favorites: [] });
  }
}));
