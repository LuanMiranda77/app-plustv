import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useContentStore } from '../store/contentStore'

/**
 * Hook para buscar e sincronizar conteúdo do servidor
 * Busca Filmes, Séries e Live streams da API - COM CACHE DE 24H
 */
export const useServerContent = () => {
  const { serverConfig } = useAuthStore()
  const { 
    fetchServerContent, 
    isLoading, 
    error, 
    channels, 
    movies, 
    series,
    lastUpdate,
    isCacheValid,
    loadFromCache,
  } = useContentStore()

  useEffect(() => {
    if (serverConfig) {
      // Se cache é válido, apenas carrega do cache
      if (isCacheValid()) {
        loadFromCache()
      } else {
        // Caso contrário, busca do servidor
        fetchServerContent(serverConfig)
      }
    }
  }, [serverConfig, fetchServerContent, isCacheValid, loadFromCache])

  // Função para forçar atualização
  const forceRefresh = async () => {
    if (serverConfig) {
      await fetchServerContent(serverConfig, true)
    }
  }

  // Calcular tempo até próxima atualização automática
  const getTimeUntilNextUpdate = () => {
    if (!lastUpdate) return null
    
    const CACHE_DURATION = 24 * 60 * 60 * 1000
    const now = Date.now()
    const nextUpdate = new Date(lastUpdate + CACHE_DURATION)
    
    return nextUpdate
  }

  return {
    isLoading,
    error,
    channels,
    movies,
    series,
    hasContent: channels.length > 0 || movies.length > 0 || series.length > 0,
    lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
    nextUpdate: getTimeUntilNextUpdate(),
    forceRefresh,
  }
}
