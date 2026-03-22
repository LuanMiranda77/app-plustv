import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { storage, STORAGE_KEYS } from '../utils/storage';

type RefreshTarget = 'all' | 'live' | 'movies' | 'series';

export const useServerContent = () => {
  const { serverConfig } = useAuthStore();
  const {
    fetchServerContent,
    fetchLiveContent, // ← precisará existir no contentStore
    fetchMoviesContent, // ← precisará existir no contentStore
    fetchSeriesContent, // ← precisará existir no contentStore
    isLoading,
    error,
    channels,
    movies,
    series,
    lastUpdate,
    isCacheValid,
    isCacheValidAsync,
    loadFromCache,
    clearCache
  } = useContentStore();

  const [loadingTarget, setLoadingTarget] = useState<RefreshTarget | null>(null);

  useEffect(() => {
    const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE);
    if (cached && JSON.stringify(cached).length > 5000000) {
      console.log('🧹 Cache localStorage muito grande! Limpando...');
      clearCache();
    }

    if (serverConfig) {
      isCacheValidAsync(serverConfig)
        .then(isValid => {
          if (isValid) {
            console.log('✅ Cache do IndexedDB VÁLIDO! Carregando dados...');
            loadFromCache();
          } else {
            console.log('⏰ Cache expirado. Buscando dados do servidor...');
            fetchServerContent(serverConfig);
          }
        })
        .catch(error => {
          console.error('❌ Erro ao verificar cache:', error);
          fetchServerContent(serverConfig);
        });
    }
  }, [serverConfig]);

  // ── forceRefresh com target ───────────────────────────────────────────────
  const forceRefresh = async (target: RefreshTarget = 'all') => {
    if (!serverConfig) return;

    setLoadingTarget(target);
    console.log(`🔄 Atualizando: ${target}`);

    try {
       switch (target) {
         case 'all':
           await fetchServerContent(serverConfig, true);
           break;
         case 'live':
           await fetchLiveContent(serverConfig);
           break;
         case 'movies':
           await fetchMoviesContent(serverConfig);
           break;
         case 'series':
           await fetchSeriesContent(serverConfig);
           break;
       }
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${target}:`, error);
    } finally {
      setLoadingTarget(null);
    }
  };

  const getTimeUntilNextUpdate = () => {
    if (!lastUpdate) return null;
    const CACHE_DURATION = 72 * 60 * 60 * 1000;
    return new Date(lastUpdate + CACHE_DURATION);
  };

  return {
    isLoading,
    error,
    channels,
    movies,
    series,
    hasContent: channels.length > 0 || movies.length > 0 || series.length > 0,
    lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
    nextUpdate: getTimeUntilNextUpdate(),
    loadingTarget, // ← novo
    forceRefresh // ← agora aceita target
  };
};
