import { create } from 'zustand'
import type { Channel, Movie, Series } from '../types'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface FavoritesState {
  favorites: Array<Channel | Movie | Series>
  
  isFavorite: (id: string) => boolean
  addFavorite: (item: Channel | Movie | Series) => void
  removeFavorite: (id: string) => void
  getFavoritesByType: (type: 'channel' | 'movie' | 'series') => Array<Channel | Movie | Series>
  loadFromStorage: () => void
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  isFavorite: (id: string) => {
    return get().favorites.some((item) => item.id === id)
  },

  addFavorite: (item) => {
    set((state) => {
      if (state.favorites.some((f) => f.id === item.id)) {
        return state
      }
      const updated = [...state.favorites, item]
      storage.set(STORAGE_KEYS.FAVORITES, updated)
      return { favorites: updated }
    })
  },

  removeFavorite: (id: string) => {
    set((state) => {
      const updated = state.favorites.filter((item) => item.id !== id)
      storage.set(STORAGE_KEYS.FAVORITES, updated)
      return { favorites: updated }
    })
  },

  getFavoritesByType: (type: 'channel' | 'movie' | 'series') => {
    const favorites = get().favorites
    if (type === 'channel') {
      return favorites.filter((f) => 'streamUrl' in f && 'category' in f && !('seasons' in f))
    }
    if (type === 'movie') {
      return favorites.filter((f) => 'poster' in f && !('seasons' in f) && 'streamUrl' in f)
    }
    return favorites.filter((f) => 'seasons' in f)
  },

  loadFromStorage: () => {
    const stored = storage.get(STORAGE_KEYS.FAVORITES) || []
    set({ favorites: stored })
  },

  clearFavorites: () => {
    storage.remove(STORAGE_KEYS.FAVORITES)
    set({ favorites: [] })
  },
}))
