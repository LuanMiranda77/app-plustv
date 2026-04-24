import { create } from 'zustand';
import type { Category, Channel, Movie, Series, ServerConfig } from '../types';
import { CacheService } from '../utils/cacheService';
import { delay, requestWithRetry } from '../utils/nertwork';
import { xtreamApi } from '../utils/xtreamApi';
import { useHomeStore } from './homeStore';

interface ContentState {
  isLoading: boolean;
  error: string | null;

  loadFromCache: (config: ServerConfig) => Promise<void>;
  clearCache: (config: ServerConfig) => Promise<void>;
  fetchServerContent: (config: ServerConfig, forceRefresh?: boolean) => void;
}
interface ChannelState {
  channels: Channel[];
  liveCategories: Category[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;

  loadFromCache: (config: ServerConfig) => Promise<void>;
  isCacheValidAsyncChannel: (config: ServerConfig) => Promise<boolean>;
  clearCache: (config: ServerConfig) => Promise<void>;
  fetchLiveContent: (config: ServerConfig, forceRefresh?: boolean) => Promise<void>;
  toggleFavorite: (id: string, config: ServerConfig) => void;
  isFavorite: (id: string) => boolean;
  getFavorites: () => Channel[];
}
interface SeriesState {
  series: Series[];
  seriesCategories: Category[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;

  loadFromCache: (config: ServerConfig) => Promise<void>;
  isCacheValidAsyncSeries: (config: ServerConfig) => Promise<boolean>;
  clearCache: (config: ServerConfig) => Promise<void>;
  fetchSeriesContent: (config: ServerConfig, forceRefresh?: boolean) => Promise<void>;
  toggleFavorite: (id: string, config: ServerConfig) => void;
  isFavorite: (id: string) => boolean;
  getFavorites: () => Series[];
}
interface MovieState {
  movies: Movie[];
  vodCategories: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;

