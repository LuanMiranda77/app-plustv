import { create } from 'zustand';
import { DEV_MODE } from '../config/devMode';
import type { Channel, Movie, Series, ServerConfig } from '../types';
import { indexedDbStorage } from '../utils/indexedDbStorage';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { xtreamApi } from '../utils/xtreamApi';

interface ContentState {
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  liveCategories: Array<{ id: string; name: string }>;
  vodCategories: Array<{ id: string; name: string }>;
  seriesCategories: Array<{ id: string; name: string }>;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;

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
  isCacheValid: () => boolean;
  isCacheValidAsync: (config?: ServerConfig) => Promise<boolean>;
  fetchServerContent: (config: ServerConfig, forceRefresh?: boolean) => Promise<void>;
  fetchLiveContent: (config: ServerConfig) => Promise<void>;
  fetchMoviesContent: (config: ServerConfig) => Promise<void>;
  fetchSeriesContent: (config: ServerConfig) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getServerId = (config: ServerConfig) => `${config.url}|${config.username}`;

const mapChannel = (stream: any, config: ServerConfig): Channel => ({
  id: Number(stream.stream_id),
  name: stream.name,
  logo: stream.stream_icon || '',
  streamUrl: xtreamApi.buildStreamUrl(
    config.url, config.username, config.password,
    stream.stream_id, stream.stream_type || 'live'
  ),
  category: stream.category_id || 'Sem categoria',
  isFavorite: false,
});

const mapMovie = (stream: any, config: ServerConfig): Movie => ({
  id: String(stream.stream_id),
  name: stream.name,
  poster: stream.stream_icon || '',
  streamUrl: xtreamApi.buildStreamUrl(
    config.url, config.username, config.password,
    stream.stream_id, stream.stream_type || 'movie'
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
});

const mapSeries = (stream: any): Series => ({
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
});

const mapCategory = (cat: any) => ({
  id: String(cat.category_id),
  name: cat.category_name,
});

// ── Buscar categorias em lotes paralelos ──────────────────────────────────────
// Substitui o for...of sequencial do getAllContent por Promise.all em lotes
// O xtreamApi já busca por categoria — só precisamos paralelizar
const fetchCategoriesInBatches = async <T>(
  categories: any[],
  fetchFn: (categoryId: string) => Promise<any[]>,
  mapFn: (item: any) => T,
  batchSize = 5
): Promise<T[]> => {
  const results: T[] = []
  const total = Math.ceil(categories.length / batchSize)

  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize)
    const current = Math.floor(i / batchSize) + 1

    console.log(`📦 Lote ${current}/${total} — ${batch.map((c: any) => c.category_name || c.name).join(', ')}`)

    const batchResults = await Promise.all(
      batch.map(async (cat: any) => {
        try {
          const items = await fetchFn(cat.category_id || cat.id)
          return Array.isArray(items) ? items.map(mapFn) : []
        } catch (err) {
          console.warn(`⚠️ Categoria "${cat.category_name}" falhou — pulando`)
          return []
        }
      })
    )

    results.push(...batchResults.flat())
    console.log(`✅ ${results.length} itens acumulados`)
  }

