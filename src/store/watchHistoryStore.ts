import { create } from 'zustand';
import type { Channel, Episode, Movie, Series } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

export interface WatchHistoryItem {
  id: string | number;
  type: 'movie' | 'series' | 'channel';
  name: string;
  poster?: string;
  logo?: string;
  progress: number; // 0-100
  duration: number; // total duration in seconds
  watched: number; // seconds watched
  lastWatched: string | Date; // ISO string or Date object
  content: Movie | Series | Channel | Episode;
}

interface WatchHistoryState {
  history: WatchHistoryItem[];
  channelHistory: WatchHistoryItem[];
  currentProfileId: string | null;

  // Profile management
  setCurrentProfile: (profileId: string | null) => void;
  loadProfileHistory: (profileId: string) => void;

  addToHistory: (item: WatchHistoryItem) => void;
  addChannelToHistory: (item: WatchHistoryItem) => void;
  updateProgress: (id: string, watched: number, duration: number) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistory: () => WatchHistoryItem[];
  getRecentlyWatched: (limit?: number) => WatchHistoryItem[];
  getRecentMovies: () => WatchHistoryItem[];
  getRecentSeries: () => WatchHistoryItem[];
  getRecentChannels: (limit?: number) => WatchHistoryItem[];
  loadFromStorage: () => void;
}

// Gera a chave de storage com o profileId
const getHistoryKey = (profileId: string | null) => {
  return profileId ? `${STORAGE_KEYS.WATCH_HISTORY}_${profileId}` : STORAGE_KEYS.WATCH_HISTORY;
};

const getChannelHistoryKey = (profileId: string | null) => {
  return profileId ? `${STORAGE_KEYS.CHANNEL_HISTORY}_${profileId}` : STORAGE_KEYS.CHANNEL_HISTORY;
};

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  history: [],
  channelHistory: [],
  currentProfileId: null,

  setCurrentProfile: profileId => {
    set({ currentProfileId: profileId });
    if (profileId) {
      get().loadProfileHistory(profileId);
    }
  },

  loadProfileHistory: profileId => {
    const key = getHistoryKey(profileId);
    const stored = storage.get(key) || [];
    const chKey = getChannelHistoryKey(profileId);
    const chStored = storage.get(chKey) || [];
    set({ history: stored, channelHistory: chStored, currentProfileId: profileId });
  },

  addToHistory: item => {
    set(state => {
      const currentHistory = state.history;
      const existingIndex = currentHistory.findIndex(h => h.id === item.id);

      let newHistory: WatchHistoryItem[];

      if (existingIndex >= 0) {
        // Update existing entry - move to top
        const updated = [...currentHistory];
        updated.splice(existingIndex, 1);
        newHistory = [item, ...updated];
      } else {
        // Add new entry
        newHistory = [item, ...currentHistory];
      }

      // Keep limit: máximo 20 itens por perfil
      // Remove o mais antigo quando exceder o limite
      const finalHistory = newHistory.slice(0, 20);

      // Salva com chave do perfil atual
      const key = getHistoryKey(state.currentProfileId);
      storage.set(key, finalHistory);

      return { history: finalHistory };
    });
  },

  addChannelToHistory: item => {
    set(state => {
      const current = state.channelHistory;
      const existingIndex = current.findIndex(h => h.id === item.id);

      let newHistory: WatchHistoryItem[];

      if (existingIndex >= 0) {
        const updated = [...current];
        updated.splice(existingIndex, 1);
        newHistory = [item, ...updated];
      } else {
        newHistory = [item, ...current];
      }

      const finalHistory = newHistory.slice(0, 20);

      const key = getChannelHistoryKey(state.currentProfileId);
      storage.set(key, finalHistory);

      return { channelHistory: finalHistory };
    });
  },

  updateProgress: (id, watched, duration) => {
    set(state => {
      const history = state.history;
      const index = history.findIndex(h => h.id === id);

      if (index >= 0) {
        const updated = [...history];
        updated[index] = {
          ...updated[index],
          watched,
          duration,
          progress: Math.round((watched / duration) * 100),
          lastWatched: new Date()
        };

        // Salva com chave do perfil atual
        const key = getHistoryKey(state.currentProfileId);
        storage.set(key, updated);

        return { history: updated };
      }
      return state;
    });
  },

  removeFromHistory: id => {
    set(state => {
      const updated = state.history.filter(h => h.id != id);

      // Salva com chave do perfil atual
      const key = getHistoryKey(state.currentProfileId);
      storage.set(key, updated);

      return { history: updated };
    });
  },

  clearHistory: () => {
    set(state => {
      const key = getHistoryKey(state.currentProfileId);
      storage.remove(key);
      return { history: [] };
    });
  },

  getHistory: () => {
    return get().history;
  },

  getRecentlyWatched: (limit = 6) => {
    return get()
      .history.sort((a, b) => {
        const dateA = typeof a.lastWatched === 'string' ? new Date(a.lastWatched) : a.lastWatched;
        const dateB = typeof b.lastWatched === 'string' ? new Date(b.lastWatched) : b.lastWatched;
        return dateB.getTime() - dateA.getTime();
      })
      .filter(item => item.progress < 100) // Only incomplete videos
      .slice(0, limit);
  },

  // Get last 10 movies
  getRecentMovies: () => {
    return get()
      .history.sort((a, b) => {
        const dateA = typeof a.lastWatched === 'string' ? new Date(a.lastWatched) : a.lastWatched;
        const dateB = typeof b.lastWatched === 'string' ? new Date(b.lastWatched) : b.lastWatched;
        return dateB.getTime() - dateA.getTime();
      })
      .filter(item => item.type === 'movie')
      .slice(0, 10);
  },

  // Get last 10 series
  getRecentSeries: () => {
    return get()
      .history.sort((a, b) => {
        const dateA = typeof a.lastWatched === 'string' ? new Date(a.lastWatched) : a.lastWatched;
        const dateB = typeof b.lastWatched === 'string' ? new Date(b.lastWatched) : b.lastWatched;
        return dateB.getTime() - dateA.getTime();
      })
      .filter(item => item.type === 'series')
      .slice(0, 10);
  },

  // Get last N channels (from separate channel history)
  getRecentChannels: (limit = 20) => {
    return get()
      .channelHistory.sort((a, b) => {
        const dateA = typeof a.lastWatched === 'string' ? new Date(a.lastWatched) : a.lastWatched;
        const dateB = typeof b.lastWatched === 'string' ? new Date(b.lastWatched) : b.lastWatched;
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  },

  loadFromStorage: () => {
    const cached = storage.get(STORAGE_KEYS.WATCH_HISTORY);
    if (cached && Array.isArray(cached)) {
      set({ history: cached });
    }
    const chCached = storage.get(STORAGE_KEYS.CHANNEL_HISTORY);
    if (chCached && Array.isArray(chCached)) {
      set(state => ({ ...state, channelHistory: chCached }));
    }
  }
}));