  loadFromCache: (config: ServerConfig) => Promise<void>;
  isCacheValidAsyncMovie: (config: ServerConfig) => Promise<boolean>;
  clearCache: (config: ServerConfig) => Promise<void>;
  fetchMoviesContent: (config: ServerConfig, forceRefresh?: boolean) => Promise<void>;
  toggleFavorite: (id: string, config: ServerConfig) => void;
  isFavorite: (id: string) => boolean;
  getFavorites: () => Movie[];
}

const orderByName = (list: any[]): any[] => {
  return list.sort((a: Channel, b: Channel) => a.name.localeCompare(b.name));
};
const orderByTimestamp = (list: any[]): any[] => {
  return list.sort((a: Channel, b: Channel) => b.added - a.added);
};

// ─────────────────────────────────────────────
// MAPPERS (mantidos iguais)
// ─────────────────────────────────────────────
const mapCategory = (cat: any): Category => ({
  id: String(cat.category_id),
  name: cat.category_name
    .replace('FILMES |', '')
    .replace('Filmes |', '')
    .replace('FILMES - ', '')
    .replace('Filmes - ', '')
    .replace('FILMES :', '')
    .replace('Filmes :', '')
    .replace('SÉRIES |', '')
    .replace('Séries |', '')
    .replace('CANAIS |', '')
    .replace('Canais |', '')
});

const mapChannel = (stream: any, config: ServerConfig, cache?: Channel): Channel => ({
  id: String(stream.stream_id),
  name: stream.name,
  logo: stream.stream_icon || '',
  streamUrl: xtreamApi.buildStreamUrl(
    config.url,
    config.username,
    config.password,
    stream.stream_id,
    'live'
  ),
  category: stream.category_id || 'Sem categoria',
  isFavorite: cache?.isFavorite || false,
  added: stream.added ? Number(stream.added) : Date.now()
});

const mapMovie = (stream: any, config: ServerConfig, cache?: Movie): Movie => ({
  id: String(stream.stream_id),
  name: stream.name,
  poster: stream.stream_icon || '',
  streamUrl: xtreamApi.buildStreamUrl(
    config.url,
    config.username,
    config.password,
    stream.stream_id,
    'movie'
  ),
  category: stream.category_id || 'Sem categoria',
  rating: stream.rating || 'N/A',
  year: stream.year || 'N/A',
  isFavorite: cache?.isFavorite || false,
  watched: cache?.watched || false,
  progress: cache?.progress || 0,
  duration: cache?.duration || stream.duration || 0,
  plot: stream.plot || '',
  genre: stream.genre || '',
  youtube_trailer: stream.youtube_trailer || '',
  added: stream.added ? Number(stream.added) : Date.now()
});

const mapSeries = (stream: any, cache?: Series): Series => ({
  id: String(stream.series_id),
  name: stream.name,
  poster: stream.cover || '',
  category: stream.category_id || 'Sem categoria',
  rating: stream.rating || 'N/A',
  isFavorite: cache?.isFavorite || false,
  seasons: [],
  loaded: false,
  plot: stream.plot || '',
  genre: stream.genre || '',
  year: stream.year || 'N/A',
  youtube_trailer: stream.youtube_trailer || '',
  added: stream.last_modified ? Number(stream.last_modified) : Date.now()
});

const findLiveSevice = async (config: ServerConfig) => {
  const categories = await xtreamApi.getLiveCategories(config);
  const liveCatsRaw = categories.map(mapCategory);
  const channels: any[] = [];
  // const { addToHistory } = useHomeStore();

  for (const category of categories) {
    await delay(100);

    try {
      const data = await requestWithRetry(() =>
        xtreamApi.getLiveStreams(config, category.category_id)
      );

      for (const s of data.flat()) {
        // const channel = cache.find(c => c.id == String(s.stream_id));
        channels.push(mapChannel(s, config));
      }
    } catch {
      console.warn('Erro live categoria:', category.category_id);
    }
  }

  useHomeStore.getState().addToHistory(channels.slice(0, 10), 'topChannel', config);

  await CacheService.saveCacheList(
    {
      channels: orderByTimestamp(channels),
      liveCategories: orderByName(liveCatsRaw)
    },
    config,
    'LIST_CHANNELS'
  );
  return { channels, liveCatsRaw };
};

const findVodSevice = async (config: ServerConfig) => {
  const categories = await xtreamApi.getVodCategories(config);
  const vodCatsRaw = categories.map(mapCategory);
  const trending = [];
  const news = [];

  const movies: any[] = [];

  for (const category of categories) {
    await delay(100);

    try {
      const data = await requestWithRetry(() =>
        xtreamApi.getVodStreams(config, category.category_id)
      );

      for (const s of data.flat()) {
        // const movie = cache.find(c => c.id == String(s.stream_id));
        const mapped = mapMovie(s, config);
        if (
          news.length < 10 &&
          mapped.year &&
          Number(mapped.year) >= new Date().getFullYear() - 1
        ) {
          news.push(mapped);
        }
        if (
          trending.length < 10 &&
          mapped.rating &&
          mapped.rating !== 'N/A' &&
          Number(mapped.rating) >= 7
        ) {
          trending.push(mapped);
        }
        movies.push(mapped);
      }
    } catch {
      console.warn('Erro VOD categoria:', category.category_id);
    }
  }

  useHomeStore.getState().addToHistory(trending, 'trendingMovies', config);
  useHomeStore.getState().addToHistory(news, 'newMovies', config);

  await CacheService.saveCacheList(
    {
      movies: orderByTimestamp(movies),
      vodCategories: orderByName(vodCatsRaw)
    },
    config,
    'LIST_MOVIES'
  );

  return { movies, vodCatsRaw };
};

const findSeriesSevice = async (config: ServerConfig) => {
  const categories = await xtreamApi.getSeriesCategories(config);
  const seriesCatsRaw = categories.map(mapCategory);
  const trending = [];
  const news = [];

  const series: any[] = [];

  if (Array.isArray(categories)) {
    for (const category of categories) {
      await delay(100); // 🔥 evita flood no servidor

      try {
        const data = await requestWithRetry(() =>
          xtreamApi.getSeries(config, category.category_id)
        );

        if (Array.isArray(data)) {
          for (const s of data.flat()) {
            // const serie = cache.find(c => c.id == String(s.stream_id));
            const mapped = mapSeries(s);
            if (
              news.length < 15 &&
              mapped.year &&
              Number(mapped.year) >= new Date().getFullYear() - 1
            ) {
              news.push(mapped);
            }
            if (
              trending.length < 10 &&
              mapped.rating &&
              mapped.rating !== 'N/A' &&
              Number(mapped.rating) >= 7
            ) {
              trending.push(mapped);
            }
            series.push(mapSeries(s));
          }
        }
      } catch (e: any) {
        if (e?.response?.status === 503) {
          console.warn('Categoria sobrecarregada:', category.category_id);
          continue;
        }
        console.error('Erro categoria:', category.category_id, e);
      }
    }
  }

  useHomeStore.getState().addToHistory(trending, 'trendingSeries', config);
  useHomeStore.getState().addToHistory(news, 'newSeries', config);

  await CacheService.saveCacheList(
    {
      series: orderByTimestamp(series),
      seriesCategories: orderByName(seriesCatsRaw)
    },
    config,
    'LIST_SERIES'
  );

  return { series, seriesCatsRaw };
};

// Channel Store
export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: [],
  liveCategories: [],
  isLoading: false,
  error: null,
  lastUpdate: null,

