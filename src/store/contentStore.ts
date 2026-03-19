import { create } from 'zustand';
import type { Channel, Movie, Series, ServerConfig } from '../types';
import { indexedDbStorage } from '../utils/indexedDbStorage';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { xtreamApi } from '../utils/xtreamApi';

interface ContentState {
  // Content
  channels: Channel[];
  movies: Movie[];
  series: Series[];

  // Categories
  liveCategories: Array<{ id: string; name: string }>;
  vodCategories: Array<{ id: string; name: string }>;
  seriesCategories: Array<{ id: string; name: string }>;

  // Loading states
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null; // timestamp do último update

  // Actions
  setChannels: (channels: Channel[]) => void;
  setMovies: (movies: Movie[]) => void;
  setSeries: (series: Series[]) => void;
  setLiveCategories: (categories: Array<{ id: string; name: string }>) => void;
  setVodCategories: (categories: Array<{ id: string; name: string }>) => void;
  setSeriesCategories: (categories: Array<{ id: string; name: string }>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadFromCache: () => void;
  clearCache: () => void;
  isCacheValid: () => boolean; // Verifica se cache é válido (menos de 72h / 3 dias)
  isCacheValidAsync: () => Promise<boolean>; // Versão async que verifica IndexedDB
  fetchServerContent: (config: ServerConfig, forceRefresh?: boolean) => Promise<void>;
}

const saveToCache = (
  channels: Channel[],
  movies: Movie[],
  series: Series[],
  liveCategories: any[],
  vodCategories: any[],
  seriesCategories: any[]
) => {
  // Dados COMPLETOS para IndexedDB (com imagens)
  const fullCache = {
    channels,
    movies,
    series,
    liveCategories,
    vodCategories,
    seriesCategories,
    timestamp: Date.now(),
  };

  // Dados MÍNIMOS para localStorage (apenas para validação rápida)
  const minimalCache = {
    timestamp: Date.now(),
  };

  console.log('🔄 Salvando cache: completo no IndexedDB + mínimo no localStorage...');

  // Salvar no IndexedDB (completo com imagens)
  indexedDbStorage.set('playlist_cache', fullCache).catch((error) => {
    console.error('❌ Erro ao salvar no IndexedDB:', error);
  });

  // Salvar no localStorage (apenas timestamp para validação rápida)
  storage.set(STORAGE_KEYS.PLAYLIST_CACHE, minimalCache);
};

export const useContentStore = create<ContentState>((set, get) => {
  // Carregar cache na inicialização
  const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE);

  if (cached) {
    console.log(`📦 Cache carregado na inicialização:`, {
      canais: cached.channels?.length || 0,
      filmes: cached.movies?.length || 0,
      series: cached.series?.length || 0,
      timestamp: new Date(cached.timestamp).toLocaleString(),
    });
  } else {
    console.log('📭 Nenhum cache encontrado na inicialização');
  }

  return {
    channels: cached?.channels || [],
    movies: cached?.movies || [],
    series: cached?.series || [],
    liveCategories: cached?.liveCategories || [],
    vodCategories: cached?.vodCategories || [],
    seriesCategories: cached?.seriesCategories || [],
    isLoading: false,
    error: null,
    lastUpdate: cached?.timestamp || null,

    setChannels: (channels) => {
      const state = get();
      saveToCache(
        channels,
        state.movies,
        state.series,
        state.liveCategories,
        state.vodCategories,
        state.seriesCategories
      );
      set({ channels });
    },

    setMovies: (movies) => {
      const state = get();
      saveToCache(
        state.channels,
        movies,
        state.series,
        state.liveCategories,
        state.vodCategories,
        state.seriesCategories
      );
      set({ movies });
    },

    setSeries: (series) => {
      const state = get();
      saveToCache(
        state.channels,
        state.movies,
        series,
        state.liveCategories,
        state.vodCategories,
        state.seriesCategories
      );
      set({ series });
    },

    setLiveCategories: (categories) => {
      const state = get();
      saveToCache(
        state.channels,
        state.movies,
        state.series,
        categories,
        state.vodCategories,
        state.seriesCategories
      );
      set({ liveCategories: categories });
    },

    setVodCategories: (categories) => {
      const state = get();
      saveToCache(
        state.channels,
        state.movies,
        state.series,
        state.liveCategories,
        categories,
        state.seriesCategories
      );
      set({ vodCategories: categories });
    },

    setSeriesCategories: (categories) => {
      const state = get();
      saveToCache(
        state.channels,
        state.movies,
        state.series,
        state.liveCategories,
        state.vodCategories,
        categories
      );
      set({ seriesCategories: categories });
    },

    setLoading: (loading) => {
      set({ isLoading: loading });
    },

    setError: (error) => {
      set({ error });
    },

    isCacheValid: () => {
      const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE);

      if (!cached || !cached.timestamp) {
        console.log('❌ Cache inválido: não encontrado ou sem timestamp');
        return false;
      }

      // 72 horas em milissegundos (3 dias)
      const CACHE_DURATION = 72 * 60 * 60 * 1000;
      const now = Date.now();
      const cacheAge = now - cached.timestamp;
      const hoursRemaining = ((CACHE_DURATION - cacheAge) / (1000 * 60 * 60)).toFixed(1);

      const isValid = cacheAge < CACHE_DURATION;

      console.log(
        `🕐 Cache age: ${(cacheAge / (1000 * 60 * 60)).toFixed(1)}h / Válido por mais: ${hoursRemaining}h`
      );
      console.log(`${isValid ? '✅ Cache VÁLIDO' : '❌ Cache EXPIRADO'}`);

      return isValid;
    },

    isCacheValidAsync: async () => {
      // Verificar timestamp no IndexedDB (fonte de verdade)
      const cached:any = await indexedDbStorage.get('playlist_cache');

      if (!cached || !cached.timestamp) {
        console.log('❌ Cache no IndexedDB inválido ou inexistente');
        return false;
      }

      // 72 horas em milissegundos (3 dias)
      const CACHE_DURATION = 72 * 60 * 60 * 1000;
      const now = Date.now();
      const cacheAge = now - cached.timestamp;
      const hoursRemaining = ((CACHE_DURATION - cacheAge) / (1000 * 60 * 60)).toFixed(1);

      const isValid = cacheAge < CACHE_DURATION;

      console.log(
        `📦 IndexedDB - Cache age: ${(cacheAge / (1000 * 60 * 60)).toFixed(1)}h / Válido por mais: ${hoursRemaining}h`
      );
      console.log(`${isValid ? '✅ Cache IndexedDB VÁLIDO' : '❌ Cache IndexedDB EXPIRADO'}`);

      return isValid;
    },

    loadFromCache: async () => {
      // Tentar carregar do IndexedDB primeiro (dados completos com imagens)
      let cached:any = await indexedDbStorage.get('playlist_cache');

      // Se não encontrar no IndexedDB, tenta localStorage
      if (!cached) {
        console.log('📂 Dados não encontrados no IndexedDB, tentando localStorage...');
        cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE);
      }

      if (cached) {
        console.log('✅ Cache carregado com sucesso!');
        set({
          channels: cached.channels || [],
          movies: cached.movies || [],
          series: cached.series || [],
          liveCategories: cached.liveCategories || [],
          vodCategories: cached.vodCategories || [],
          seriesCategories: cached.seriesCategories || [],
          lastUpdate: cached.timestamp || null,
        });
      }
    },

