import { create } from 'zustand';
import type { Category, Channel, Movie, Series, ServerConfig } from '../types';
import { xtreamApi } from '../utils/xtreamApi';
import { CacheService } from '../utils/cacheService';
import { delay, requestWithRetry } from '../utils/nertwork';
import { useHomeStore } from './homeStore';

interface ContentState {
  isLoading: boolean;
  error: string | null;

  loadFromCache: (config: ServerConfig) => Promise<void>;
  isCacheValidAsync: (config: ServerConfig) => Promise<boolean>;
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
}

const orderByName = (list: any[]): any[] => {
  return list.sort((a: Channel, b: Channel) => a.name.localeCompare(b.name));
};

// ─────────────────────────────────────────────
// MAPPERS (mantidos iguais)
// ─────────────────────────────────────────────
const mapCategory = (cat: any): Category => ({
  id: String(cat.category_id),
  name: cat.category_name
    .replace('FILMES |', '')
    .replace('Filmes |', '')
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
  isFavorite: cache?.isFavorite || false
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
  youtube_trailer: stream.youtube_trailer || ''
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
  youtube_trailer: stream.youtube_trailer || ''
});

const findLiveSevice = async (config: ServerConfig, cache: Channel[]) => {
  const categories = await xtreamApi.getLiveCategories(config);
  const liveCatsRaw = categories.map(mapCategory);
  const channels: any[] = [];
  // const { addToHistory } = useHomeStore();

  for (const category of categories) {
    await delay(200);

    try {
      const data = await requestWithRetry(() =>
        xtreamApi.getLiveStreams(config, category.category_id)
      );

      for (const s of data.flat()) {
        const channel = cache.find(c => c.id == String(s.stream_id));
        channels.push(mapChannel(s, config, channel));
      }
    } catch {
      console.warn('Erro live categoria:', category.category_id);
    }
  }

  useHomeStore.getState().addToHistory(channels.slice(0, 10), 'topChannel', config);

  await CacheService.saveCacheList(
    {
      channels: orderByName(channels),
      liveCategories: orderByName(liveCatsRaw)
    },
    config,
    'LIST_CHANNELS'
  );
  return { channels, liveCatsRaw };
};

const findVodSevice = async (config: ServerConfig, cache: Movie[]) => {
  const categories = await xtreamApi.getVodCategories(config);
  const vodCatsRaw = categories.map(mapCategory);
  const trending = [];
  const news = [];

  const movies: any[] = [];

  for (const category of categories) {
    await delay(300);

    try {
      const data = await requestWithRetry(() =>
        xtreamApi.getVodStreams(config, category.category_id)
      );

      for (const s of data.flat()) {
        const movie = cache.find(c => c.id == String(s.stream_id));
        const mapped = mapMovie(s, config, movie);
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
      movies: orderByName(movies),
      vodCategories: orderByName(vodCatsRaw)
    },
    config,
    'LIST_MOVIES'
  );

  return { movies, vodCatsRaw };
};

const findSeriesSevice = async (config: ServerConfig, cache: Series[]) => {
  const categories = await xtreamApi.getSeriesCategories(config);
  const seriesCatsRaw = categories.map(mapCategory);
  const trending = [];
  const news = [];

  const series: any[] = [];

  if (Array.isArray(categories)) {
    for (const category of categories) {
      await delay(300); // 🔥 evita flood no servidor

      try {
        const data = await requestWithRetry(() =>
          xtreamApi.getSeries(config, category.category_id)
        );

        if (Array.isArray(data)) {
          for (const s of data.flat()) {
            const serie = cache.find(c => c.id == String(s.stream_id));
            const mapped = mapSeries(s, serie);
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
            series.push(mapSeries(s, serie));
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
      series: orderByName(series),
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
        console.log("load-cahce-channels");
        await get().loadFromCache(config);
        return;
      }
      set({ isLoading: true });
      await get().loadFromCache(config);
      const cahceChannels = get().channels;
      console.log('carregar');
      const { channels, liveCatsRaw } = await findLiveSevice(config, cahceChannels);
      set({ channels, liveCategories: liveCatsRaw, isLoading: false });
    } catch(e) {
      console.error('Erro ao atualizar canais', e);
      set({ error: 'Erro ao atualizar canais', isLoading: false });
    }
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
      await get().loadFromCache(config);
      const cahceMovies = get().movies;
      const { movies, vodCatsRaw } = await findVodSevice(config, cahceMovies);
      set({ movies, vodCategories: vodCatsRaw, isLoading: false });
    } catch {
      set({ error: 'Erro ao atualizar canais', isLoading: false });
    }
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
      await get().loadFromCache(config);
      const cahceSeries = get().series;
      const { series, seriesCatsRaw } = await findSeriesSevice(config, cahceSeries);
      set({ series, seriesCategories: seriesCatsRaw, isLoading: false });
    } catch {
      set({ error: 'Erro ao atualizar canais', isLoading: false });
    }
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

  isCacheValidAsync: async (config: ServerConfig) => {
    const [liveValid, moviesValid, seriesValid] = await Promise.all([
      useChannelStore.getState().isCacheValidAsyncChannel(config),
      useMovieStore.getState().isCacheValidAsyncMovie(config),
      useSeriesStore.getState().isCacheValidAsyncSeries(config)
    ]);

    return liveValid && moviesValid && seriesValid;
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