  loadFromCache: async config => {
    const cache = await CacheService.load(config, 'LIST_CHANNELS');

    if (!cache) return;

    console.log('📦 Cache aplicado na UI - LIST_CHANNELS');

    set({
      channels: cache.channels || [],
      liveCategories: cache.liveCategories || [],
      lastUpdate: cache.timestamp || null
    });
  },

  isCacheValidAsyncChannel: async config => {
    return CacheService.isValid(config, 'LIST_CHANNELS');
  },

  clearCache: async config => {
    await CacheService.clear(config);

    set({
      channels: [],
      liveCategories: [],
      lastUpdate: null
    });
  },

  fetchLiveContent: async (config, forceRefresh) => {
    try {
      if (!forceRefresh && (await get().isCacheValidAsyncChannel(config))) {
        console.log('load-cahce-channels');
        await get().loadFromCache(config);
        return;
      }
      set({ isLoading: true });
      // await get().loadFromCache(config);
      // const cahceChannels = get().channels;
      const { channels, liveCatsRaw } = await findLiveSevice(config);
      set({ channels, liveCategories: liveCatsRaw, isLoading: false });
    } catch (e) {
      console.error('Erro ao atualizar canais', e);
      set({ error: 'Erro ao atualizar canais', isLoading: false });
    }
  },

  isFavorite: id => get().channels.some(c => c.id === id && c.isFavorite),

  getFavorites: () => get().channels.filter(c => c.isFavorite),

  toggleFavorite: async (id, config) => {
    const channels = get().channels.map(c =>
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    set({ channels });
    const updated = channels.find(c => c.id === id);
    if (!updated) return;
    await CacheService.patchFavoriteInList(config, 'LIST_CHANNELS', id, updated.isFavorite);
  }
}));