  // Remover duplicatas pelo id
  const seen = new Set<string>()
  return results.filter(item => {
    const id = String((item as any).id)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

// ── Salva cache completo ──────────────────────────────────────────────────────
const saveFullCache = (
  channels: Channel[],
  movies: Movie[],
  series: Series[],
  liveCategories: any[],
  vodCategories: any[],
  seriesCategories: any[],
  config: ServerConfig
): number => {
  const timestamp = Date.now()
  indexedDbStorage
    .set('playlist_cache', {
      channels, movies, series,
      liveCategories, vodCategories, seriesCategories,
      timestamp, serverId: getServerId(config),
    })
    .catch(err => console.error('❌ Erro ao salvar no IndexedDB:', err))
  storage.set(STORAGE_KEYS.PLAYLIST_CACHE, { timestamp })
  return timestamp
}

// ── Salva cache por tipo — substitui APENAS o tipo atualizado ─────────────────
const saveCacheByType = async (
  data: {
    channels?: Channel[]
    movies?: Movie[]
    series?: Series[]
    liveCategories?: any[]
    vodCategories?: any[]
    seriesCategories?: any[]
  },
  config: ServerConfig
): Promise<number> => {
  const current: any = (await indexedDbStorage.get('playlist_cache')) || {}
  const timestamp = Date.now()

  const updated = {
    channels:         current.channels         || [],
    movies:           current.movies           || [],
    series:           current.series           || [],
    liveCategories:   current.liveCategories   || [],
    vodCategories:    current.vodCategories    || [],
    seriesCategories: current.seriesCategories || [],
    ...data,
    timestamp,
    serverId: getServerId(config),
  }

  await indexedDbStorage
    .set('playlist_cache', updated)
    .catch(err => console.error('❌ Erro ao salvar cache por tipo:', err))
  storage.set(STORAGE_KEYS.PLAYLIST_CACHE, { timestamp })
  return timestamp
}

// ─────────────────────────────────────────────────────────────────────────────

const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE)

export const useContentStore = create<ContentState>((set, get) => ({
  channels:         cached?.channels         || [],
  movies:           cached?.movies           || [],
  series:           cached?.series           || [],
  liveCategories:   cached?.liveCategories   || [],
  vodCategories:    cached?.vodCategories    || [],
  seriesCategories: cached?.seriesCategories || [],
  isLoading: false,
  error: null,
  lastUpdate: cached?.timestamp || null,

  // ── Setters ───────────────────────────────────────────────────────────────

  setChannels: channels => {
    const s = get()
    saveFullCache(channels, s.movies, s.series, s.liveCategories, s.vodCategories, s.seriesCategories, s as any)
    set({ channels })
  },
  setMovies: movies => {
    const s = get()
    saveFullCache(s.channels, movies, s.series, s.liveCategories, s.vodCategories, s.seriesCategories, s as any)
    set({ movies })
  },
  setSeries: series => {
    const s = get()
    saveFullCache(s.channels, s.movies, series, s.liveCategories, s.vodCategories, s.seriesCategories, s as any)
    set({ series })
  },
  setLiveCategories: liveCategories => {
    const s = get()
    saveFullCache(s.channels, s.movies, s.series, liveCategories, s.vodCategories, s.seriesCategories, s as any)
    set({ liveCategories })
  },
  setVodCategories: vodCategories => {
    const s = get()
    saveFullCache(s.channels, s.movies, s.series, s.liveCategories, vodCategories, s.seriesCategories, s as any)
    set({ vodCategories })
  },
  setSeriesCategories: seriesCategories => {
    const s = get()
    saveFullCache(s.channels, s.movies, s.series, s.liveCategories, s.vodCategories, seriesCategories, s as any)
    set({ seriesCategories })
  },
  setLoading: loading => set({ isLoading: loading }),
  setError: error => set({ error }),

  // ── Cache ─────────────────────────────────────────────────────────────────

  isCacheValid: () => {
    const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE)
    if (!cached?.timestamp) return false
    const CACHE_DURATION = 72 * 60 * 60 * 1000
    return Date.now() - cached.timestamp < CACHE_DURATION
  },

  isCacheValidAsync: async (config?: ServerConfig) => {
    const cached: any = await indexedDbStorage.get('playlist_cache')
    if (!cached?.timestamp) return false
    if (config && cached.serverId && cached.serverId !== getServerId(config)) return false
    const CACHE_DURATION = 72 * 60 * 60 * 1000
    const cacheAge = Date.now() - cached.timestamp
    const hoursRemaining = ((CACHE_DURATION - cacheAge) / (1000 * 60 * 60)).toFixed(1)
    const isValid = cacheAge < CACHE_DURATION
    console.log(`📦 Cache age: ${(cacheAge / (1000 * 60 * 60)).toFixed(1)}h | Válido por mais: ${hoursRemaining}h`)
    console.log(isValid ? '✅ Cache VÁLIDO' : '❌ Cache EXPIRADO')
    return isValid
  },

  loadFromCache: async () => {
    let cached: any = await indexedDbStorage.get('playlist_cache')
    if (!cached) cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE)
    if (cached) {
      console.log('✅ Cache carregado com sucesso!')
      set({
        channels:         cached.channels         || [],
        movies:           cached.movies           || [],
        series:           cached.series           || [],
        liveCategories:   cached.liveCategories   || [],
        vodCategories:    cached.vodCategories    || [],
        seriesCategories: cached.seriesCategories || [],
        lastUpdate:       cached.timestamp        || null,
      })
    }
  },

  clearCache: async () => {
    storage.remove(STORAGE_KEYS.PLAYLIST_CACHE)
    await indexedDbStorage.remove('playlist_cache')
    set({
      channels: [], movies: [], series: [],
      liveCategories: [], vodCategories: [], seriesCategories: [],
      lastUpdate: null,
    })
  },

  // ── Fetch canais ao vivo ──────────────────────────────────────────────────

  fetchLiveContent: async (config: ServerConfig) => {
    console.log('📡 Atualizando canais ao vivo...')
    set({ isLoading: true, error: null })
    try {
      const liveCategories = await xtreamApi.getLiveCategories(config)
      console.log(`📂 ${liveCategories.length} categorias de canais`)

      const channels = await fetchCategoriesInBatches(
        liveCategories,
        (catId) => xtreamApi.getLiveStreams(config, catId),
        (s: any) => mapChannel(s, config),
        5
      )

      const cats = liveCategories.map(mapCategory)
      const timestamp = await saveCacheByType({ channels, liveCategories: cats }, config)
      set({ channels, liveCategories: cats, lastUpdate: timestamp, isLoading: false })
      console.log(`✅ Canais atualizados: ${channels.length}`)
    } catch (err) {
      console.error('❌ Erro ao atualizar canais:', err)
      set({ error: 'Erro ao atualizar canais', isLoading: false })
    }
  },

  // ── Fetch filmes por categoria ────────────────────────────────────────────

  fetchMoviesContent: async (config: ServerConfig) => {
    console.log('📡 Atualizando filmes por categoria...')
    set({ isLoading: true, error: null })
    try {
      const vodCategories = await xtreamApi.getVodCategories(config)
      console.log(`📂 ${vodCategories.length} categorias de filmes`)

      const movies = await fetchCategoriesInBatches(
        vodCategories,
        (catId) => xtreamApi.getVodStreams(config, catId),
        (s: any) => mapMovie(s, config),
        5
      )

      const cats = vodCategories.map(mapCategory)
      const timestamp = await saveCacheByType({ movies, vodCategories: cats }, config)
      set({ movies, vodCategories: cats, lastUpdate: timestamp, isLoading: false })
      console.log(`✅ Filmes atualizados: ${movies.length}`)
    } catch (err) {
      console.error('❌ Erro ao atualizar filmes:', err)
      set({ error: 'Erro ao atualizar filmes', isLoading: false })
    }
  },

  // ── Fetch séries por categoria ────────────────────────────────────────────

  fetchSeriesContent: async (config: ServerConfig) => {
    console.log('📡 Atualizando séries por categoria...')
    set({ isLoading: true, error: null })
    try {
      const seriesCategories = await xtreamApi.getSeriesCategories(config)
      console.log(`📂 ${seriesCategories.length} categorias de séries`)

      const series = await fetchCategoriesInBatches(
        seriesCategories,
        (catId) => xtreamApi.getSeries(config, catId),
        mapSeries,
        5
      )

      const cats = seriesCategories.map(mapCategory)
      const timestamp = await saveCacheByType({ series, seriesCategories: cats }, config)
      set({ series, seriesCategories: cats, lastUpdate: timestamp, isLoading: false })
      console.log(`✅ Séries atualizadas: ${series.length}`)
    } catch (err) {
      console.error('❌ Erro ao atualizar séries:', err)
      set({ error: 'Erro ao atualizar séries', isLoading: false })
    }
  },

  // ── Fetch tudo ────────────────────────────────────────────────────────────

  fetchServerContent: async (config: ServerConfig, forceRefresh = false) => {
    console.log('📡 fetchServerContent iniciado:', config.url)

    // ── DEV_MODE ──────────────────────────────────────────────────────────
    if (DEV_MODE) {
      console.log('🛠️ DEV_MODE ativo — carregando dados mock...')
      set({ isLoading: true, error: null })
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
          import('../data/mockData'),
        ])

        const channels         = channelsMock.map((s: any) => mapChannel(s, config))
        const movies           = moviesMock.map((s: any) => mapMovie(s, config))
        const series           = seriesMock.map(mapSeries)
        const liveCategories   = categoriesLiveMock.map(mapCategory)
        const vodCategories    = categoriasMoveisMock.map(mapCategory)
        const seriesCategories = categoraiesSeriesMock.map(mapCategory)

        console.log('✅ Mock carregado:', { canais: channels.length, filmes: movies.length, series: series.length })
        set({ channels, movies, series, liveCategories, vodCategories, seriesCategories, lastUpdate: Date.now(), isLoading: false })
      } catch (err) {
        console.error('❌ Erro ao carregar mock:', err)
        set({ error: 'Erro ao carregar dados mock', isLoading: false })
      }
      return
    }

