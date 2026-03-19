import { create } from 'zustand';
import type { Channel, Movie, Series } from '../types';
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
  content: Movie | Series | Channel;
}

interface WatchHistoryState {
  history: WatchHistoryItem[];
  addToHistory: (item: WatchHistoryItem) => void;
  updateProgress: (id: string, watched: number, duration: number) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistory: () => WatchHistoryItem[];
  getRecentlyWatched: (limit?: number) => WatchHistoryItem[];
  getRecentMovies: () => WatchHistoryItem[];
  getRecentSeries: () => WatchHistoryItem[];
  loadFromStorage: () => void;
}

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  history: [],

  addToHistory: (item) => {
    const currentHistory = get().history;
    const existingIndex = currentHistory.findIndex((h) => h.id === item.id);

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

    // Keep limit based on type: 10 movies + 10 series + others
    const movies = newHistory.filter((h) => h.type === 'movie').slice(0, 10);
    const series = newHistory.filter((h) => h.type === 'series').slice(0, 10);
    const channels = newHistory.filter((h) => h.type === 'channel').slice(0, 50);

    const finalHistory = [...movies, ...series, ...channels].slice(0, 70);

    set({ history: finalHistory });
    storage.set(STORAGE_KEYS.WATCH_HISTORY, finalHistory);
  },

  updateProgress: (id, watched, duration) => {
    const history = get().history;
    const index = history.findIndex((h) => h.id === id);

    if (index >= 0) {
      const updated = [...history];
      updated[index] = {
        ...updated[index],
        watched,
        duration,
        progress: Math.round((watched / duration) * 100),
        lastWatched: new Date(),
      };
      set({ history: updated });
      storage.set(STORAGE_KEYS.WATCH_HISTORY, updated);
    }
  },

  removeFromHistory: (id) => {
    const updated = get().history.filter((h) => h.id != id);
    set({ history: updated });
    storage.set(STORAGE_KEYS.WATCH_HISTORY, updated);
  },

  clearHistory: () => {
    set({ history: [] });
    storage.remove(STORAGE_KEYS.WATCH_HISTORY);
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
      .filter((item) => item.progress < 100) // Only incomplete videos
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
      .filter((item) => item.type === 'movie')
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
      .filter((item) => item.type === 'series')
      .slice(0, 10);
  },

  loadFromStorage: () => {
    const cached = storage.get(STORAGE_KEYS.WATCH_HISTORY);
    if (cached && Array.isArray(cached)) {
      set({ history: cached });
    }
  },
}));