// Movies store (mantida igual)
export const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  vodCategories: [],
  isLoading: false,
  error: null,
  lastUpdate: null,

  loadFromCache: async config => {
    const cache = await CacheService.load(config, 'LIST_MOVIES');

    if (!cache) return;

    console.log('📦 Cache aplicado na UI - LIST_MOVIES');

    set({
      movies: cache.movies || [],
      vodCategories: cache.vodCategories || [],
      lastUpdate: cache.timestamp || null
    });
  },

  isCacheValidAsyncMovie: async config => {
    return CacheService.isValid(config, 'LIST_MOVIES');
  },

  clearCache: async config => {
    await CacheService.clear(config);
    set({
      movies: [],
      vodCategories: [],
      lastUpdate: null
    });
  },

  fetchMoviesContent: async (config, forceRefresh) => {
    try {
      if (!forceRefresh && (await get().isCacheValidAsyncMovie(config))) {
        await get().loadFromCache(config);
        return;
      }
      set({ isLoading: true });
      // await get().loadFromCache(config);
      // const cahceMovies = get().movies;
      const { movies, vodCatsRaw } = await findVodSevice(config);
      set({ movies, vodCategories: vodCatsRaw, isLoading: false });
    } catch {
      set({ error: 'Erro ao atualizar canais', isLoading: false });
    }
  },

  isFavorite: id => get().movies.some(m => m.id === id && m.isFavorite),

  getFavorites: () => get().movies.filter(m => m.isFavorite),

  toggleFavorite: async (id, config) => {
    const movies = get().movies.map(m => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
    set({ movies });
    const updated = movies.find(m => m.id === id);
    if (!updated) return;
    await CacheService.patchFavoriteInList(config, 'LIST_MOVIES', id, updated.isFavorite);
  }
}));

// Series store (mantida igual)
export const useSeriesStore = create<SeriesState>((set, get) => ({
  series: [],
  seriesCategories: [],
  isLoading: false,
  error: null,
  lastUpdate: null,

  loadFromCache: async config => {
    const cache = await CacheService.load(config, 'LIST_SERIES');

    if (!cache) return;

    console.log('📦 Cache aplicado na UI - LIST_SERIES');

    set({
      series: cache.series || [],
      seriesCategories: cache.seriesCategories || [],
      lastUpdate: cache.timestamp || null
    });
  },

  isCacheValidAsyncSeries: async config => {
    return CacheService.isValid(config, 'LIST_SERIES');
  },

  clearCache: async config => {
    await CacheService.clear(config);

    set({
      series: [],
      seriesCategories: [],
      lastUpdate: null
    });
  },

  fetchSeriesContent: async (config, forceRefresh) => {
    try {
      if (!forceRefresh && (await get().isCacheValidAsyncSeries(config))) {
        await get().loadFromCache(config);
        return;
      }
      set({ isLoading: true });
      // await get().loadFromCache(config);
      // const cahceSeries = get().series;
      const { series, seriesCatsRaw } = await findSeriesSevice(config);
      set({ series, seriesCategories: seriesCatsRaw, isLoading: false });
    } catch {
      set({ error: 'Erro ao atualizar canais', isLoading: false });
    }
  },

  isFavorite: id => get().series.some(s => s.id === id && s.isFavorite),

  getFavorites: () => get().series.filter(s => s.isFavorite),

  toggleFavorite: async (id, config) => {
    const series = get().series.map(s => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
    set({ series });
    const updated = series.find(s => s.id === id);
    if (!updated) return;
    await CacheService.patchFavoriteInList(config, 'LIST_SERIES', id, updated.isFavorite);
  }
}));

export const useContentStore = create<ContentState>(set => ({
  isLoading: false,
  error: null,

  loadFromCache: async (config: ServerConfig) => {
    await Promise.all([
      useChannelStore.getState().loadFromCache(config),
      useMovieStore.getState().loadFromCache(config),
      useSeriesStore.getState().loadFromCache(config)
    ]);
  },

  clearCache: async (config: ServerConfig) => {
    await Promise.all([
      useChannelStore.getState().clearCache(config),
      useMovieStore.getState().clearCache(config),
      useSeriesStore.getState().clearCache(config)
    ]);
  },

  fetchServerContent: async (config: ServerConfig, forceRefresh = false) => {
    try {
      set({ isLoading: true, error: null });
      await Promise.all([
        useChannelStore.getState().fetchLiveContent(config, forceRefresh),
        useMovieStore.getState().fetchMoviesContent(config, forceRefresh),
        useSeriesStore.getState().fetchSeriesContent(config, forceRefresh)
      ]);
      set({ isLoading: false });
    } catch {
      set({ error: 'Erro ao atualizar canais', isLoading: false });
    }
  }
}));
