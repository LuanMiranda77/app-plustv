import { create } from 'zustand'
import type { Profile, ServerConfig } from '../types'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface AuthState {
  // Server config
  serverConfig: ServerConfig | null
  isAuthenticated: boolean
  
  // Profiles
  profiles: Profile[]
  activeProfile: Profile | null
  
  // Loading
  isLoading: boolean
  error: string | null

  // Actions
  setServerConfig: (config: ServerConfig) => void
  setAuthenticated: (value: boolean) => void
  addProfile: (profile: Profile) => void
  setActiveProfile: (profile: Profile) => void
  removeProfile: (profileId: string) => void
  loadFromStorage: () => void
  clearAuth: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  serverConfig: null,
  isAuthenticated: false,
  profiles: [],
  activeProfile: null,
  isLoading: false,
  error: null,

  setServerConfig: (config: ServerConfig) => {
    storage.set(STORAGE_KEYS.SERVER_CONFIG, config)
    set({ serverConfig: config, isAuthenticated: true })
  },

  setAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value })
  },

  addProfile: (profile: Profile) => {
    set((state) => {
      const profiles = [...state.profiles, profile]
      storage.set(STORAGE_KEYS.PROFILES, profiles)
      return { profiles }
    })
  },

  setActiveProfile: (profile: Profile) => {
    storage.set(STORAGE_KEYS.ACTIVE_PROFILE, profile)
    set({ activeProfile: profile })
  },

  removeProfile: (profileId: string) => {
    set((state) => {
      const profiles = state.profiles.filter((p) => p.id !== profileId)
      storage.set(STORAGE_KEYS.PROFILES, profiles)
      return { profiles }
    })
  },

  loadFromStorage: () => {
    const serverConfig = storage.get(STORAGE_KEYS.SERVER_CONFIG)
    const profiles = storage.get(STORAGE_KEYS.PROFILES) || []
    const activeProfile = storage.get(STORAGE_KEYS.ACTIVE_PROFILE)

    set({
      serverConfig,
      isAuthenticated: !!serverConfig,
      profiles,
      activeProfile,
    })
  },

  clearAuth: () => {
    storage.clear()
    set({
      serverConfig: null,
      isAuthenticated: false,
      profiles: [],
      activeProfile: null,
      isLoading: false,
      error: null,
    })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))