    clearCache: async () => {
      storage.remove(STORAGE_KEYS.PLAYLIST_CACHE);
      await indexedDbStorage.remove('playlist_cache');
      set({
        channels: [],
        movies: [],
        series: [],
        liveCategories: [],
        vodCategories: [],
        seriesCategories: [],
        lastUpdate: null,
      });
    },

    fetchServerContent: async (config: ServerConfig, forceRefresh = false) => {
      console.log('📡 fetchServerContent iniciado:', config.url);
      // Se cache é válido e não está forçando refresh, usar cache
      if (!forceRefresh && get().isCacheValid()) {
        console.log('✅ Cache válido, carregando...');
        get().loadFromCache();
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const data = await xtreamApi.getAllContent(config);
        console.log('📥 Dados recebidos da API:', {
          liveStreams: data.liveStreams?.length,
          vodStreams: data.vodStreams?.length,
          seriesStreams: data.seriesStreams?.length,
        });

        // Converter live streams para Channel
        const channels: Channel[] = data.liveStreams.map((stream: any) => ({
          id: Number(stream.stream_id),
          name: stream.name,
          logo: stream.stream_icon || '',
          streamUrl: xtreamApi.buildStreamUrl(
            config.url,
            config.username,
            config.password,
            stream.stream_id,
            stream.stream_type || 'live'
          ),
          category: stream.category_id || 'Sem categoria',
          isFavorite: false,
        }));

        // Converter VOD streams para Movie
        const movies: Movie[] = data.vodStreams.map((stream: any) => ({
          id: String(stream.stream_id),
          name: stream.name,
          poster: stream.stream_icon || '',
          streamUrl: xtreamApi.buildStreamUrl(
            config.url,
            config.username,
            config.password,
            stream.stream_id,
            stream.stream_type || 'movie'
          ),
          category: stream.category_id || 'Sem categoria',
          rating: stream.rating || 'N/A',
          year: stream.year || 'N/A',
          youtube_trailer: stream.youtube_trailer || '',
          genre: stream.genre || '',
          plot: stream.plot || '',
          isFavorite: false,
          watched: false,
          progress: 0,
          duration: stream.duration || 0,
        }));

        // Converter séries para Series
        const series: Series[] = data.seriesStreams.map((stream: any) => ({
          id: String(stream.series_id),
          name: stream.name,
          poster: stream.cover || stream.series_cover || '',
          category: stream.category_id || 'Sem categoria',
          rating: stream.rating || 'N/A',
          plot: stream.plot || '',
          genre: stream.genre || '',
          year: stream.year || '',
          youtube_trailer: stream.youtube_trailer || '',
          isFavorite: false,
          seasons: [],
          loaded: false,
          // seasons: [
          //   {
          //     number: 1,
          //     episodes: [
          //       {
          //         id: String(stream.series_id),
          //         name: stream.name,
          //         number: 1,
          //         streamUrl: xtreamApi.buildStreamUrl(
          //           config.url,
          //           config.username,
          //           config.password,
          //           stream.series_id,
          //           'series'
          //         ),
          //         watched: false,
          //         progress: 0,
          //       },
          //     ],
          //   },
          // ],
        }));

        // Converter categorias
        const liveCategories = data.liveCategories.map((cat: any) => ({
          id: String(cat.category_id),
          name: cat.category_name,
        }));

        const vodCategories = data.vodCategories.map((cat: any) => ({
          id: String(cat.category_id),
          name: cat.category_name,
        }));

        const seriesCategories = data.seriesCategories.map((cat: any) => ({
          id: String(cat.category_id),
          name: cat.category_name,
        }));

        const timestamp = Date.now();

        // Salvar dados COMPLETOS no IndexedDB + mínimo no localStorage
        console.log('💾 Salvando dados: completo no IndexedDB + mínimo no localStorage...');

        // IndexedDB = completo (com imagens)
        indexedDbStorage
          .set('playlist_cache', {
            channels,
            movies,
            series,
            liveCategories,
            vodCategories,
            seriesCategories,
            timestamp,
          })
          .then(() => {
            console.log('✅ Dados completos salvos no IndexedDB!');
          })
          .catch((error) => {
            console.error('❌ Erro ao salvar no IndexedDB:', error);
          });

        // localStorage = mínimo (apenas timestamp para validação)
        storage.set(STORAGE_KEYS.PLAYLIST_CACHE, { timestamp });
        set({
          channels,
          movies,
          series,
          liveCategories,
          vodCategories,
          seriesCategories,
          lastUpdate: timestamp,
          isLoading: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar conteúdo';
        console.error('❌ Erro ao buscar conteúdo:', error);
        console.error('💥 Mensagem:', errorMessage);

        // Se houver erro, tentar carregar do cache mesmo que expirado
        const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE);
        if (cached) {
          set({
            channels: cached.channels || [],
            movies: cached.movies || [],
            series: cached.series || [],
            liveCategories: cached.liveCategories || [],
            vodCategories: cached.vodCategories || [],
            seriesCategories: cached.seriesCategories || [],
            lastUpdate: cached.timestamp || null,
            isLoading: false,
            error: errorMessage + ' (mostrando dados em cache)',
          });
        } else {
          set({ error: errorMessage, isLoading: false });
        }
      }
    },
  };
});
