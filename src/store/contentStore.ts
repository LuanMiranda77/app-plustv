import { create } from 'zustand';
import { DEV_MODE } from '../config/devMode';
import type { Channel, Movie, Series, ServerConfig } from '../types';
import { xtreamApi } from '../utils/xtreamApi';
import { CacheService } from '../utils/cacheService';
import { delay, requestWithRetry } from '../utils/nertwork';

interface ContentState {
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  liveCategories: any[];
  vodCategories: any[];
  seriesCategories: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;

  loadFromCache: (config: ServerConfig) => Promise<void>;
  isCacheValidAsync: (config: ServerConfig) => Promise<boolean>;
  clearCache: (config: ServerConfig) => Promise<void>;

  fetchServerContent: (config: ServerConfig, forceRefresh?: boolean) => Promise<void>;
  fetchLiveContent: (config: ServerConfig) => Promise<void>;
  fetchMoviesContent: (config: ServerConfig) => Promise<void>;
  fetchSeriesContent: (config: ServerConfig) => Promise<void>;
}

// ─────────────────────────────────────────────
// MAPPERS (mantidos iguais)
// ─────────────────────────────────────────────
const mapCategory = (cat: any) => ({
  id: String(cat.category_id),
  name: cat.category_name
    .replace('FILMES |', '')
    .replace('Filmes |', '')
    .replace('SÉRIES |', '')
    .replace('Séries |', '')
    .replace('CANAIS |', '')
    .replace('Canais |', '')
});

const mapChannel = (stream: any, config: ServerConfig): Channel => ({
  id: Number(stream.stream_id),
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
  isFavorite: false
});

const mapMovie = (stream: any, config: ServerConfig): Movie => ({
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
  isFavorite: false,
  watched: false,
  progress: 0,
  duration: stream.duration || 0
});

const mapSeries = (stream: any): Series => ({
  id: String(stream.series_id),
  name: stream.name,
  poster: stream.cover || '',
  category: stream.category_id || 'Sem categoria',
  rating: stream.rating || 'N/A',
  isFavorite: false,
  seasons: [],
  loaded: false
});

const findLiveSevice = async (config: ServerConfig) => {
  const categories = await xtreamApi.getLiveCategories(config);
  const liveCatsRaw = categories.map(mapCategory);
  const channels: any[] = [];

  for (const category of categories) {
    await delay(200);

    try {
      const data = await requestWithRetry(() =>
        xtreamApi.getLiveStreams(config, category.category_id)
      );
      // mapear por categoria
      // channels.push(data.flat().map((s: any) => mapChannel(s, config)));

      //listar tudo e mapear depois
      // data.flat().map((s: any) => channels.push(mapChannel(s, config)));
      for (const s of data.flat()) {
        channels.push(mapChannel(s, config));
      }
    } catch {
      console.warn('Erro live categoria:', category.category_id);
    }
  }

  await CacheService.savePartial(
    {
      channels: channels.sort((a: Channel, b: Channel) => a.name.localeCompare(b.name)),
      liveCategories: liveCatsRaw.sort((a: Channel, b: Channel) => a.name.localeCompare(b.name))
    },
    config
  );
  return { channels, liveCatsRaw };
};

const findVodSevice = async (config: ServerConfig) => {
  const categories = await xtreamApi.getVodCategories(config);
  const vodCatsRaw = categories.map(mapCategory);

  const movies: any[] = [];

  for (const category of categories) {
    await delay(300);

    try {
      const data = await requestWithRetry(() =>
        xtreamApi.getVodStreams(config, category.category_id)
      );

      // movies.push(data.flat().map((s: any) => mapMovie(s, config)));
      // data.flat().map((s: any) => movies.push(mapMovie(s, config)));
      for (const s of data.flat()) {
        movies.push(mapMovie(s, config));
      }
    } catch {
      console.warn('Erro VOD categoria:', category.category_id);
    }
  }

  await CacheService.savePartial(
    {
      movies: movies.sort((a: Movie, b: Movie) => a.name.localeCompare(b.name)),
      vodCategories: vodCatsRaw.sort((a: Channel, b: Channel) => a.name.localeCompare(b.name))
    },
    config
  );

  return { movies, vodCatsRaw };
};

