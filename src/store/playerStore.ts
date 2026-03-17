import { create } from 'zustand'

interface PlayerState {
  // Current playback
  currentUrl: string | null
  title: string | null
  poster?: string

  // Playlist
  playlist: Array<{
    id: string
    title: string
    url: string
    poster?: string
  }>

  // History
  watchHistory: Array<{
    id: string
    title: string
    lastWatched: Date
    progress: number
    duration: number
  }>

  // Actions
  setCurrentStream: (url: string, title: string, poster?: string) => void
  addToPlaylist: (item: any) => void
  removeFromPlaylist: (id: string) => void
  saveProgress: (id: string, progress: number, duration: number) => void
  loadProgress: (id: string) => number
  clearHistory: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentUrl: null,
  title: null,
  poster: undefined,
  playlist: [],
  watchHistory: [],

  setCurrentStream: (url: string, title: string, poster?: string) => {
    set({ currentUrl: url, title, poster })
  },

  addToPlaylist: (item) => {
    set((state) => ({
      playlist: [...state.playlist, item],
    }))
  },

  removeFromPlaylist: (id: string) => {
    set((state) => ({
      playlist: state.playlist.filter((item) => item.id !== id),
    }))
  },

  saveProgress: (id: string, progress: number, duration: number) => {
    set((state) => {
      const existing = state.watchHistory.find((h) => h.id === id)
      if (existing) {
        return {
          watchHistory: state.watchHistory.map((h) =>
            h.id === id
              ? { ...h, progress, duration, lastWatched: new Date() }
              : h
          ),
        }
      }
      return {
        watchHistory: [
          ...state.watchHistory,
          {
            id,
            title: get().title || 'Desconhecido',
            lastWatched: new Date(),
            progress,
            duration,
          },
        ],
      }
    })
  },

  loadProgress: (id: string) => {
    const history = get().watchHistory.find((h) => h.id === id)
    return history?.progress || 0
  },

  clearHistory: () => {
    set({ watchHistory: [] })
  },
}))
