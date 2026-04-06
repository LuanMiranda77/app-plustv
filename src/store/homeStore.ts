import { create } from 'zustand';
import type { Channel, Movie, Series, ServerConfig } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

export type typeHistory = 'topChannel' | 'trendingSeries' | 'trendingMovies' | 'newSeries' | 'newMovies';

interface HomeState {
  topChannel: Channel[];
  trendingSeries: Movie[];
  trendingMovies: Series[];
  newSeries: Movie[];
  newMovies: Series[];

  addToHistory: (item: any, type: typeHistory, config: ServerConfig) => void;
  removeFromHistory: (id: string, type: typeHistory, config: ServerConfig) => void;
  clearHistory: (config: ServerConfig) => void;
  loadFromStorage: (config: ServerConfig) => void;
}

// Gera a chave de storage com o profileId
const getHistoryKey = (config: ServerConfig) => {
  return `${STORAGE_KEYS.HOME_HISTORY}_${config.url}`;
};

export const useHomeStore = create<HomeState>((set, get) => ({
  topChannel: [],
  trendingSeries: [],
  trendingMovies: [],
  newSeries: [],
  newMovies: [],

  addToHistory: (item, type, config) => {
    set(state => {
      const newState = { ...state, [type]: item };
      const key = getHistoryKey(config);
      storage.set(key, newState);
      return newState;
    });
  },

  removeFromHistory: (id, type, config) => {
    set(state => {
      const updated = state[type].filter(item => item.id !== id);
      const newState = { ...state, [type]: updated };
      const key = getHistoryKey(config);
      storage.set(key, updated);

      return { ...newState };
    });
  },

  clearHistory: config => {
    set(() => {
      const key = getHistoryKey(config);
      storage.remove(key);
      return {
        topChannel: [],
        trendingSeries: [],
        trendingMovies: [],
        newSeries: [],
        newMovies: []
      };
    });
  },

  getHistory: (type: typeHistory) => {
    return get()[type];
  },

  loadFromStorage: config => {
    const key = getHistoryKey(config);
    const cached = storage.get(key);
    if (cached) {
      set({
        topChannel: cached.topChannel,
        trendingSeries: cached.trendingSeries,
        trendingMovies: cached.trendingMovies,
        newSeries: cached.newSeries,
        newMovies: cached.newMovies
      });
    }
  }
}));
