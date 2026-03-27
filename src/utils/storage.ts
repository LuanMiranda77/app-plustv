// Chaves do localStorage
export const STORAGE_KEYS = {
  SERVER_CONFIG: 'iptv_server_config',
  SERVER_LIST: 'iptv_server_list',
  PROFILES: 'iptv_profiles',
  ACTIVE_PROFILE: 'iptv_active_profile',
  FAVORITES: 'iptv_favorites',
  WATCH_HISTORY: 'iptv_watch_history',
  CHANNEL_HISTORY: 'iptv_channel_history',
  PLAYLIST_CACHE: 'iptv_playlist_cache',
  SETTINGS: 'iptv_settings',
  LIST_EPISODES: 'list_episodes_cache',
  MOVIE_PROGRESS: 'movie_progress',
  SERIE_PROGRESS: 'serie_progress'
} as const;

// Funções auxiliares de storage
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Erro ao ler localStorage [${key}]:`, error);
      return null;
    }
  },

  set: (key: string, value: any) => {
    try {
      const jsonStr = JSON.stringify(value);
      localStorage.setItem(key, jsonStr);
      console.log(`✅ Salvo em localStorage [${key}]`);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        console.error(`❌ localStorage CHEIO! Limpando dados antigos...`);
        // Tentar limpar dados antigos
        localStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.PLAYLIST_CACHE);
        console.log(`🧹 Dados limpos. Tentando salvar novamente...`);
        try {
          localStorage.setItem(key, JSON.stringify(value));
          console.log(`✅ Salvo após limpeza!`);
        } catch (retryError) {
          console.error(`❌ Ainda não foi possível salvar.`);
        }
      } else {
        console.error(`Erro ao escrever localStorage [${key}]:`, error);
      }
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao deletar localStorage [${key}]:`, error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }
};