const findSeriesSevice = async (config: ServerConfig) => {
  const categories = await xtreamApi.getSeriesCategories(config);
  const seriesCatsRaw = categories.map(mapCategory);

  const series: any[] = [];

  if (Array.isArray(categories)) {
    for (const category of categories) {
      await delay(300); // 🔥 evita flood no servidor

      try {
        const data = await requestWithRetry(() =>
          xtreamApi.getSeries(config, category.category_id)
        );

        if (Array.isArray(data)) {
          // 🔥 LIMITA PRA TV LG
          // series.push(data.flat().map((s: any) => mapSeries(s)));
          // data.flat().map((s: any) => series.push(mapSeries(s)));
          for (const s of data.flat()) {
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

  await CacheService.savePartial(
    {
      series: series.sort((a: Movie, b: Movie) => a.name.localeCompare(b.name)),
      seriesCategories: seriesCatsRaw.sort((a: Channel, b: Channel) => a.name.localeCompare(b.name))
    },
    config
  );

  return { series, seriesCatsRaw };
};

// ─────────────────────────────────────────────

export const useContentStore = create<ContentState>((set, get) => ({
  channels: [],
  movies: [],
  series: [],
  liveCategories: [],
  vodCategories: [],
  seriesCategories: [],
  isLoading: false,
  error: null,
  lastUpdate: null,

  // ─────────────────────────────────────────────
  // CACHE
  // ─────────────────────────────────────────────

  loadFromCache: async config => {
    const cache = await CacheService.load(config);

    if (!cache) return;

    const json = JSON.stringify(cache);
    const bytes = new Blob([json]).size;

    const channels = JSON.stringify(cache.channels);
    const movies = JSON.stringify(cache.movies);
    const series = JSON.stringify(cache.series);

    console.table({
      total: `${(bytes / 1024 / 1024).toFixed(2)}MB`,
      channels: `${(new Blob([channels]).size / 1024 / 1024).toFixed(2)}MB`,
      movies: `${(new Blob([movies]).size / 1024 / 1024).toFixed(2)}MB`,
      series: `${(new Blob([series]).size / 1024 / 1024).toFixed(2)}MB`
    });

    console.log('📦 Cache aplicado na UI');

    set({
      channels: cache.channels || [],
      movies: cache.movies || [],
      series: cache.series || [],
      liveCategories: cache.liveCategories || [],
      vodCategories: cache.vodCategories || [],
      seriesCategories: cache.seriesCategories || [],
      lastUpdate: cache.timestamp || null
    });
  },

  isCacheValidAsync: async config => {
    return CacheService.isValid(config);
  },

  clearCache: async config => {
    await CacheService.clear(config);

    set({
      channels: [],
      movies: [],
      series: [],
      liveCategories: [],
      vodCategories: [],
      seriesCategories: [],
      lastUpdate: null
    });
  },
  // ─────────────────────────────────────────────
  // FETCH INCREMENTAL (🔥 DIFERENCIAL)
  // ─────────────────────────────────────────────

  fetchLiveContent: async config => {
    set({ isLoading: true });

    try {
      const { channels, liveCatsRaw } = await findLiveSevice(config);
      set({ channels, liveCategories: liveCatsRaw, isLoading: false });
    } catch {
      set({ error: 'Erro ao atualizar canais', isLoading: false });
    }
  },

  fetchMoviesContent: async config => {
    set({ isLoading: true });
    const { movies, vodCatsRaw } = await findVodSevice(config);
    try {
      set({ movies, vodCategories: vodCatsRaw, isLoading: false });
    } catch {
      set({ error: 'Erro ao atualizar filmes', isLoading: false });
    }
  },

  fetchSeriesContent: async config => {
    set({ isLoading: true });

    try {
      const { series, seriesCatsRaw } = await findSeriesSevice(config);

      set({ series, seriesCategories: seriesCatsRaw, isLoading: false });
    } catch {
      set({ error: 'Erro ao atualizar séries', isLoading: false });
    }
  },
  // ─────────────────────────────────────────────
  // FETCH COMPLETO
  // ─────────────────────────────────────────────

  fetchServerContent: async (config, forceRefresh = false) => {
    console.log('🚀 fetchServerContent');

    // ── DEV_MODE ──────────────────────────────────────────────────────────
    if (!DEV_MODE) {
      console.log('🛠️ DEV_MODE ativo — carregando dados mock...');
      set({ isLoading: true, error: null });
      try {
        const [
          { default: channelsMock },
          { default: moviesMock },
          { default: seriesMock },
          { categoriasMoveisMock, categoraiesSeriesMock, categoriesLiveMock }
        ] = await Promise.all([
          import('../data/channel_ex.json'),
          import('../data/movie_ex.json'),
          import('../data/series_ex.json'),
          import('../data/mockData')
        ]);

        const channels = channelsMock.map((s: any) => mapChannel(s, config));
        const movies = moviesMock.map((s: any) => mapMovie(s, config));
        const series = seriesMock.map(mapSeries);
        const liveCategories = categoriesLiveMock.map(mapCategory);
        const vodCategories = categoriasMoveisMock.map(mapCategory);
        const seriesCategories = categoraiesSeriesMock.map(mapCategory);

        console.log('✅ Mock carregado:', {
          canais: channels.length,
          filmes: movies.length,
          series: series.length
        });
        set({
          channels,
          movies,
          series,
          liveCategories,
          vodCategories,
          seriesCategories,
          lastUpdate: Date.now(),
          isLoading: false
        });
      } catch (err) {
        console.error('❌ Erro ao carregar mock:', err);
        set({ error: 'Erro ao carregar dados mock', isLoading: false });
      }
      return;
    }

    // ── Cache válido? Usar cache ───────────────────────────────────────────
    if (!forceRefresh && (await get().isCacheValidAsync(config))) {
      console.log('✅ usando cache');
      await get().loadFromCache(config);
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 🔥 inicia tudo em paralelo
      const livePromise = findLiveSevice(config);
      const vodPromise = findVodSevice(config);
      const seriesPromise = findSeriesSevice(config);

      // 🔥 atualiza UI conforme chega
      livePromise.then(({ channels, liveCatsRaw }) => {
        set({ channels, liveCategories: liveCatsRaw });
      });

      vodPromise.then(({ movies, vodCatsRaw }) => {
        set({ movies, vodCategories: vodCatsRaw });
      });

      seriesPromise.then(({ series, seriesCatsRaw }) => {
        set({ series, seriesCategories: seriesCatsRaw });
      });

      // 🔥 espera tudo terminar
      const [{ channels, liveCatsRaw }, { movies, vodCatsRaw }, { series, seriesCatsRaw }] =
        await Promise.all([livePromise, vodPromise, seriesPromise]);

      const data = {
        channels,
        movies,
        series,
        liveCategories: liveCatsRaw,
        vodCategories: vodCatsRaw,
        seriesCategories: seriesCatsRaw
      };

      await CacheService.saveFull(data, config);

      set({
        ...data,
        lastUpdate: Date.now(),
        isLoading: false
      });
    } catch (err) {
      console.error(err);
      set({ error: 'Erro ao carregar conteúdo', isLoading: false });
    }
  }
}));
