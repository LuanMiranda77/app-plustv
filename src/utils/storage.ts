// Chaves do localStorage
export const STORAGE_KEYS = {
  SERVER_CONFIG: 'iptv_server_config',
  PROFILES: 'iptv_profiles',
  ACTIVE_PROFILE: 'iptv_active_profile',
  FAVORITES: 'iptv_favorites',
  WATCH_HISTORY: 'iptv_watch_history',
  PLAYLIST_CACHE: 'iptv_playlist_cache',
  SETTINGS: 'iptv_settings',
} as const

// Funções auxiliares de storage
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Erro ao ler localStorage [${key}]:`, error)
      return null
    }
  },

  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Erro ao escrever localStorage [${key}]:`, error)
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Erro ao deletar localStorage [${key}]:`, error)
    }
  },

  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error)
    }
  },
}
