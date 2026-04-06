import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  useChannelStore,
  useContentStore,
  useMovieStore,
  useSeriesStore
} from '../store/contentStore';

type RefreshTarget = 'all' | 'live' | 'movies' | 'series';

export const useServerContent = () => {
  const { serverConfig } = useAuthStore();
  const { fetchServerContent } = useContentStore();
  const { lastUpdate: lastChannel, fetchLiveContent } = useChannelStore();
  const {
    lastUpdate: lastVod,
    fetchMoviesContent,
    isCacheValidAsyncMovie,
    loadFromCache: loadCacheMovie
  } = useMovieStore();
  const {
    lastUpdate: lastSeries,
    fetchSeriesContent,
    isCacheValidAsyncSeries,
    loadFromCache: loadCacheSerie
  } = useSeriesStore();
  const [loadingTarget, setLoadingTarget] = useState<RefreshTarget | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ← para forçar re-render quando necessário

  // ── forceRefresh com target ───────────────────────────────────────────────
  const forceRefresh = async (target: RefreshTarget = 'all') => {
    if (!serverConfig) return;
    setLoadingTarget(target);
    setIsLoading(true);
    try {
      switch (target) {
        case 'all':
          await fetchServerContent(serverConfig, true);
          break;
        case 'live':
          await fetchLiveContent(serverConfig, true);
          break;
        case 'movies':
          await fetchMoviesContent(serverConfig, true);
          break;
        case 'series':
          await fetchSeriesContent(serverConfig, true);
          break;
      }
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${target}:`, error);
    } finally {
      setIsLoading(false);
      setLoadingTarget(null);
    }
  };

  useEffect(() => {
    if (!serverConfig) return;

    const checkCacheAndLoad = async () => {
      setIsLoading(true);

      try {
        const [moviesValid, seriesValid] = await Promise.all([
          isCacheValidAsyncMovie(serverConfig),
          isCacheValidAsyncSeries(serverConfig)
        ]);

        await Promise.all([
          moviesValid ? loadCacheMovie(serverConfig) : fetchMoviesContent(serverConfig),
          seriesValid ? loadCacheSerie(serverConfig) : fetchSeriesContent(serverConfig)
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    checkCacheAndLoad();
  }, [
    serverConfig,
    isCacheValidAsyncMovie,
    isCacheValidAsyncSeries,
    loadCacheMovie,
    loadCacheSerie,
    fetchMoviesContent,
    fetchSeriesContent
  ]);

  return {
    isLoading,
    loadingTarget, // ← novo
    lastChannel,
    lastVod,
    lastSeries,
    forceRefresh // ← agora aceita target
  };
};
