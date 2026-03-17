import { create } from 'zustand'
import type { Channel, Movie, Series, ServerConfig } from '../types'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { xtreamApi } from '../utils/xtreamApi'

interface ContentState {
  // Content
  channels: Channel[]
  movies: Movie[]
  series: Series[]
  
  // Categories
  liveCategories: Array<{ id: string; name: string }>
  vodCategories: Array<{ id: string; name: string }>
  seriesCategories: Array<{ id: string; name: string }>
  
  // Loading states
  isLoading: boolean
  error: string | null
  lastUpdate: number | null // timestamp do último update
  
  // Actions
  setChannels: (channels: Channel[]) => void
  setMovies: (movies: Movie[]) => void
  setSeries: (series: Series[]) => void
  setLiveCategories: (categories: Array<{ id: string; name: string }>) => void
  setVodCategories: (categories: Array<{ id: string; name: string }>) => void
  setSeriesCategories: (categories: Array<{ id: string; name: string }>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  loadFromCache: () => void
  clearCache: () => void
  isCacheValid: () => boolean // Verifica se cache é válido (menos de 24h)
  fetchServerContent: (config: ServerConfig, forceRefresh?: boolean) => Promise<void>
}

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

  setChannels: (channels) => {
    storage.set(STORAGE_KEYS.PLAYLIST_CACHE, {
      channels,
      timestamp: Date.now(),
    })
    set({ channels })
  },

  setMovies: (movies) => {
    set({ movies })
  },

  setSeries: (series) => {
    set({ series })
  },

  setLiveCategories: (categories) => {
    set({ liveCategories: categories })
  },

  setVodCategories: (categories) => {
    set({ vodCategories: categories })
  },

  setSeriesCategories: (categories) => {
    set({ seriesCategories: categories })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error })
  },

  isCacheValid: () => {
    const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE)
    if (!cached || !cached.timestamp) return false
    
    // 24 horas em milissegundos
    const CACHE_DURATION = 24 * 60 * 60 * 1000
    const now = Date.now()
    const cacheAge = now - cached.timestamp
    
    return cacheAge < CACHE_DURATION
  },

  loadFromCache: () => {
    const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE)
    if (cached) {
      set({
        channels: cached.channels || [],
        movies: cached.movies || [],
        series: cached.series || [],
        liveCategories: cached.liveCategories || [],
        vodCategories: cached.vodCategories || [],
        seriesCategories: cached.seriesCategories || [],
        lastUpdate: cached.timestamp || null,
      })
    }
  },

  clearCache: () => {
    storage.remove(STORAGE_KEYS.PLAYLIST_CACHE)
    set({ 
      channels: [], 
      movies: [], 
      series: [],
      liveCategories: [],
      vodCategories: [],
      seriesCategories: [],
      lastUpdate: null,
    })
  },

  fetchServerContent: async (config: ServerConfig, forceRefresh = false) => {
    // Se cache é válido e não está forçando refresh, usar cache
    if (!forceRefresh && get().isCacheValid()) {
      get().loadFromCache()
      return
    }

    set({ isLoading: true, error: null })
    try {
      const data = await xtreamApi.getAllContent(config)

      // Converter live streams para Channel
      const channels: Channel[] = data.liveStreams.map((stream: any) => ({
        id: String(stream.stream_id),
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
      }))

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
        isFavorite: false,
      }))

      // Converter séries para Series
      const series: Series[] = data.seriesStreams.map((stream: any) => ({
        id: String(stream.series_id),
        name: stream.name,
        poster: stream.cover || stream.series_cover || '',
        category: stream.category_id || 'Sem categoria',
        isFavorite: false,
        seasons: [
          {
            number: 1,
            episodes: [
              {
                id: String(stream.series_id),
                name: stream.name,
                number: 1,
                streamUrl: xtreamApi.buildStreamUrl(
                  config.url,
                  config.username,
                  config.password,
                  stream.series_id,
                  'series'
                ),
                watched: false,
                progress: 0,
              },
            ],
          },
        ],
      }))

      // Converter categorias
      const liveCategories = data.liveCategories.map((cat: any) => ({
        id: String(cat.category_id),
        name: cat.category_name,
      }))

      const vodCategories = data.vodCategories.map((cat: any) => ({
        id: String(cat.category_id),
        name: cat.category_name,
      }))

      const seriesCategories = data.seriesCategories.map((cat: any) => ({
        id: String(cat.series_id),
        name: cat.name,
      }))

      const timestamp = Date.now()

      // Salvar em cache com todas as informações
      storage.set(STORAGE_KEYS.PLAYLIST_CACHE, {
        channels,
        movies,
        series,
        liveCategories,
        vodCategories,
        seriesCategories,
        timestamp,
      })

      set({
        channels,
        movies,
        series,
        liveCategories,
        vodCategories,
        seriesCategories,
        lastUpdate: timestamp,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar conteúdo'
      console.error('Erro ao buscar conteúdo do servidor:', error)
      
      // Se houver erro, tentar carregar do cache mesmo que expirado
      const cached = storage.get(STORAGE_KEYS.PLAYLIST_CACHE)
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
        })
      } else {
        set({ error: errorMessage, isLoading: false })
      }
    }
  },
}))
