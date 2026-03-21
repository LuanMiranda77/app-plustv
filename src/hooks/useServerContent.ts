import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { storage, STORAGE_KEYS } from '../utils/storage';

/**
 * Hook para buscar e sincronizar conteúdo do servidor
 * Busca Filmes, Séries e Live streams da API - COM CACHE DE 72H (3 DIAS)
 */
export const useServerContent = () => {
  const { serverConfig } = useAuthStore();
  const {
    fetchServerContent,
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

  useEffect(() => {
    // Limpar cache ao iniciar se estiver muito grande
    const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE);
    if (cached && JSON.stringify(cached).length > 5000000) {
      console.log('🧹 Cache localStorage muito grande! Limpando...');
      clearCache();
    }

    if (serverConfig) {
      // Usar versão async que verifica IndexedDB
      isCacheValidAsync(serverConfig)
        .then(isValid => {
          if (isValid) {
            console.log('✅ Cache do IndexedDB VÁLIDO! Carregando dados...');
            loadFromCache();
          } else {
            console.log('⏰ Cache expirado ou não encontrado. Buscando dados do servidor...');
            // Caso contrário, busca do servidor
            fetchServerContent(serverConfig);
          }
        })
        .catch(error => {
          console.error('❌ Erro ao verificar cache:', error);
          // Em caso de erro, buscar do servidor
          fetchServerContent(serverConfig);
        });
    }
  }, [serverConfig]); // ✅ Apenas serverConfig como dependência para evitar loop

  // Função para forçar atualização
  const forceRefresh = async () => {
    if (serverConfig) {
      await fetchServerContent(serverConfig, true);
    }
  };

  // Calcular tempo até próxima atualização automática
  const getTimeUntilNextUpdate = () => {
    if (!lastUpdate) return null;

    const CACHE_DURATION = 72 * 60 * 60 * 1000; // 72 horas (3 dias)
    const now = Date.now();
    const nextUpdate = new Date(lastUpdate + CACHE_DURATION);

    return nextUpdate;
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
    forceRefresh
  };
};