    // ── Servidor diferente? Limpar cache ──────────────────────────────────
    const cachedRaw: any = await indexedDbStorage.get('playlist_cache')
    if (cachedRaw?.serverId && cachedRaw.serverId !== getServerId(config)) {
      console.log('🔄 Servidor trocado! Limpando cache antigo...')
      await get().clearCache()
    }

    // ── Cache válido? Usar cache ───────────────────────────────────────────
    if (!forceRefresh && (await get().isCacheValidAsync(config))) {
      console.log('✅ Cache válido, carregando...')
      get().loadFromCache()
      return
    }

    set({ isLoading: true, error: null })
    try {
      // 1. Buscar todas as categorias em paralelo
      console.log('📡 Buscando categorias...')
      const [liveCategoriesRaw, vodCategoriesRaw, seriesCategoriesRaw] = await Promise.all([
        xtreamApi.getLiveCategories(config),
        xtreamApi.getVodCategories(config),
        xtreamApi.getSeriesCategories(config),
      ])

      console.log(`📂 ${liveCategoriesRaw.length} live | ${vodCategoriesRaw.length} filmes | ${seriesCategoriesRaw.length} séries`)

      // 2. Buscar streams por categoria em lotes — tudo em paralelo entre os 3 tipos
      console.log('📡 Buscando streams por categoria em lotes...')
      const [channels, movies, series] = await Promise.all([
        fetchCategoriesInBatches(
          liveCategoriesRaw,
          (catId) => xtreamApi.getLiveStreams(config, catId),
          (s: any) => mapChannel(s, config),
          5
        ),
        fetchCategoriesInBatches(
          vodCategoriesRaw,
          (catId) => xtreamApi.getVodStreams(config, catId),
          (s: any) => mapMovie(s, config),
          5
        ),
        fetchCategoriesInBatches(
          seriesCategoriesRaw,
          (catId) => xtreamApi.getSeries(config, catId),
          mapSeries,
          5
        ),
      ])

      const liveCats   = liveCategoriesRaw.map(mapCategory)
      const vodCats    = vodCategoriesRaw.map(mapCategory)
      const seriesCats = seriesCategoriesRaw.map(mapCategory)

      console.log(`✅ Total: ${channels.length} canais | ${movies.length} filmes | ${series.length} séries`)

      const timestamp = saveFullCache(channels, movies, series, liveCats, vodCats, seriesCats, config)
      set({
        channels, movies, series,
        liveCategories: liveCats,
        vodCategories: vodCats,
        seriesCategories: seriesCats,
        lastUpdate: timestamp,
        isLoading: false,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao buscar conteúdo'
      console.error('❌ Erro ao buscar conteúdo:', error)

      const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE)
      if (cached) {
        set({
          channels:         cached.channels         || [],
          movies:           cached.movies           || [],
          series:           cached.series           || [],
          liveCategories:   cached.liveCategories   || [],
          vodCategories:    cached.vodCategories    || [],
          seriesCategories: cached.seriesCategories || [],
          lastUpdate:       cached.timestamp        || null,
          isLoading: false,
          error: msg + ' (mostrando dados em cache)',
        })
      } else {
        set({ error: msg, isLoading: false })
      }
    }
  },
}))
